// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isZoomed, setIsZoomed] = useState(false); // 👈 Added for zoom modal

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        toast.error("Error loading profile");
        return;
      }

      setUser(user);
      setProfilePic(user?.user_metadata?.profile_pic || null);
      setName(user?.user_metadata?.name || "");
      setUsername(user?.user_metadata?.username || "");
    };

    getUser();
  }, []);

  // ✅ Upload new profile photo
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!user) {
      toast.error("User not found. Please login again.");
      return;
    }

    // 📏 Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    // 👀 Instant preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("profile-pics")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update DB
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { profile_pic: publicUrl },
      });

      if (metaError) throw metaError;

      setProfilePic(publicUrl);
      setPreview(null);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error("Failed to upload image.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Update name & username
  const handleProfileUpdate = async () => {
    if (!name.trim() || !username.trim()) {
      toast.error("Name and username cannot be empty.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ name, username })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update Auth metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { name, username },
      });

      if (metaError) throw metaError;

      toast.success("Profile updated successfully 🎉");
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500/40 via-purple-600/30 to-gray-900/40 backdrop-blur-xl text-white p-6 relative">
      {user ? (
        <div className="bg-white/10 border border-white/30 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md">
          {/* 🖼 Profile Picture */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={preview || profilePic || "/assets/images/defaultUser.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-pink-400 object-cover mb-3 shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsZoomed(true)} // 👈 Tap to zoom
            />

            <label className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm transition">
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* ✏️ Editable Fields */}
          <div className="space-y-4 text-left mt-6">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/15 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/15 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleProfileUpdate}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <p className="text-gray-300">Loading profile...</p>
      )}

      {/* 🔍 Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative">
            <img
              src={profilePic || "/assets/images/defaultUser.png"}
              alt="Zoomed Profile"
              className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
