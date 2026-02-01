"use client";

import { useState } from "react";
import Link from "next/link";
import { Theme, ThemeType, getTheme, themes } from "@/lib/themes";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  theme: Theme;
}

function AccordionItem({ title, children, theme }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: theme.colors.border }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ color: theme.colors.textPrimary }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-medium">{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 py-2" style={{ backgroundColor: theme.colors.sidebarBg }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [currentTheme] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return 'default';
    const saved = localStorage.getItem('briefing_theme') as ThemeType;
    return saved && themes[saved] ? saved : 'default';
  });
  const theme = getTheme(currentTheme);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: theme.colors.cardBg }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
            {theme.decorations?.noteHeader && <span className="mr-2">{theme.icon}</span>}
            메뉴
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.colors.textSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="py-2">
          <Link
            href="/"
            onClick={onClose}
            className="block px-4 py-3 font-medium transition-colors"
            style={{ color: theme.colors.textPrimary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            홈
          </Link>

          <AccordionItem title="보건산업" theme={theme}>
            <Link
              href="/ai-newsfeed"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              브리핑 피드
            </Link>
            <Link
              href="/organization"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              조직 분석
            </Link>
            <Link
              href="#"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              정책 동향
            </Link>
          </AccordionItem>

          <AccordionItem title="취업 준비" theme={theme}>
            <Link
              href="#"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              채용 분석
            </Link>
            <Link
              href="#"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              인바스켓 연습
            </Link>
            <Link
              href="#"
              onClick={onClose}
              className="block py-2 text-sm transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              면접 준비
            </Link>
          </AccordionItem>
        </nav>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.sidebarBg,
          }}
        >
          <p className="text-xs text-center" style={{ color: theme.colors.textMuted }}>
            KHIDI AI 채용 비서 v1.0
          </p>
        </div>
      </div>
    </>
  );
}
