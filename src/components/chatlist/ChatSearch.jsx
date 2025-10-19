import React from "react";
import { FiSearch, FiPlus } from "react-icons/fi";

export default function ChatSearch() {
  return (
    <div className="p-3 border-b border-white/20 bg-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
        <FiSearch className="text-white/70" />
        <input
          type="text"
          placeholder="Search or start new chat"
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-white/50 text-white"
        />
        <button
          className="p-2 rounded-md hover:bg-white/20 transition"
          title="Start new chat"
        >
          <FiPlus className="text-white/80" />
        </button>
      </div>
    </div>
  );
}
