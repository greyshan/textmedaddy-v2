import React, { useState, useRef, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there! 🤖 I'm MeowAI, your assistant.", isUser: false },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now(), text, isUser: true };
    setMessages((prev) => [...prev, newMsg]);

    
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        text: "Meow! 🐾 I'm thinking about your question...",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/10 backdrop-blur-lg">
        <img
          src="/assets/images/bot.png"
          alt="AI Bot"
          className="w-10 h-10 rounded-full border border-white/20 shadow-[0_0_12px_#3b82f6]"
        />
        <div>
          <div className="text-sm font-semibold">MeowAI Assistant</div>
          <div className="text-xs text-white/60">Always here to chat 💬</div>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
