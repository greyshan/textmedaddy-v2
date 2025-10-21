import React, { useState, useEffect } from "react";
import ChatList from "../components/chatlist/ChatList";
import Chat from "../components/chat/Chat";
import Details from "../components/details/Details";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import useResponsiveView from "../hooks/useResponsiveView";
import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isAI, setIsAI] = useState(false);
  const [activeView, setActiveView] = useState("chatlist");
  const [showDetails, setShowDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const view = useResponsiveView();

  // ✅ Get current logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      else setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // ✅ Clean fixed handleOpenChat
  const handleOpenChat = async (chatUser, ai = false) => {
    if (ai) {
      setIsAI(true);
      setSelectedChat("AI");
      if (view === "mobile") setActiveView("chat");
      return;
    }
  
    if (!currentUser || !chatUser?.id) {
      toast.error("Something went wrong. Please re-login.");
      return;
    }
  
    try {
      // ✅ Check if an existing chat between these two users exists
      const { data: existingChat, error: checkError } = await supabase
        .from("chats")
        .select("*")
        .contains("participants", [currentUser.id])
        .contains("participants", [chatUser.id])
        .limit(1)
        .single();
  
      if (checkError && checkError.code !== "PGRST116") throw checkError;
  
      let chatRecord = existingChat;
  
      // ✅ If no chat exists, create one now
      if (!chatRecord) {
        const { data: newChat, error: insertError } = await supabase
          .from("chats")
          .insert([
            {
              participants: [currentUser.id, chatUser.id],
              friend_name: chatUser.name,
              friend_username: chatUser.username,
              friend_profile_pic:
                chatUser.profile_pic || "/assets/images/defaultUser.png",
              created_at: new Date(),
            },
          ])
          .select()
          .single();
  
        if (insertError) throw insertError;
        chatRecord = newChat;
      }
  
      // ✅ Open the valid chat
     // ✅ Open the valid chat (include friend data)
        setSelectedChat({
         id: chatRecord.id,
         name: chatUser.name,
         username: chatUser.username,
         profile_pic: chatUser.profile_pic || "/assets/images/defaultUser.png",
         status: "Online",
       });
      setIsAI(false);
      setShowDetails(false);
      if (view === "mobile") setActiveView("chat");
    } catch (err) {
      console.error("❌ handleOpenChat error:", err);
      toast.error("Failed to open chat.");
    }
  };

  const handleOpenDetails = () => {
    if (view === "desktop") {
      setSelectedChat((prev) => ({ ...prev }));
    } else if (view === "tablet") {
      setShowDetails(true);
    } else if (view === "mobile") {
      setActiveView("details");
    }
  };

  const handleGoBack = () => {
    if (view === "mobile") {
      if (activeView === "details") setActiveView("chat");
      else setActiveView("chatlist");
    } else if (view === "tablet") {
      setShowDetails(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center relative text-white overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1374')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <motion.div
        className="relative w-[95%] max-w-[1200px] h-[90vh] rounded-2xl overflow-hidden border border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,20,147,0.25)] flex"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {/* 🩵 MOBILE VIEW */}
          {view === "mobile" && (
            <>
              {activeView === "chatlist" && (
                <motion.div
                  key="chatlist"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="w-full"
                >
                  <ChatList
                    onOpenChat={(chatUser) => handleOpenChat(chatUser, false)}
                    onOpenAI={() => handleOpenChat("AI", true)}
                  />
                </motion.div>
              )}

              {activeView === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="w-full relative"
                >
                  <Chat
                    selectedChat={selectedChat}
                    onOpenDetails={handleOpenDetails}
                  />
                  <button
                    onClick={handleGoBack}
                    className="absolute bottom-[80px] right-3 bg-pink-600/60 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg"
                  >
                    <ArrowLeft size={22} />
                  </button>
                </motion.div>
              )}

              {activeView === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="w-full relative"
                >
                  <Details selectedChat={selectedChat} />
                  <button
                    onClick={handleGoBack}
                    className="absolute bottom-[80px] right-3 bg-pink-600/60 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg"
                  >
                    <ArrowLeft size={22} />
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* 💻 TABLET VIEW */}
          {view === "tablet" && (
            <>
              {!showDetails && (
                <>
                  <div className="flex-[1.1] border-r border-white/10">
                    <ChatList
                      onOpenChat={(chatUser) => handleOpenChat(chatUser, false)}
                      onOpenAI={() => handleOpenChat("AI", true)}
                    />
                  </div>

                  <div className="flex-[1.9] relative">
                    {selectedChat ? (
                      <Chat
                        key={selectedChat?.id || "AI"}
                        selectedChat={selectedChat}
                        onOpenDetails={handleOpenDetails}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        Select a chat to start messaging 💬
                      </div>
                    )}
                  </div>
                </>
              )}

              {showDetails && (
                <motion.div
                  key="tabletDetails"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="flex-[3] relative"
                >
                  <Details selectedChat={selectedChat} />
                  <button
                    onClick={handleGoBack}
                    className="absolute bottom-[80px] right-3 bg-pink-600/60 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg"
                  >
                    <ArrowLeft size={22} />
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* 🖥️ DESKTOP VIEW */}
          {view === "desktop" && (
            <>
              <div className="flex-[1.2] border-r border-white/10">
                <ChatList
                  onOpenChat={(chatUser) => handleOpenChat(chatUser, false)}
                  onOpenAI={() => handleOpenChat("AI", true)}
                />
              </div>

              <div className="flex-[2.3]">
                {selectedChat ? (
                  <Chat
                    key={selectedChat?.id || "AI"}
                    selectedChat={selectedChat}
                    onOpenDetails={handleOpenDetails}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Select a chat to start messaging 💬
                  </div>
                )}
              </div>

              <div className="flex-[1.1] border-l border-white/10">
                <Details selectedChat={selectedChat} />
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
