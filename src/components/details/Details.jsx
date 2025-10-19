import React from "react";
import { FiImage, FiFileText, FiSettings, FiLock, FiHelpCircle } from "react-icons/fi";

export default function Details({ selectedChat }) {
  return (
    <div className="w-full h-full flex flex-col bg-white/10 backdrop-blur-lg text-white p-5 overflow-y-auto custom-scrollbar">
    
      <div className="flex flex-col items-center mb-6">
        <img
          src="/assets/images/defaultUser.png"
          alt="User"
          className="w-24 h-24 rounded-full border border-white/20 mb-3 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_18px_#3b82f6]"
        />
        <h2 className="text-lg font-semibold">{selectedChat || "Select a chat"}</h2>
        <p className="text-sm text-white/70 mt-1">Bio: “Living the dream 💫”</p>
      </div>

     
      <div className="border-t border-white/10 my-4"></div>

      
      <div className="space-y-3">
        <div className="flex items-center gap-3 hover:bg-white/10 transition rounded-lg p-2 cursor-pointer">
          <FiSettings className="text-blue-400" />
          <span className="text-sm">Chat Settings</span>
        </div>
        <div className="flex items-center gap-3 hover:bg-white/10 transition rounded-lg p-2 cursor-pointer">
          <FiLock className="text-pink-400" />
          <span className="text-sm">Privacy</span>
        </div>
        <div className="flex items-center gap-3 hover:bg-white/10 transition rounded-lg p-2 cursor-pointer">
          <FiHelpCircle className="text-green-400" />
          <span className="text-sm">Help</span>
        </div>
      </div>

     
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiImage className="text-pink-400" /> Shared Photos
        </h3>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-40 custom-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <img
              key={i}
              src={`/assets/images/sample${(i % 3) + 1}.jpg`}
              alt="Shared"
              className="rounded-lg object-cover w-full h-20 border border-white/10 hover:scale-105 hover:shadow-[0_0_10px_#3b82f6] transition-all duration-300"
            />
          ))}
        </div>
      </div>

      
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FiFileText className="text-blue-400" /> Shared Files
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-32 custom-scrollbar">
          {["Resume.pdf", "Design.png", "Report.docx", "Notes.txt"].map((file, index) => (
            <div
              key={index}
              className="text-sm flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition cursor-pointer"
            >
              <span>{file}</span>
              <span className="text-white/50 text-xs">📎</span>
            </div>
          ))}
        </div>
      </div>

     
      <div className="mt-auto border-t border-white/10 pt-4">
        <button className="w-full py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
           Block User
        </button>
      </div>
    </div>
  );
}
