import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function Chat({ selectedChat, onOpenDetails }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there! 👋", isUser: false },
    { id: 2, text: "Hi! How’s your day going?", isUser: true },
    { id: 3, text: "Pretty good, just working on a project.", isUser: false },
    { id: 4, text: "Nice! What are you working on?", isUser: true },
    { id: 5, text: "Building a new chat app — TEXTmeDaddy 😺", isUser: false },
    { id: 6, text: "That sounds awesome!", isUser: true },
    { id: 7, text: "Yup, going for a glassy UI vibe 💎", isUser: false },
    { id: 8, text: "Love that aesthetic 😍", isUser: true },
    { id: 9, text: "Smooth gradients and glow everywhere ✨", isUser: false },
    { id: 10, text: "Hahaha you’re obsessed 😂", isUser: true },
  ]);

  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Add new user message
  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, isUser: true },
    ]);
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chat to start messaging 💬
      </div>
    );
  }

  // ✅ Optional chaining & defaults (to avoid object render issues)
  const name = selectedChat?.name || "Unknown User";
  const profile = selectedChat?.profile_pic || "/assets/images/defaultUser.png";
  const status = selectedChat?.status || "Offline";

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10">
      {/* Header */}
      <ChatHeader
        selectedChat={{ name, profile_pic: profile, status }}
        onOpenDetails={onOpenDetails}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      {/* 🪩 Floating Glass Input Bar */}
<div className="px-3 py-3 bg-transparent">
  <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,192,203,0.2)]">
    <ChatInput onSend={handleSend} />
  </div>
</div>
    </div>
  );
}
