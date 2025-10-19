import React from "react";

export default function MessageBubble({ text, isUser }) {
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all`}
    >
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md backdrop-blur-md
          ${
            isUser
              ? "bg-gradient-to-tr from-pink-500/40 to-fuchsia-500/40 text-white rounded-br-none"
              : "bg-white/10 text-white rounded-bl-none border border-white/10"
          }`}
      >
        {text}
      </div>
    </div>
  );
}
