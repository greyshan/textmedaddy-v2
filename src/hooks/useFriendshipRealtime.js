// src/hooks/useFriendshipRealtime.js
import { useEffect } from "react";
import { supabase } from "../supabaseClient";

/**
 * useFriendshipRealtime
 * ---------------------
 * Realtime listener for friend_requests table.
 * Triggers `callback` whenever the current user is involved in any insert/update/delete.
 */
export default function useFriendshipRealtime(userId, callback) {
  useEffect(() => {
    if (!userId) return;

    console.log("👂 Subscribing to realtime friendship updates for:", userId);

    // ✅ Subscribe to all friendship events involving this user
    const channel = supabase
      .channel(`friendship-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // "INSERT", "UPDATE", "DELETE"
          schema: "public",
          table: "friend_requests",
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
        },
        (payload) => {
          console.log("🔄 Friendship update received:", payload);

          // Trigger callback if provided
          if (callback && typeof callback === "function") {
            callback(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime subscription active for", userId);
        }
      });

    // 🧹 Cleanup on unmount
    return () => {
      console.log("🛑 Unsubscribing friendship listener for:", userId);
      supabase.removeChannel(channel);
    };
  }, [userId, callback]);
}
