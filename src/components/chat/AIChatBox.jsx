// src/components/chat/AIChatBox.jsx
import React, { useState } from "react";
import { getAIResponse } from "../../utils/aiModels";
import { FiSend } from "react-icons/fi";

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey 👋! I can use Gemini, OpenAI, LLaMA, or DeepSeek. Pick a model below and start chatting!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gemini"); // default model

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await getAIResponse(model, userMsg.text);
      setMessages((prev) => [...prev, { sender: "bot", text: aiReply }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Oops, something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg text-white p-4">
      {/* 💬 Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 custom-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-pink-600/80 text-white"
                  : "bg-white/20 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-center text-gray-400">🤖 {model} is thinking...</p>
        )}
      </div>

      {/* ⚙️ Model Selector */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-300">AI Model:</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg p-1 text-sm outline-none"
        >
          <option value="gemini">🌟 Gemini</option>
          <option value="openai">🧠 GPT-4 (OpenAI)</option>
          <option value="llama">🐪 LLaMA 3</option>
          <option value="deepseek">🕵️ DeepSeek</option>
        </select>
      </div>

      {/* ✍️ Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 outline-none text-white placeholder-gray-400"
          placeholder={`Ask ${model} something...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 p-3 rounded-full transition-all"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}
