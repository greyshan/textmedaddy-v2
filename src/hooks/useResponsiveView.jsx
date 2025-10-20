import { useEffect, useState } from "react";

export default function useResponsiveView() {
  const [view, setView] = useState("desktop"); // desktop | tablet | mobile

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setView("mobile");
      else if (width < 1024) setView("tablet");
      else setView("desktop");
    };
    handleResize(); // initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return view;
}
