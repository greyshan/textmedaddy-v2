// src/components/chatlist/ChatItem.jsx
import React from "react";

export default function ChatItem({ chat, onClick }) {
  const { name, last, unread, profile_pic, status } = chat;

  // Status color map 🌈
  const statusColors = {
    Online: "bg-green-400 shadow-[0_0_8px_#22c55e]",
    Away: "bg-pink-400 shadow-[0_0_8px_#ec4899]",
    Offline: "bg-gray-400 shadow-[0_0_8px_#9ca3af]",
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group border border-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]"
    >
      {/* Profile + Status Dot */}
      <div className="relative">
        <img
          src={profile_pic || "/assets/images/defaultUser.png"}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border border-white/20 group-hover:scale-105 transition-all duration-300"
        />
        {/* Status Dot */}
        <span
          className={`absolute bottom-1 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0f0f1b] ${statusColors[status] || "bg-gray-400"}`}
        ></span>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm truncate">{name}</h4>
          {unread > 0 && (
            <span className="text-xs bg-pink-500/90 text-white rounded-full px-2 py-[1px] ml-2">
              {unread}
            </span>
          )}
        </div>
        <p className="text-xs text-white/60 truncate">{last}</p>
      </div>
    </div>
  );
}
