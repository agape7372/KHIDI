"use client";

import { Theme, getTheme } from "@/lib/themes";

interface HamburgerMenuProps {
  onClick: () => void;
  theme?: Theme;
}

export default function HamburgerMenu({ onClick, theme: propTheme }: HamburgerMenuProps) {
  const theme = propTheme || getTheme('default');

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg transition-colors"
      aria-label="메뉴 열기"
      style={{ color: theme.colors.textSecondary }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
