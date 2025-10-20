import React from "react";
import { FiSearch } from "react-icons/fi";

export default function ChatSearch({ search, setSearch }) {
  return (
    <div className="relative p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
      <FiSearch
        className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50"
        size={18}
      />
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/10 text-white placeholder-white/60 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-pink-400/70 transition-all duration-200"
      />
    </div>
  );
}
