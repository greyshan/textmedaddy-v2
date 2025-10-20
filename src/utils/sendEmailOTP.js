// src/utils/sendEmailOTP.js
import emailjs from "emailjs-com";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOTP = async (email, name) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry


    await setDoc(doc(db, "email_otps", email), {
      email,
      otp,
      expiresAt,
      verified: false,
      createdAt: serverTimestamp(),
    });


    await emailjs.send(
      "service_pt7mjip", // service
      "template_4239cah", //  template
      {
        user_name: name,
        otp_code: otp,
        to_email: email,
      },
      "7PODMsyjlIPZHmZl3" // public key 
    );

    console.log("✅ OTP sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return false;
  }
};
