import React from "react";

export default function Avatar({ src = "/assets/images/defaultUser.png", size = 48, ring = true }) {
  const s = size;
  return (
    <div
      className={`rounded-full overflow-hidden ${ring ? "p-[2px] bg-gradient-to-tr from-violet-500 to-indigo-400" : ""}`}
      style={{ width: s, height: s }}
    >
      <img src={src} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}
