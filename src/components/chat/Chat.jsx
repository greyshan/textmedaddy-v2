import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function Chat({ selectedChat }) {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hey there! 👋", isUser: false },
        { id: 2, text: "Hi! How’s your day going?", isUser: true },
        { id: 3, text: "Pretty good, just working on a project.", isUser: false },
        { id: 4, text: "Nice! What are you working on?", isUser: true },
        { id: 5, text: "Building a new chat app — Meow Meow 😺", isUser: false },
        { id: 6, text: "That sounds awesome!", isUser: true },
        { id: 7, text: "Yup, going for a glassy UI vibe 💎", isUser: false },
        { id: 8, text: "Love that aesthetic 😍", isUser: true },
        { id: 9, text: "Smooth gradients and glow everywhere ✨", isUser: false },
        { id: 10, text: "Hahaha you’re obsessed 😂", isUser: true },
        { id: 11, text: "Maybe! 😅", isUser: false },
        { id: 12, text: "By the way, did you test the scrollbar?", isUser: true },
        { id: 13, text: "Yep, smooth and glowing 🔵", isUser: false },
        { id: 14, text: "Perfect! I’ll add animations next.", isUser: true },
        { id: 15, text: "Framer Motion time! 💃", isUser: false },
        { id: 16, text: "Haha exactly!", isUser: true },
        { id: 17, text: "Do you want me to test 30 messages?", isUser: false },
        { id: 18, text: "Yep, let's fill the chat up.", isUser: true },
        { id: 19, text: "Alright, message spam incoming... 📨", isUser: false },
        { id: 20, text: "Bring it on! 😂", isUser: true },
        { id: 21, text: "Just making sure the auto-scroll works.", isUser: false },
        { id: 22, text: "It should auto-scroll smoothly, right?", isUser: true },
        { id: 23, text: "Absolutely, using useRef with smooth behavior.", isUser: false },
        { id: 24, text: "Great, love the detail!", isUser: true },
        { id: 25, text: "We’ll polish the chat bubbles next.", isUser: false },
        { id: 26, text: "And then work on Firebase integration 🔥", isUser: true },
        { id: 27, text: "Yep! That’ll make it a real app.", isUser: false },
        { id: 28, text: "Can’t wait to see it live.", isUser: true },
        { id: 29, text: "Almost there... 💪", isUser: false },
        { id: 30, text: "Done! 30 messages loaded 🎉", isUser: true },
      ]);

  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text, isUser: true }]);
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-x border-white/10">
      <ChatHeader />
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
