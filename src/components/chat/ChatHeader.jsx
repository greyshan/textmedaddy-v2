import React from "react";
import { FiPhone, FiVideo, FiMoreVertical } from "react-icons/fi";

export default function ChatHeader({ selectedChat, onOpenDetails }) {
  if (!selectedChat) return null; // no chat selected yet

  const { name, profile_pic, status } = selectedChat;

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/10 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <img
          src={profile_pic || "/assets/images/defaultUser.png"}
          alt={name || "User"}
          className="w-10 h-10 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_12px_#3b82f6]"
        />
        <div>
          <div className="text-sm font-semibold">{name || "Unknown User"}</div>
          <div className="text-xs text-white/60">{status || "Offline"}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-white/80">
        <FiPhone className="cursor-pointer hover:text-pink-400 transition" />
        <FiVideo className="cursor-pointer hover:text-pink-400 transition" />
        <FiMoreVertical
          className="cursor-pointer hover:text-pink-400 transition"
          onClick={onOpenDetails}
        />
      </div>
    </div>
  );
}
