// src/utils/verifyEmailOTP.js
import { db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export const verifyEmailOTP = async (email, enteredOTP) => {
  const ref = doc(db, "email_otps", email);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    alert("OTP not found! Please request again.");
    return false;
  }

  const data = snapshot.data();
  const now = new Date();

  if (now > data.expiresAt.toDate()) {
    alert("OTP expired! Please request a new one.");
    await deleteDoc(ref);
    return false;
  }

  if (enteredOTP !== data.otp) {
    alert("Invalid OTP. Please try again.");
    return false;
  }

  // Mark OTP verified
  await updateDoc(ref, { verified: true });
  alert("Email verified successfully! ✅");
  return true;
};
