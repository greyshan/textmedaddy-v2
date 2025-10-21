// src/components/chat/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getAIResponse } from "../../utils/aiModels";
import { supabase } from "../../supabaseClient";

const MESSAGE_EXPIRY_HOURS = 48; // 💥 Auto-delete after 48 hours

// Utility: Check if a message is expired
const isMessageExpired = (timestamp) => {
  const age = Date.now() - timestamp;
  return age > MESSAGE_EXPIRY_HOURS * 60 * 60 * 1000;
};

// Utility: Clean old messages
const cleanExpiredMessages = (messages) =>
  messages.filter((msg) => !isMessageExpired(msg.timestamp));

export default function Chat({ selectedChat, onOpenDetails }) {
  const [model, setModel] = useState("openai");
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Fetch logged-in user ID once
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch messages for current chat + enable realtime updates
  useEffect(() => {
    if (!selectedChat?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data);
    };
    fetchMessages();

    // ✅ Realtime updates
    const channel = supabase
      .channel(`messages-${selectedChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle sending messages
  const handleSend = async (text) => {
    if (!text.trim()) return;

    // ✅ For normal chat
    if (selectedChat?.id && selectedChat !== "AI") {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Insert new message into Supabase
        const { error } = await supabase.from("messages").insert([
          {
            chat_id: selectedChat.id,
            sender_id: user.id,
            content: text,
          },
        ]);

        if (error) throw error;

        // Update chat preview
        await supabase
          .from("chats")
          .update({
            last_message: text,
            last_message_time: new Date(),
          })
          .eq("id", selectedChat.id);

        // Optimistic UI
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            chat_id: selectedChat.id,
            sender_id: user.id,
            content: text,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error("❌ Send error:", err);
      }
      return;
    }

    // ✅ For AI chat
    const newMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // 💾 Update localStorage
    if (userId) {
      const cleaned = cleanExpiredMessages([...messages, newMessage]);
      localStorage.setItem(
        `ai_chat_${model}_${userId}`,
        JSON.stringify(cleaned)
      );
    }

    if (selectedChat === "AI") {
      setLoading(true);
      try {
        const reply = await getAIResponse(model, text, messages);
        const aiMessage = {
          id: Date.now() + 1,
          text: reply,
          isUser: false,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error("AI error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "⚠️ AI is offline right now.",
            isUser: false,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ No chat selected
  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chat to start messaging 💬
      </div>
    );
  }

  // ✅ AI Chat UI
  if (selectedChat === "AI") {
    return (
      <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10 text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="font-semibold text-lg">🤖 AI Chat</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-sm rounded-lg p-1 text-black"
          >
            <option value="nemotron">NVIDIA Nemotron</option>
            <option value="openai">🧠 GPT-4 (OpenAI)</option>
            <option value="llama">🐪 LLaMA 3</option>
            <option value="deepseek">🕵 DeepSeek</option>
          </select>
        </div>

        <div className="text-center text-xs text-white/70 bg-white/5 border-b border-white/10 py-1">
          ⚠️ AI responses may be inaccurate. Chats auto-delete after 48h.
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] p-3 my-1 rounded-2xl ${
                  msg.isUser
                    ? "bg-pink-600/80 text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-center text-gray-400">
              🤖 {model} is thinking...
            </p>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="px-3 py-3 bg-transparent">
          <div className="bg-white/15 border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,192,203,0.2)]">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Regular user chat
  const name = selectedChat?.name || "Unknown User";
  const profile = selectedChat?.profile_pic || "/assets/images/defaultUser.png";
  const status = selectedChat?.status || "Offline";

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10 text-white">
      <ChatHeader
        selectedChat={{ name, profile_pic: profile, status }}
        onOpenDetails={onOpenDetails}
      />

      <div className="text-center text-xs text-white/70 bg-white/5 border-b border-white/10 py-1">
        ⚠️ Chats auto-delete after 48 hours for your privacy.
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] p-3 my-1 rounded-2xl ${
                msg.sender_id === userId
                  ? "bg-pink-600/80 text-white"
                  : "bg-white/20 text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="px-3 py-3 bg-transparent">
        <div className="bg-white/15 border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,192,203,0.2)]">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
