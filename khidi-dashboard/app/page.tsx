"use client";

import { useState } from "react";
import Link from "next/link";
import HamburgerMenu from "@/components/HamburgerMenu";
import Sidebar from "@/components/Sidebar";
import { ThemeType, getTheme, themes } from "@/lib/themes";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return 'default';
    const saved = localStorage.getItem('briefing_theme') as ThemeType;
    return saved && themes[saved] ? saved : 'default';
  });

  const theme = getTheme(currentTheme);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.pageBg,
        backgroundImage: theme.patterns?.page,
        backgroundSize: theme.patterns?.page?.includes('linear-gradient') ? 'auto' : '24px 24px',
      }}
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-30"
        style={{ backgroundColor: theme.colors.headerBg, borderColor: theme.colors.headerBorder }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
            {theme.decorations?.noteHeader && <span className="mr-2">{theme.icon}</span>}
            KHIDI AI 채용 비서
          </Link>
          <HamburgerMenu onClick={() => setIsSidebarOpen(true)} theme={theme} />
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              {theme.decorations?.noteHeader && <span className="mr-3">{theme.icon}</span>}
              KHIDI AI 채용 비서
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.textSecondary }}>
              한국보건산업진흥원 취업 준비생을 위한
              <br />
              AI 기반 브리핑 분석 및 인바스켓 연습 플랫폼
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                ),
                color: theme.colors.blue,
                title: "실시간 브리핑",
                desc: "KHIDI 보건산업브리프, 글로벌동향, 뉴스레터를 한눈에 확인",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                ),
                color: theme.colors.green,
                title: "인바스켓 연습",
                desc: "실제 시험 형식의 인바스켓 문제로 실전 대비",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
                color: theme.colors.violet,
                title: "채용 분석",
                desc: "연도별 채용 트렌드와 유망 직무 예측",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl p-6 transition-all duration-200 group"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
                  boxShadow: theme.shadows?.card || 'none',
                  backgroundImage: theme.patterns?.card,
                  backgroundSize: '40px 40px',
                }}
                onMouseEnter={(e) => {
                  if (theme.shadows?.hover) {
                    e.currentTarget.style.boxShadow = theme.shadows.hover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows?.card || 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: feature.color.bg }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: feature.color.text }}
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-newsfeed"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.colors.buttonBg,
                color: theme.colors.buttonText,
                boxShadow: theme.shadows?.button || '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = theme.shadows?.hover || '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows?.button || '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              브리핑 대시보드
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/organization"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl border-2 transition-colors"
              style={{
                backgroundColor: theme.colors.cardBg,
                color: theme.colors.primary,
                borderColor: theme.colors.primary,
              }}
            >
              조직 분석
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 mt-auto"
        style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            KHIDI AI 채용 비서 - 한국보건산업진흥원 취업 준비의 시작
          </p>
        </div>
      </footer>
    </div>
  );
}
