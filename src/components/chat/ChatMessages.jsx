import React from "react";
import MessageBubble from "./MessageBubble";

export default function ChatMessages({ messages, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} text={msg.text} isUser={msg.isUser} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
