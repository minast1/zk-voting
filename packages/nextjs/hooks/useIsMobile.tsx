import { useEffect, useState } from "react";

export function useIsMobile() {
  // 767px is the standard "mobile" ceiling before Tailwind's 'md' (768px) kicks in
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    // Initial check
    setIsMobile(media.matches);

    // Listener for resize events
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
}
