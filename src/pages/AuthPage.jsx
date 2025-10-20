// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import login_animate from "../assets/login_animate.json";
import loginBg from "../assets/login-bg.jpg";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setShowSplash(true);
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, [isLogin]);

  // ✅ Check session if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) navigate("/chat");
    };
    checkSession();
  }, [navigate]);

  // ✅ Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name)
      return toast.error("Please fill all fields");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) throw error;

      toast.success("Go and check your mailbox 📬");
      setIsLogin(true);
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password)
      return toast.error("Enter email and password");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back 💬");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ For Google & Facebook (show toast only)
  const featureInBuild = (provider) => {
    toast(`🔧 ${provider} login is under development. Please use email.`);
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-cover bg-center bg-no-repeat p-6 overflow-hidden"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <Toaster position="top-center" />
      {showSplash ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-3xl font-bold text-white"
        >
          {isLogin
            ? "Welcome back again buddy! 💫"
            : "Ready to join the community? 💬"}
        </motion.div>
      ) : (
        <>
          {/* Left Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "rightSide" : "leftSide"}
              initial={{ opacity: 0, x: isLogin ? 100 : -100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isLogin ? -100 : 100, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
              }}
              className={`hidden md:flex flex-col justify-center items-center text-white text-center w-1/2 px-8 ${
                isLogin ? "order-2" : "order-1"
              }`}
            >
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-extrabold mb-4 drop-shadow-lg"
              >
                Welcome to <span className="text-pink-400">TEXTmeDADDY</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-gray-200 mb-8 w-3/4"
              >
                Where your words make connections 💞
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-3/4 flex justify-center"
              >
                <Lottie animationData={login_animate} loop={true} className="w-full" />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Right Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "loginForm" : "signupForm"}
              initial={{ opacity: 0, x: isLogin ? 100 : -100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isLogin ? -100 : 100, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
              }}
              className={`w-full md:w-1/2 backdrop-blur-lg bg-white/10 border border-white/30 rounded-2xl shadow-2xl p-8 md:p-12 text-white ${
                isLogin ? "order-1" : "order-2"
              }`}
            >
              <motion.h2
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-center mb-6"
              >
                {isLogin ? "Welcome Back" : "Create Your Account"}
              </motion.h2>

              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={isLogin ? handleLogin : handleSignup}
                className="flex flex-col space-y-4 relative"
              >
                {!isLogin && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                  />
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-200 hover:text-white font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2 font-semibold cursor-pointer transition duration-300 transform hover:scale-105"
                >
                  {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
                </button>
              </motion.form>

              {/* Google + Facebook */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-3 mt-6"
              >
                <button
                  onClick={() => featureInBuild("Google")}
                  className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 cursor-pointer rounded-lg py-2 transition duration-300 transform hover:scale-105"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </button>

                <button
                  onClick={() => featureInBuild("Facebook")}
                  className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 cursor-pointer rounded-lg py-2 transition duration-300 transform hover:scale-105"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                  Continue with Facebook
                </button>
              </motion.div>

              {/* Switch Form */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-6 text-gray-200"
              >
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-pink-400 font-semibold cursor-pointer hover:underline"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AuthPage;
