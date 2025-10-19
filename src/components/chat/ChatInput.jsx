import React, { useState } from "react";
import { FiSend, FiImage, FiMic, FiSmile } from "react-icons/fi";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="p-3 border-t border-white/10 bg-white/10 backdrop-blur-lg flex items-center gap-3">
      <button className="p-2 rounded-lg hover:bg-white/10 transition">
        <FiImage className="text-white/70" size={18} />
      </button>
      <button className="p-2 rounded-lg hover:bg-white/10 transition">
        <FiMic className="text-white/70" size={18} />
      </button>
      <div className="flex-1 relative">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full bg-white/10 text-sm rounded-xl px-3 py-2 outline-none resize-none text-white placeholder:text-white/50 border border-white/10 backdrop-blur-md"
        />
      </div>
      <button
        onClick={() => {
          onSend(text);
          setText("");
        }}
        className="p-2 rounded-lg hover:bg-pink-500/30 transition text-white"
      >
        <FiSend size={18} />
      </button>
    </div>
  );
}
