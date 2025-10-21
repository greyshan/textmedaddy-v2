import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Password updated successfully 🎉");
      navigate("/"); // Redirect to login
    } catch (err) {
      toast.error(err.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <Toaster position="top-center" />
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-center">Reset Password 🔐</h2>

        <form onSubmit={handleReset} className="flex flex-col space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2 font-semibold transition transform hover:scale-105"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
