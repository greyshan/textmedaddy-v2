import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useFriendshipRealtime from "../hooks/useFriendshipRealtime"; // ✅ Added realtime hook

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

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

  // ✅ Fetch friend requests (Moved OUTSIDE useEffect so it can be reused)
  const fetchRequests = async () => {
    if (!user) return;

    try {
      // ✅ Fetch only "pending" sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("friend_requests")
        .select(
          "id, receiver_id, status, receiver:receiver_id(name, username, profile_pic)"
        )
        .eq("sender_id", user.id)
        .eq("status", "pending") // 👈 only pending
        .order("created_at", { ascending: false });

      // ✅ Fetch only "pending" received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from("friend_requests")
        .select(
          "id, sender_id, status, sender:sender_id(name, username, profile_pic)"
        )
        .eq("receiver_id", user.id)
        .eq("status", "pending") // 👈 only pending
        .order("created_at", { ascending: false });

      if (sentError || receivedError) {
        console.error("Error fetching friend requests:", sentError || receivedError);
        return;
      }

      setSent(sentData || []);
      setReceived(receivedData || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  // ✅ Run once when user is loaded
  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  // ✅ Realtime updates (auto-refresh when other user accepts/rejects)
  useFriendshipRealtime(user?.id, () => {
    fetchRequests(); // 👈 instantly syncs UI
  });

  // ✅ Accept request (ENHANCED)
  const handleAccept = async (req) => {
    try {
      // 1️⃣ Update friend request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", req.id);

      if (updateError) throw updateError;

      // 2️⃣ Get logged-in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // 3️⃣ Check if chat already exists (works both ways)
      const { data: existingChat, error: chatCheckError } = await supabase
        .from("chats")
        .select("id, participants")
        .or(
          `and(participants.cs.{${currentUser.id},${req.sender_id}}),and(participants.cs.{${req.sender_id},${currentUser.id}})`
        );

      if (chatCheckError) throw chatCheckError;

      // 4️⃣ If no chat exists, create one
      if (!existingChat || existingChat.length === 0) {
        if (req.sender_id !== currentUser.id) {
          const { data: friendData } = await supabase
            .from("users")
            .select("name, username, profile_pic")
            .eq("id", req.sender_id)
            .single();

          const { error: chatError } = await supabase.from("chats").insert([
            {
              participants: [currentUser.id, req.sender_id],
              friend_name: friendData?.name || "Unknown User",
              friend_username: friendData?.username || "",
              friend_profile_pic:
                friendData?.profile_pic || "/assets/images/defaultUser.png",
              created_at: new Date(),
            },
          ]);

          if (chatError) throw chatError;
        }
      }

      // 5️⃣ Notify user
      toast.success(
        `You are now friends with ${req.sender?.name || "this user"} 🎉`
      );

      // 6️⃣ Refresh to remove accepted request instantly
      await fetchRequests();

    } catch (err) {
      console.error("❌ Accept request failed:", err);
      toast.error("Failed to accept request");
    }
  };

  // ❌ Reject request (ENHANCED)
  const handleReject = async (req) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", req.id);

      if (error) throw error;

      toast(`You rejected ${req.sender?.name || "this user"} ❌`);

      // ✅ Refresh instantly
      await fetchRequests();

    } catch (err) {
      console.error("❌ Reject request failed:", err);
      toast.error("Failed to reject request");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start text-white relative"
      style={{
        backgroundImage: "url('/assets/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      <div className="relative w-[95%] max-w-lg mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/chat")}
            className="p-2 rounded-full bg-pink-500/60 hover:bg-pink-600 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Friend Requests</h2>
        </div>

        {/* Received Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">💌 Received</h3>
          {received.length === 0 ? (
            <p className="text-white/60 text-sm">No pending requests</p>
          ) : (
            received.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 mb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      req.sender?.profile_pic ||
                      "/assets/images/defaultUser.png"
                    }
                    alt={req.sender?.name}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <div>
                    <p className="font-semibold">{req.sender?.name}</p>
                    <p className="text-xs text-white/60">
                      @{req.sender?.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    className="bg-green-500/70 hover:bg-green-600 text-white p-2 rounded-lg transition"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="bg-red-500/70 hover:bg-red-600 text-white p-2 rounded-lg transition"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📨 Sent</h3>
          {sent.length === 0 ? (
            <p className="text-white/60 text-sm">
              You haven't sent any requests
            </p>
          ) : (
            sent.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 mb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      req.receiver?.profile_pic ||
                      "/assets/images/defaultUser.png"
                    }
                    alt={req.receiver?.name}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <div>
                    <p className="font-semibold">{req.receiver?.name}</p>
                    <p className="text-xs text-white/60">
                      @{req.receiver?.username}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    req.status === "pending"
                      ? "text-yellow-400"
                      : req.status === "accepted"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
