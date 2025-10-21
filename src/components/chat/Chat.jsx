// src/components/chat/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getAIResponse } from "../../utils/aiModels";
import { supabase } from "../../supabaseClient"; // ✅ Import Supabase for user ID

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
  const [model, setModel] = useState("openai"); // ✅ Default model now OpenAI
  const [userId, setUserId] = useState("guest"); // ✅ Each user gets isolated chat
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

  // ✅ Load stored chat for this user + model
  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`ai_chat_${model}_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(cleanExpiredMessages(parsed));
    } else {
      setMessages([]);
    }
  }, [model, userId]);

  // 💾 Auto-save messages + cleanup for this specific user
  useEffect(() => {
    if (!userId) return;
    const cleaned = cleanExpiredMessages(messages);
    localStorage.setItem(`ai_chat_${model}_${userId}`, JSON.stringify(cleaned));
  }, [messages, model, userId]);

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle message send
  const handleSend = async (text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

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

  // ✅ AI chat window
  if (selectedChat === "AI") {
    return (
      <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10 text-white">
        {/* 🧠 Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="font-semibold text-lg">🤖 AI Chat</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-sm rounded-lg p-1 text-black"
          >
            <option value="nemotron"> Nemotron (NVIDIA)</option>
            <option value="openai">🧠 GPT-4 (OpenAI)</option>
            <option value="llama">🐪 LLaMA 3</option>
            <option value="deepseek">🕵️ DeepSeek</option>
          </select>
        </div>

        {/* ⚠️ AI Warning */}
        <div className="text-center text-xs text-white/70 bg-white/5 backdrop-blur-md border-b border-white/10 py-1">
          ⚠️ AI responses may be inaccurate or outdated. Chats auto-delete after 48 hours.
        </div>

        {/* 💬 Messages */}
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

        {/* ✍️ Input */}
        <div className="px-3 py-3 bg-transparent">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,192,203,0.2)]">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal chat window
  const name = selectedChat?.name || "Unknown User";
  const profile = selectedChat?.profile_pic || "/assets/images/defaultUser.png";
  const status = selectedChat?.status || "Offline";

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10 text-white">
      <ChatHeader
        selectedChat={{ name, profile_pic: profile, status }}
        onOpenDetails={onOpenDetails}
      />

      <div className="text-center text-xs text-white/70 bg-white/5 backdrop-blur-md border-b border-white/10 py-1">
        ⚠️ Chats auto-delete after 48 hours for your privacy.
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
        <div ref={messagesEndRef}></div>
      </div>

      <div className="px-3 py-3 bg-transparent">
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,192,203,0.2)]">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
