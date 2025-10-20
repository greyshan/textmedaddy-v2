import useFriendshipRealtime from "../../hooks/useFriendshipRealtime";
import React, { useState, useEffect } from "react";
import {
  FiImage,
  FiFileText,
  FiSettings,
  FiLock,
  FiHelpCircle,
  FiUserPlus,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export default function Details({ selectedChat }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [relationship, setRelationship] = useState("none"); // none | pending | friends | received

  // 🧠 Global Realtime Friendship Sync
useFriendshipRealtime(currentUser?.id, (payload) => {
  const updated = payload.new || payload.old;

  // Only handle if the event involves the selected chat user
  if (
    (updated.sender_id === currentUser?.id &&
      updated.receiver_id === selectedChat?.id) ||
    (updated.sender_id === selectedChat?.id &&
      updated.receiver_id === currentUser?.id)
  ) {
    if (updated.status === "accepted") setRelationship("friends");
    else if (updated.status === "pending") {
      if (updated.sender_id === currentUser?.id)
        setRelationship("pending");
      else setRelationship("received");
    } else if (updated.status === "rejected") setRelationship("none");
  }
});

  // 🧠 Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // 🔍 Check friendship / request status
  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.id) return;

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("friend_requests")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.id}),
             and(sender_id.eq.${selectedChat.id},receiver_id.eq.${currentUser.id})`
          );

        if (error) throw error;

        if (data.length === 0) {
          setRelationship("none");
          return;
        }

        const req = data[0];
        if (req.status === "accepted") setRelationship("friends");
        else if (
          req.status === "pending" &&
          req.sender_id === currentUser.id
        )
          setRelationship("pending");
        else if (
          req.status === "pending" &&
          req.receiver_id === currentUser.id
        )
          setRelationship("received");
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
  }, [selectedChat, currentUser]);

  // 💌 Send Friend Request
  const handleSendRequest = async () => {
    if (!currentUser?.id || !selectedChat?.id) return;

    try {
      const { error } = await supabase.from("friend_requests").insert([
        {
          sender_id: currentUser.id,
          receiver_id: selectedChat.id,
          status: "pending",
        },
      ]);

      if (error) throw error;
      setRelationship("pending");
      toast.success("Friend request sent 💌");
    } catch (err) {
      toast.error("Request already sent or failed.");
    }
  };

  // ✅ Accept Request
  const handleAcceptRequest = async () => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .or(
          `and(sender_id.eq.${selectedChat.id},receiver_id.eq.${currentUser.id},status.eq.pending)`
        );

      if (error) throw error;
      toast.success("Friend request accepted ✅");
      setRelationship("friends");
    } catch (err) {
      toast.error("Failed to accept request.");
    }
  };

  // ❌ Reject Request
  const handleRejectRequest = async () => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .or(
          `and(sender_id.eq.${selectedChat.id},receiver_id.eq.${currentUser.id},status.eq.pending)`
        );

      if (error) throw error;
      toast("Request rejected ❌");
      setRelationship("none");
    } catch (err) {
      toast.error("Failed to reject request.");
    }
  };

  // 🚫 Block User
  const handleBlockUser = async () => {
    toast("🚫 Block feature coming soon!");
  };

  // 🧍 Default fallbacks
  const name = selectedChat?.name || "Select a chat";
  const username = selectedChat?.username
    ? `@${selectedChat.username}`
    : "";
  const profile_pic =
    selectedChat?.profile_pic || "/assets/images/defaultUser.png";
  const status = selectedChat?.status || "Offline";
  const bio = selectedChat?.bio || "Living the dream 💫";

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg text-white p-5 overflow-y-auto custom-scrollbar">
      {/* 🧑‍💼 Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={profile_pic}
            alt={name}
            className="w-24 h-24 rounded-full border border-white/20 mb-3 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#ec4899]"
          />
          <span
            className={`absolute bottom-3 right-1 w-4 h-4 rounded-full border-2 border-[#0f0f1b] ${
              status === "Online"
                ? "bg-green-400"
                : "bg-gray-400"
            }`}
          ></span>
        </div>
        <h2 className="text-lg font-semibold text-center">{name}</h2>
        {username && (
          <p className="text-sm text-white/60">{username}</p>
        )}
        <p className="text-sm text-white/70 mt-2 text-center italic">
          {bio}
        </p>
      </div>

      {/* 💌 Friendship Controls */}
      <div className="flex flex-col items-center mb-6 space-y-3">
        {relationship === "none" && (
          <button
            onClick={handleSendRequest}
            className="w-full py-2 rounded-lg text-sm font-medium bg-pink-500 hover:bg-pink-600 transition-all duration-300 shadow-[0_0_10px_rgba(255,20,147,0.4)] flex items-center justify-center gap-2"
          >
            <FiUserPlus /> Send Friend Request
          </button>
        )}

        {relationship === "pending" && (
          <p className="text-center text-sm text-white/70 flex items-center gap-1">
            <FiClock /> Request pending ⏳
          </p>
        )}

        {relationship === "received" && (
          <div className="flex gap-2">
            <button
              onClick={handleAcceptRequest}
              className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition-all text-sm flex items-center justify-center gap-1"
            >
              <FiCheck /> Accept
            </button>
            <button
              onClick={handleRejectRequest}
              className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-1"
            >
              <FiX /> Reject
            </button>
          </div>
        )}

        {relationship === "friends" && (
          <p className="text-green-400 text-sm flex items-center gap-1">
            <FiCheck /> Friends
          </p>
        )}
      </div>

      <div className="border-t border-white/10 my-4"></div>

      {/* ⚙️ Settings Section */}
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

      {/* 🚫 Block Section */}
      <div className="mt-auto border-t border-white/10 pt-4">
        <button
          onClick={handleBlockUser}
          className="w-full py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
        >
          Block User
        </button>
      </div>
    </div>
  );
}
