import React from "react";
import ReactMarkdown from "react-markdown";

export default function ChatMessages({ messages, messagesEndRef }) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.isUser ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-2xl shadow-sm transition-all duration-300 ${
              msg.isUser
                ? "bg-gradient-to-r from-pink-500/70 to-purple-500/70 text-white"
                : "bg-white/15 backdrop-blur-md border border-white/10 text-white"
            }`}
          >
            {/* Use ReactMarkdown to format lists, bold, italics, etc. */}
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-lg font-bold mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-md font-semibold mb-1" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="leading-relaxed mb-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="list-disc ml-5 mb-1" {...props} />
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
}
