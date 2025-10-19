import React, { useState } from "react";
import ChatList from "../components/chatlist/ChatList";
import Chat from "../components/chat/Chat";
import AIChatBox from "../components/chat/AIChatBox";
import Details from "../components/details/Details";

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isAI, setIsAI] = useState(false);

  const handleOpenChat = (id, ai = false) => {
    setSelectedChat(id);
    setIsAI(ai);
  };

  return (
    <div className="w-full h-full flex text-white">
     
      <div className="flex-[1] border-r border-white/10">
        <ChatList
          onOpenChat={(id) => handleOpenChat(id, false)}
          onOpenAI={() => handleOpenChat("AI", true)}
        />
      </div>

     
      <div className="flex-[2]">
        {isAI ? <AIChatBox /> : <Chat selectedChat={selectedChat} />}
      </div>

     
      <div className="flex-[1] border-l border-white/10 hidden lg:flex">
        <Details selectedChat={selectedChat} />
      </div>
    </div>
  );
}
