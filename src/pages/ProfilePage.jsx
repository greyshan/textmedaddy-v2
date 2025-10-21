// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Error loading profile");
        return;
      }
      setUser(data.user);
    };

    getUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500/40 via-purple-600/30 to-gray-900/40 backdrop-blur-xl text-white p-6">
      {user ? (
        <div className="bg-white/10 border border-white/30 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2">
            {user.user_metadata?.name || "No Name Found"}
          </h1>
          <p className="text-gray-300">@{user.user_metadata?.username || "N/A"}</p>
          <p className="mt-3 text-gray-400">{user.email}</p>
        </div>
      ) : (
        <p className="text-gray-300">Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;
