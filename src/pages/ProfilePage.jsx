// src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Aiden Grey");
  const [username, setUsername] = useState("aiden_grey");
  const [email, setEmail] = useState("aiden@example.com");
  const [bio, setBio] = useState("Living the dream 💫");
  const [profilePic, setProfilePic] = useState("/assets/images/defaultUser.png");

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{
        backgroundImage: "url('/assets/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      <div className="relative w-[90%] max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-8 z-10">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/chat")}
            className="p-2 rounded-full bg-pink-500/60 hover:bg-pink-600 transition"
          >
            <FiArrowLeft />
          </button>
          <h2 className="text-2xl font-bold ml-4">Edit Profile</h2>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-5">
          <img
            src={profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full border border-pink-400 mb-3"
          />
          <button
            onClick={() => alert("Upload picture functionality coming soon!")}
            className="text-sm text-pink-400 hover:text-pink-300 transition"
          >
            Change Picture
          </button>
        </div>

        {/* Profile Form */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="bg-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="bg-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
          />
          
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your bio"
            className="bg-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6">
        <button
  onClick={() => {
    alert("Profile updated successfully!");
    navigate("/chat"); // ✅ redirect after saving
  }}
  className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 transition font-semibold"
>
  Save Changes
</button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
