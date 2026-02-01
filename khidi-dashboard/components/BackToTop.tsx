"use client";

import { useState, useEffect } from "react";
import { Theme, getTheme } from "@/lib/themes";

interface BackToTopProps {
  theme?: Theme;
}

export default function BackToTop({ theme: propTheme }: BackToTopProps) {
  const theme = propTheme || getTheme('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      style={{ backgroundColor: theme.colors.primary, color: 'white' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.primary;
      }}
      aria-label="맨 위로 이동"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
