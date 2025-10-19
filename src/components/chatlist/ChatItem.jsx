import React from "react";

export default function ChatItem({ chat, onClick }) {
  const { name, last, time, unread } = chat;

  return (
    <div
  onClick={onClick}
  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer 
             transition-all duration-300 
             hover:bg-white/10 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] 
             active:scale-[0.98] border-b border-white/10 hover:border-blue-400/40"
>
    
      <div className="relative flex-shrink-0">
        <img
          src="/assets/images/defaultUser.png"
          alt={name}
          className="w-11 h-11 rounded-full border border-white/20 
                     transition-all duration-300 
                     hover:scale-110 
                     hover:shadow-[0_0_15px_#3b82f6]"
        />
       
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-[2px] border-slate-900 rounded-full shadow-[0_0_6px_#22c55e]"></span>
      </div>

     
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium text-sm truncate">{name}</p>
          <span className="text-xs text-white/60 ml-2">{time}</span>
        </div>

        <div className="flex justify-between items-center mt-0.5">
          <p className="text-xs text-white/60 truncate">{last}</p>
          {unread > 0 && (
            <span
              className="bg-gradient-to-tr from-pink-500 to-rose-500 
                         text-[10px] px-2 py-0.5 rounded-full text-white ml-2 
                         shadow-[0_0_10px_rgba(236,72,153,0.6)]"
            >
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
