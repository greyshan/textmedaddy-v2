// src/components/chatlist/ChatList.jsx
import useFriendshipRealtime from "../../hooks/useFriendshipRealtime";
import React, { useEffect, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import ChatSearch from "./ChatSearch";
import ChatItem from "./ChatItem";
import { supabase } from "../../supabaseClient";
import { FiUserPlus, FiCheck, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ChatList({ onOpenChat, onOpenAI }) {
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ✅ Combined function — fetch chats + accepted friends + requests
  const fetchFriendsAndChats = async () => {
    if (!user) return;

    try {
      // 1️⃣ Fetch accepted friend relationships
      const { data: accepted, error: frError } = await supabase
        .from("friend_requests")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (frError) throw frError;

      const friendIds =
        accepted?.map((r) =>
          r.sender_id === user.id ? r.receiver_id : r.sender_id
        ) || [];

      // 2️⃣ Fetch user profiles for those friends
      let friendProfiles = [];
      if (friendIds.length > 0) {
        const { data: usersData, error: userErr } = await supabase
          .from("users")
          .select("id, name, username, profile_pic")
          .in("id", friendIds);
        if (!userErr) friendProfiles = usersData;
      }
      setFriends(friendProfiles);

      // 3️⃣ Fetch user chats
      const { data: chatsData, error: chatErr } = await supabase
        .from("chats")
        .select("*")
        .contains("participants", [user.id]);
      if (!chatErr) setChats(chatsData || []);

      // 4️⃣ Fetch friend requests sent
      const { data: sentReq, error: reqErr } = await supabase
        .from("friend_requests")
        .select("receiver_id, status")
        .eq("sender_id", user.id);
      if (!reqErr) setFriendRequests(sentReq);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // ✅ Realtime updates for friend requests
  useFriendshipRealtime(user?.id, () => {
    console.log("🔄 Realtime update detected, refreshing lists...");
    fetchFriendsAndChats();
  });

  // ✅ Fetch initial data
  useEffect(() => {
    if (user) fetchFriendsAndChats();
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

      if (error) {
        console.error("Search error:", error);
      } else {
        const filtered = data.filter((u) => u.id !== user?.id);
        setSearchResults(filtered);
      }
      setLoading(false);
    };

    const timeout = setTimeout(searchUsers, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  // ✅ Send friend request
  const sendFriendRequest = async (receiver_id) => {
    if (!user || receiver_id === user.id) return;

    try {
      const { data: existing, error: checkErr } = await supabase
        .from("friend_requests")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`
        );

      if (checkErr) throw checkErr;

      if (existing?.length > 0) {
        toast("Request already exists or you’re already friends ✅");
        return;
      }

      const { error: insertErr } = await supabase.from("friend_requests").insert([
        { sender_id: user.id, receiver_id, status: "pending" },
      ]);

      if (insertErr) throw insertErr;
      toast.success("Friend request sent 💌");
      fetchFriendsAndChats();
    } catch (err) {
      console.error("Friend request error:", err);
      toast.error("Failed to send request 😕");
    }
  };

  // ✅ Check sent requests
  const isRequestSent = (userId) =>
    friendRequests.some((r) => r.receiver_id === userId);

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
                  <FiCheck className="text-green-400" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 💬 Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar relative z-10">
        {chats.length === 0 && friends.length === 0 ? (
          <p className="text-center text-gray-400 mt-5">No chats yet 💬</p>
        ) : (
          <>
            {/* Show Chats */}
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                onClick={() => onOpenChat(chat)}
              />
            ))}

            {/* Show Accepted Friends who don’t have chats yet */}
            {friends.map((friend) => (
              <ChatItem
                key={`f-${friend.id}`}
                chat={{
                  id: friend.id,
                  name: friend.name,
                  profile_pic:
                    friend.profile_pic || "/assets/images/defaultUser.png",
                }}
                onClick={() => onOpenChat(friend)}
              />
            ))}
          </>
        )}
      </div>

      {/* 🤖 AI & 👥 Friend Request Buttons */}
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
