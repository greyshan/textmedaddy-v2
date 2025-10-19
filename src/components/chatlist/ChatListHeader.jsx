import React from "react";
import { FiMoreVertical } from "react-icons/fi";

export default function ChatListHeader() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-lg border-b border-white/20">
     
      <img
  src="/assets/images/defaultUser.png"
  alt="User Avatar"
  className="w-10 h-10 rounded-full border border-white/30 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#3b82f6]"
/>

      
      <div className="flex-1">
        <div className="text-sm font-semibold">Your Name</div>
        <div className="text-xs text-white/60">Online</div>
      </div>

     
      <button className="p-2 rounded-lg hover:bg-white/20 transition">
        <FiMoreVertical className="text-white/80" size={18} />
      </button>
    </div>
  );
}
