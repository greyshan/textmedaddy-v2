import React from "react";
import ChatLayout from "./layouts/ChatLayout";

export default function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative text-white overflow-hidden"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      
      <div className="relative w-[95%] max-w-[1200px] h-[90vh] rounded-2xl overflow-hidden border border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,20,147,0.25)]">
        <ChatLayout />
      </div>
    </div>
  );
}
