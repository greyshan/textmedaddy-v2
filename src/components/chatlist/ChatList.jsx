// src/components/chatlist/ChatList.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ChatListHeader from "./ChatListHeader";
import ChatSearch from "./ChatSearch";
import ChatItem from "./ChatItem";
import useFriendshipRealtime from "../../hooks/useFriendshipRealtime";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ChatList({ onOpenChat, onOpenAI }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ✅ Fetch chats with friend info
  const fetchChats = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chats")
      .select("id, participants, friend_name, friend_username, friend_profile_pic, last_message, last_message_time")
      .contains("participants", [user.id])
      .order("last_message_time", { ascending: false });

    if (error) {
      console.error("❌ Error fetching chats:", error);
      return;
    }

    setChats(data || []);
  };

  // ✅ Fetch sent friend requests
  const fetchFriendRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("friend_requests")
      .select("receiver_id, status")
      .eq("sender_id", user.id);
    if (!error && data) setFriendRequests(data);
  };

  // ✅ Realtime listener — auto refresh
  useFriendshipRealtime(user?.id, () => {
    fetchChats();
    fetchFriendRequests();
  });

  // ✅ Initial load
  useEffect(() => {
    if (user) {
      fetchChats();
      fetchFriendRequests();
    }
  }, [user]);

  // ✅ Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, name, username, profile_pic")
        .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) console.error("Search error:", error);
      else setSearchResults(data.filter((u) => u.id !== user?.id));

      setLoading(false);
    };

    const timeout = setTimeout(searchUsers, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  // ✅ Send friend request
  const sendFriendRequest = async (receiver_id) => {
    if (!user || receiver_id === user.id) return;

    try {
      const { data: existingRequests } = await supabase
        .from("friend_requests")
        .select("id")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`);

      if (existingRequests?.length > 0) {
        toast("Request already exists ✅");
        return;
      }

      const { error } = await supabase.from("friend_requests").insert([
        {
          sender_id: user.id,
          receiver_id,
          status: "pending",
        },
      ]);

      if (error) throw error;
      toast.success("Friend request sent 💌");
      setFriendRequests((prev) => [...prev, { receiver_id, status: "pending" }]);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to send request 😕");
    }
  };

  // ✅ Helper
  const isRequestSent = (userId) =>
    friendRequests.some((r) => r.receiver_id === userId);

  // ✅ Open chat safely
  const handleOpenChat = async (chat) => {
    if (!chat || !chat.id) return;
    const friendData = {
      name: chat.friend_name,
      username: chat.friend_username,
      profile_pic: chat.friend_profile_pic,
      id: chat.participants.find((id) => id !== user.id),
    };
    onOpenChat(friendData);
  };

  return (
    <div className="relative flex flex-col h-full bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden">
      <ChatListHeader />
      <ChatSearch search={searchQuery} setSearch={setSearchQuery} />

      {/* 🔍 Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute top-[120px] left-0 w-full bg-black/40 backdrop-blur-xl border-y border-white/10 z-40 p-3 max-h-[60vh] overflow-y-auto rounded-b-lg">
          {loading ? (
            <p className="text-center text-gray-400">Searching...</p>
          ) : (
            searchResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onOpenChat(u)}
                >
                  <img
                    src={u.profile_pic || "/assets/images/defaultUser.png"}
                    alt={u.name}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-white/60">@{u.username}</p>
                  </div>
                </div>

                {!isRequestSent(u.id) ? (
                  <FiUserPlus
                    className="text-pink-400 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => sendFriendRequest(u.id)}
                  />
                ) : (
                  <FiUserCheck className="text-green-400" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 💬 Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar relative z-10">
        {chats.length === 0 ? (
          <p className="text-center text-gray-400 mt-5">No chats yet 💬</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleOpenChat(chat)}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={chat.friend_profile_pic || "/assets/images/defaultUser.png"}
                  alt={chat.friend_name}
                  className="w-10 h-10 rounded-full border border-white/20"
                />
                <div>
                  <p className="font-semibold">{chat.friend_name}</p>
                  <p className="text-xs text-white/60">
                    {chat.last_message
                      ? chat.last_message.length > 28
                        ? chat.last_message.slice(0, 28) + "..."
                        : chat.last_message
                      : "No messages yet"}
                  </p>
                </div>
              </div>

              {chat.last_message_time && (
                <p className="text-[11px] text-white/50">
                  {new Date(chat.last_message_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 🤖 AI & Requests */}
      <div className="absolute bottom-5 right-5 flex gap-3 z-50">
        <button
          onClick={onOpenAI}
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all"
          title="AI Chat"
        >
          🤖
        </button>
        <button
          onClick={() => navigate("/requests")}
          className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all"
          title="Friend Requests"
        >
          <FiUserCheck size={22} />
        </button>
      </div>
    </div>
  );
}
