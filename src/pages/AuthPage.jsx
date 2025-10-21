// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import login_animate from "../assets/login_animate.json";
import loginBg from "../assets/login-bg.jpg";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpire, setOtpExpire] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Splash animation
  useEffect(() => {
    setShowSplash(true);
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [isLogin]);

  // Auto login redirect
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) navigate("/chat");
    };
    checkSession();
  }, [navigate]);

  // OTP countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // ✅ Send OTP via EmailJS
  const sendOtp = async () => {
    if (!name || !username || !email || !password) {
      toast.error("Please fill all fields!");
      return;
    }
  
    if (resendTimer > 0) {
      toast("Please wait before resending OTP ⏳");
      return;
    }
  
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpExpire(Date.now() + 2 * 60 * 1000);
    setResendTimer(60);
  
    const templateParams = {
      to_email: email,
      to_name: name,
      otp_code: code,
    };
  
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
  
      toast.success("OTP sent to your email 📩");
      setOtpStep(true);
    } catch (err) {
      console.error("❌ EmailJS Error:", err);
      toast.error("Failed to send OTP 😕");
      setResendTimer(0);
    }
  };

  // ✅ Verify OTP and sign up
  const verifyOtp = async () => {
    if (Date.now() > otpExpire) return toast.error("OTP expired ⏰");
    if (otp !== generatedOtp) return toast.error("Invalid OTP ❌");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username } },
      });

      if (error) throw error;

      toast.success("Account created 🎉");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password!");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success("Welcome back 💬");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
   // ✅ Password Reset via Supabase
const handlePasswordReset = async (email) => {
  if (!email) {
    toast.error("Please enter your email first!");
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // 👈 after clicking link
    });

    if (error) throw error;
    toast.success("Password reset link sent to your email 📬");
  } catch (err) {
    toast.error(err.message || "Failed to send reset link");
  }
};

  // ⚙️ Google & Facebook placeholder
  const featureInBuild = (provider) =>
    toast(`🔧 ${provider} login is under development. Please use Email.`);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-cover bg-center bg-no-repeat p-6 overflow-hidden"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <Toaster position="top-center" />

      {showSplash ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-3xl font-bold text-white"
        >
          {isLogin ? "Welcome back again buddy! 💫" : "Ready to join the community? 💬"}
        </motion.div>
      ) : (
        <>
          {/* Left animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "rightSide" : "leftSide"}
              initial={{ opacity: 0, x: isLogin ? 100 : -100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isLogin ? -100 : 100, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className={`hidden md:flex flex-col justify-center items-center text-white text-center w-1/2 px-8 ${
                isLogin ? "order-2" : "order-1"
              }`}
            >
              <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
                Welcome to <span className="text-pink-400">TEXTmeDADDY</span>
              </h1>
              <p className="text-lg text-gray-200 mb-8 w-3/4">
                Where your words make connections 💞
              </p>
              <Lottie animationData={login_animate} loop className="w-full" />
            </motion.div>
          </AnimatePresence>

          {/* Right Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "loginForm" : otpStep ? "otpForm" : "signupForm"}
              initial={{ opacity: 0, x: isLogin ? 100 : -100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isLogin ? -100 : 100, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className={`w-full md:w-1/2 backdrop-blur-lg bg-white/10 border border-white/30 rounded-2xl shadow-2xl p-8 md:p-12 text-white ${
                isLogin ? "order-1" : "order-2"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
                {isLogin
                  ? "Welcome Back 👋"
                  : otpStep
                  ? "Verify Your Email ✉️"
                  : "Create Your Account 💫"}
              </h2>

              {/* Step 1: Signup Form */}
              {!isLogin && !otpStep && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 mb-3"
                  />

                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 mb-3"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 mb-3"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/20 placeholder-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-400 mb-3 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-200 hover:text-white font-semibold"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={sendOtp}
                      disabled={loading}
                      className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2 font-semibold mt-2 px-8 transition duration-300 transform hover:scale-105"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Verify OTP */}
              {!isLogin && otpStep && (
                <>
                  <p className="text-center mb-3 text-white/70 text-sm">
                    Enter the OTP sent to <b>{email}</b>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-xl bg-white/20 placeholder-gray-300 rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-pink-400 tracking-widest w-full"
                  />

                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={verifyOtp}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-semibold w-full transition duration-300 transform hover:scale-105"
                    >
                      {loading ? "Verifying..." : "Verify & Create Account"}
                    </button>

                    {resendTimer > 0 ? (
                      <p className="text-center text-sm mt-3 text-gray-300">
                        🔄 Resend in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        onClick={sendOtp}
                        className="w-full mt-1 py-2 rounded-lg text-sm bg-transparent border border-white/30 hover:bg-white/10 transition-all"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Login */}
              {isLogin && (
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                  
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
                            onClick={() => handlePasswordReset(email)}
                              className="text-pink-300 text-sm hover:underline self-end"
                                >
                                      Forgot Password?
                                                </button>
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
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2 font-semibold transition duration-300 transform hover:scale-105"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  
                </form>
                
              )}

              {/* Google + Facebook */}
              <div className="flex flex-col space-y-3 mt-6">
                <button
                  onClick={() => featureInBuild("Google")}
                  className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 transition duration-300 transform hover:scale-105"
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
                  className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 transition duration-300 transform hover:scale-105"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                  Continue with Facebook
                </button>
              </div>

              {/* Switch */}
              <p className="text-center mt-6 text-gray-200">
                {isLogin
                  ? "Don't have an account?"
                  : otpStep
                  ? ""
                  : "Already have an account?"}{" "}
                {!otpStep && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setOtpStep(false);
                    }}
                    className="text-pink-400 font-semibold hover:underline"
                  >
                    {isLogin ? "Sign Up" : "Login"}
                  </button>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AuthPage;
