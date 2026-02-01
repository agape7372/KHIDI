"use client";

import { useState, useEffect } from "react";
import { ThemeType, themes, getTheme } from "@/lib/themes";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onCrawl: () => void;
  isCrawling: boolean;
  lastCrawled?: string;
  currentTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  onCrawl,
  isCrawling,
  lastCrawled,
  currentTheme = 'default',
  onThemeChange,
}: SettingsPanelProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(currentTheme);

  const theme = getTheme(selectedTheme);

  // 테마 변경시 상태 동기화
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    // localStorage에 저장
    localStorage.setItem('briefing_theme', newTheme);
  };

  const handleSave = () => {
    onApiKeyChange(inputKey);
  };

  if (!isOpen) return null;

  // 테마별 색상 미리보기 팔레트
  const getThemePreviewColors = (t: typeof theme) => [
    t.colors.primary,
    t.colors.pageBg,
    t.colors.textPrimary,
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-96 shadow-xl z-50 overflow-y-auto"
        style={{ backgroundColor: theme.colors.cardBg }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
            {theme.decorations?.noteHeader && <span>{theme.icon}</span>}
            설정
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

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* 테마 선택 */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textPrimary }}>
              테마 선택
            </label>
            <div className="space-y-2">
              {Object.entries(themes).map(([key, t]) => {
                const isSelected = selectedTheme === key;
                const previewColors = getThemePreviewColors(t);

                return (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key as ThemeType)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.primaryLight : 'transparent',
                    }}
                  >
                    {/* 테마 아이콘 */}
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>

                    {/* 테마 정보 */}
                    <div className="flex-1 text-left">
                      <div
                        className="text-sm font-medium"
                        style={{ color: isSelected ? theme.colors.primary : theme.colors.textPrimary }}
                      >
                        {t.name}
                      </div>
                      {t.decorations?.noteHeader && (
                        <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                          {t.decorations.bullet} 귀여운 스타일
                        </div>
                      )}
                    </div>

                    {/* 색상 미리보기 */}
                    <div className="flex gap-1">
                      {previewColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border"
                          style={{
                            backgroundColor: color,
                            borderColor: theme.colors.border
                          }}
                        />
                      ))}
                    </div>

                    {/* 선택 표시 */}
                    {isSelected && (
                      <span style={{ color: theme.colors.primary }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: theme.colors.textMuted }}>
              선택한 테마는 브리핑 피드와 학습모드에 적용됩니다.
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              Gemini API 키
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.pageBg,
                color: theme.colors.textPrimary,
              }}
            />
            <p className="mt-1 text-xs" style={{ color: theme.colors.textMuted }}>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: theme.colors.blue.text }}
              >
                Google AI Studio
              </a>
              에서 발급받으세요.
            </p>
            <button
              onClick={handleSave}
              className="mt-2 w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: theme.colors.buttonBg,
                color: theme.colors.buttonText,
              }}
            >
              API 키 저장
            </button>
            {apiKey && (
              <p className="mt-2 text-xs" style={{ color: theme.colors.green.text }}>
                ✓ API 키가 설정되었습니다.
              </p>
            )}
          </div>

          {/* 데이터 수집 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              데이터 수집
            </label>
            <button
              onClick={onCrawl}
              disabled={isCrawling}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.colors.green.text,
                color: '#FFFFFF',
              }}
            >
              {isCrawling ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  수집 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  KHIDI 브리핑 수집
                </>
              )}
            </button>
            {lastCrawled && (
              <p className="mt-2 text-xs" style={{ color: theme.colors.textMuted }}>
                마지막 수집: {lastCrawled}
              </p>
            )}
            <p className="mt-2 text-xs" style={{ color: theme.colors.textMuted }}>
              보건산업브리프, 글로벌동향, 뉴스레터에서 최신 자료를 수집합니다.
            </p>
          </div>

          {/* 안내 */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: theme.colors.guideBg }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>
              {theme.decorations?.bullet || '•'} 사용 안내
            </h3>
            <ul className="text-xs space-y-1" style={{ color: theme.colors.textSecondary }}>
              <li>{theme.decorations?.bullet || '•'} API 키를 입력하면 AI 분석 기능을 사용할 수 있습니다.</li>
              <li>{theme.decorations?.bullet || '•'} 브리핑 수집 버튼으로 실시간 데이터를 가져옵니다.</li>
              <li>{theme.decorations?.bullet || '•'} 각 브리핑의 &apos;AI 분석&apos; 버튼으로 인바스켓 답안을 생성합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
