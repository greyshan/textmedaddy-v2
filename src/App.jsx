// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ChatLayout from "./layouts/ChatLayout";
import { supabase } from "./supabaseClient";
import ProfilePage from "./pages/ProfilePage";
import FriendRequestsPage from "./pages/FriendRequestsPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a session already exists (user logged in previously)
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Cleanup listener on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-400 text-xl font-semibold">
        Loading...
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* If user is not logged in, show Auth page, else go to /chat */}
        <Route path="/" element={!user ? <AuthPage /> : <Navigate to="/chat" />} />

        {/* If user is logged in, show Chat page, else redirect to login */}
        <Route path="/chat" element={user ? <ChatLayout /> : <Navigate to="/" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/requests" element={<FriendRequestsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
