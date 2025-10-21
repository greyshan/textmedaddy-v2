// src/components/chatlist/ChatListHeader.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiMoreVertical, FiEdit3, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function ChatListHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, visibility: "hidden" });
  const [user, setUser] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Failed to fetch user:", error.message);
        return;
      }
      setUser(data.user);
    };
    getUser();
  }, []);

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ✅ Calculate menu position
  const positionMenu = useCallback(() => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8));
    const top = rect.bottom + 10;
    setMenuStyle({ top, left, visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      setMenuStyle((s) => ({ ...s, visibility: "hidden" }));
      return;
    }
    positionMenu();
    const handleResize = () => positionMenu();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen, positionMenu]);

  // ✅ Close menu when clicked outside
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const menu = (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            top: menuStyle.top,
            left: menuStyle.left,
            visibility: menuStyle.visibility,
            zIndex: 99999,
          }}
          className="w-48 bg-[#0f0f1b]/95 backdrop-blur-2xl border border-pink-500/30 shadow-[0_0_25px_rgba(255,20,147,0.25)] rounded-xl overflow-hidden"
        >
          <ul className="flex flex-col text-sm text-white divide-y divide-white/10">
            {/* Edit Profile */}
            <li
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-pink-600/20 hover:scale-[1.02] cursor-pointer transition-all duration-200"
            >
              <FiEdit3 className="text-pink-400" />
              Edit Profile
            </li>

            {/* Logout */}
            <li
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-600/20 hover:scale-[1.02] cursor-pointer transition-all duration-200"
            >
              <FiLogOut className="text-red-400" />
              Logout
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.user_metadata?.profile_pic ||
              "/assets/images/defaultUser.png"
            }
            alt="User"
            className="w-10 h-10 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_12px_#3b82f6]"
          />
          <div>
            <div className="text-sm font-semibold">
              {user?.user_metadata?.name || "Anonymous"}
            </div>
            <div className="text-xs text-white/60">
              {user ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        <button
          ref={buttonRef}
          onClick={() => setMenuOpen((s) => !s)}
          className="p-1 rounded-md text-white/90 hover:text-pink-400 transition"
        >
          <FiMoreVertical size={20} />
        </button>
      </div>

      {createPortal(menu, document.body)}
    </>
  );
}
