import React from "react";
import ChatListHeader from "./ChatListHeader";
import ChatSearch from "./ChatSearch";
import ChatItem from "./ChatItem";
import AIBotButton from "./AIBotButton";

const DUMMY_CHATS = [
    { id: 1, name: "Ingrid Nord", last: "See you soon!", time: "10:12", unread: 2 },
    { id: 2, name: "Akash", last: "On my way!", time: "09:45", unread: 0 },
    { id: 3, name: "Aiden Grey", last: "Let’s catch up tomorrow.", time: "Yesterday", unread: 1 },
    { id: 4, name: "Anaya Malhotra", last: "Good night 💖", time: "Yesterday", unread: 0 },
    { id: 5, name: "Ethan Clark", last: "Got it!", time: "09:10", unread: 0 },
    { id: 6, name: "Sophia Lee", last: "Sending the doc.", time: "08:54", unread: 3 },
    { id: 7, name: "Noah Patel", last: "Haha that’s funny 😂", time: "08:30", unread: 0 },
    { id: 8, name: "Mia Johnson", last: "Meet me after class?", time: "07:48", unread: 1 },
    { id: 9, name: "Liam Rivera", last: "Typing...", time: "07:31", unread: 0 },
    { id: 10, name: "Olivia Brown", last: "Got the files!", time: "07:05", unread: 0 },
    { id: 11, name: "Aarav Mehta", last: "Call me?", time: "06:59", unread: 2 },
    { id: 12, name: "Isabella Davis", last: "Thanks 💫", time: "06:30", unread: 0 },
    { id: 13, name: "James Wilson", last: "See ya!", time: "06:15", unread: 0 },
    { id: 14, name: "Emily Clark", last: "Haha agreed 😂", time: "05:49", unread: 1 },
    { id: 15, name: "Lucas Kim", last: "That’s great!", time: "05:23", unread: 0 },
    { id: 16, name: "Aarohi Sharma", last: "Meet tomorrow?", time: "05:00", unread: 0 },
    { id: 17, name: "Daniel Evans", last: "I’ll text later.", time: "04:44", unread: 1 },
    { id: 18, name: "Zoe Anderson", last: "Cool 😎", time: "04:29", unread: 0 },
    { id: 19, name: "Arjun Verma", last: "Ping me later.", time: "04:15", unread: 0 },
    { id: 20, name: "Charlotte White", last: "Good morning 🌅", time: "04:00", unread: 2 },
  ];

export default function ChatList({ onOpenChat, onOpenAI }) {
  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-lg border-r border-white/20">
      <ChatListHeader />
      <ChatSearch />

      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {DUMMY_CHATS.map((chat) => (
          <ChatItem key={chat.id} chat={chat} onClick={() => onOpenChat(chat.id)} />
        ))}
      </div>

     
      <div className="p-4 border-t border-white/10">
        <AIBotButton onClick={onOpenAI} />
      </div>
    </div>
  );
}
