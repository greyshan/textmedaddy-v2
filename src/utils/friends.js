import { supabase } from "../supabaseClient";

// ✅ Send Friend Request
export async function sendFriendRequest(senderId, receiverId) {
  const { data, error } = await supabase
    .from("friend_requests")
    .insert([{ sender_id: senderId, receiver_id: receiverId }]);

  if (error) throw error;
  return data[0];
}

// ✅ Listen for incoming friend requests (Realtime)
export function subscribeToFriendRequests(userId, callback) {
  const channel = supabase
    .channel("friend-requests")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "friend_requests" },
      (payload) => {
        const request = payload.new;
        if (request.receiver_id === userId) callback(request);
      }
    )
    .subscribe();

  return channel;
}

// ✅ Accept a friend request
export async function acceptFriendRequest(requestId) {
  const { data, error } = await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);
  if (error) throw error;
  return data;
}

// ✅ Check friendship
export async function areFriends(userId1, userId2) {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("*")
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2},status.eq.accepted),
       and(sender_id.eq.${userId2},receiver_id.eq.${userId1},status.eq.accepted)`
    );
  if (error) throw error;
  return data.length > 0;
}
