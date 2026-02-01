"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HamburgerMenu from "@/components/HamburgerMenu";
import Sidebar from "@/components/Sidebar";
import FilterDropdown from "@/components/FilterDropdown";
import SearchInput from "@/components/SearchInput";
import ArticleList from "@/components/ArticleList";
import BackToTop from "@/components/BackToTop";
import SettingsPanel from "@/components/SettingsPanel";
import { useFilters } from "@/hooks/useFilters";
import { useArticleStack } from "@/hooks/useArticleStack";
import { mockArticles, getLastUpdated } from "@/lib/mockData";
import {
  TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  LAYER_OPTIONS,
  REGION_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/constants";
import { ThemeType, getTheme, themes } from "@/lib/themes";

export default function AINewsfeed() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [urlCategory, setUrlCategory] = useState<string | null>(null);
  const [urlSearch, setUrlSearch] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');

  const theme = getTheme(currentTheme);

  // 브리핑 스택 관리 훅
  const {
    articles: stackedArticles,
    addArticles,
    clearStack,
    stats,
  } = useArticleStack(mockArticles);

  // 저장된 데이터가 없으면 샘플 데이터 사용
  const articles = stats.isLoaded && stats.hasData ? stackedArticles : mockArticles;
  const dataSource = stats.isLoaded && stats.hasData ? "live" : "mock";

  // URL 파라미터에서 초기 필터값 추출 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUrlCategory(params.get("category"));
      setUrlSearch(params.get("search"));
    }
  }, []);

  // 테마 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem('briefing_theme') as ThemeType;
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // 테마 변경
  const handleThemeChange = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('briefing_theme', newTheme);
  };

  // 환경 변수 또는 localStorage에서 API 키 불러오기
  useEffect(() => {
    // 환경 변수에 설정된 키가 있으면 사용
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (envKey) {
      setApiKey(envKey);
    } else {
      const savedKey = localStorage.getItem("gemini_api_key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleCrawl = async () => {
    setIsCrawling(true);
    try {
      const response = await fetch("/api/crawl?detail=true");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.articles && data.articles.length > 0) {
        // 기존 스택에 새 기사 추가 (중복 제거됨)
        addArticles(data.articles);
        const newCount = data.articles.length;
        alert(`${newCount}개의 브리핑을 수집했습니다.`);
      } else if (data.error) {
        alert(`크롤링 실패: ${data.error}`);
      } else {
        alert("새로운 브리핑이 없거나 크롤링에 실패했습니다.");
      }
    } catch (error) {
      console.error("Crawl error:", error);
      const msg = error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`크롤링 중 오류: ${msg}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleClearStack = () => {
    if (confirm("저장된 모든 브리핑을 삭제하시겠습니까?")) {
      clearStack();
    }
  };

  const {
    filters,
    filteredArticles,
    counts,
    setTypeFilter,
    setCategoryFilter,
    setLayerFilter,
    setRegionFilter,
    setSourceFilter,
    setSearchFilter,
    resetFilters,
    hasActiveFilters,
  } = useFilters(articles, {
    initialCategory: urlCategory ? [urlCategory] : undefined,
    initialSearch: urlSearch || undefined,
  });

  // 스캘럽 보더 스타일 (딸기초코 테마)
  const scallopedBorderStyle = theme.decorations?.scalloped ? {
    backgroundImage: `radial-gradient(circle at 50% 0, transparent 8px, ${theme.decorations.scalllopColor} 8px, ${theme.decorations.scalllopColor} 10px, transparent 10px)`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: '20px 10px',
    height: '10px',
  } : {};

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.pageBg,
        backgroundImage: theme.patterns?.page,
        backgroundSize: theme.patterns?.page?.includes('linear-gradient') ? 'auto' : '24px 24px',
      }}
    >
      {/* 스캘럽 상단 보더 (딸기초코 테마) */}
      {theme.decorations?.scalloped && (
        <div style={scallopedBorderStyle} />
      )}

      {/* Header */}
      <header className="border-b sticky top-0 z-30" style={{ backgroundColor: theme.colors.headerBg, borderColor: theme.colors.headerBorder }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
            {theme.decorations?.noteHeader && <span>{theme.icon}</span>}
            KHIDI AI 채용 비서
          </Link>
          <div className="flex items-center gap-2">
            {/* 설정 버튼 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg transition-colors"
              title="설정"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <HamburgerMenu onClick={() => setIsSidebarOpen(true)} theme={theme} />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        onCrawl={handleCrawl}
        isCrawling={isCrawling}
        lastCrawled={stats.lastCrawled}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: theme.colors.textMuted }}>
            <Link href="/" className="hover:opacity-80" style={{ color: theme.colors.primary }}>홈</Link>
            <span>/</span>
            {urlCategory || urlSearch ? (
              <>
                <Link href="/ai-newsfeed" className="hover:opacity-80" style={{ color: theme.colors.primary }}>브리핑 피드</Link>
                <span>/</span>
                <span style={{ color: theme.colors.textPrimary }}>{urlCategory || urlSearch}</span>
              </>
            ) : (
              <span style={{ color: theme.colors.textPrimary }}>브리핑 피드</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
              {theme.decorations?.noteHeader && <span className="mr-2">{theme.icon}</span>}
              KHIDI 브리핑 피드
            </h1>
            {dataSource === "live" && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: theme.colors.green.bg, color: theme.colors.green.text }}
              >
                LIVE
              </span>
            )}
            {dataSource === "mock" && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: theme.colors.border, color: theme.colors.textSecondary }}
              >
                샘플
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            <a
              href="https://www.khidi.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: theme.colors.blue.text }}
            >
              한국보건산업진흥원
            </a>{" "}
            보건산업 동향 및 채용 정보
            {apiKey && (
              <span className="ml-2" style={{ color: theme.colors.green.text }}>• AI 분석 활성화됨</span>
            )}
          </p>
        </div>

        {/* URL Filter Indicator */}
        {(urlCategory || urlSearch) && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center justify-between border"
            style={{ backgroundColor: theme.colors.blue.bg, borderColor: theme.colors.blue.border }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: theme.colors.blue.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm" style={{ color: theme.colors.blue.text }}>
                {urlCategory && <span className="font-medium">&quot;{urlCategory}&quot;</span>}
                {urlSearch && <span className="font-medium">&quot;{urlSearch}&quot;</span>}
                {" "}관련 브리핑을 표시하고 있습니다.
              </span>
            </div>
            <Link
              href="/ai-newsfeed"
              className="text-sm font-medium hover:opacity-80"
              style={{ color: theme.colors.blue.text }}
            >
              전체 보기
            </Link>
          </div>
        )}

        {/* Filter Bar */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
            boxShadow: theme.shadows?.card || 'none',
          }}
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <FilterDropdown
              label="유형"
              options={TYPE_OPTIONS}
              selected={filters.type}
              onChange={setTypeFilter}
              counts={counts.type}
              theme={theme}
            />
            <FilterDropdown
              label="분류"
              options={CATEGORY_OPTIONS}
              selected={filters.category}
              onChange={setCategoryFilter}
              counts={counts.category}
              theme={theme}
            />
            <FilterDropdown
              label="발행처"
              options={LAYER_OPTIONS}
              selected={filters.layer}
              onChange={setLayerFilter}
              counts={counts.layer}
              theme={theme}
            />
            <FilterDropdown
              label="지역"
              options={REGION_OPTIONS}
              selected={filters.region}
              onChange={setRegionFilter}
              counts={counts.region}
              theme={theme}
            />
            <FilterDropdown
              label="출처"
              options={SOURCE_OPTIONS}
              selected={filters.source}
              onChange={setSourceFilter}
              counts={counts.source}
              theme={theme}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <SearchInput
              value={filters.search}
              onChange={setSearchFilter}
              placeholder="제목, 요약 검색..."
              theme={theme}
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-sm">
          <div className="flex items-center gap-3">
            <span style={{ color: theme.colors.textSecondary }}>
              총{" "}
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                {filteredArticles.length}
              </span>
              개 항목
              {stats.hasData && (
                <span className="ml-1" style={{ color: theme.colors.textMuted }}>
                  (저장됨: {stats.totalCount}개)
                </span>
              )}
            </span>
            {stats.hasData && (
              <button
                onClick={handleClearStack}
                className="text-xs hover:underline"
                style={{ color: theme.colors.amber.text }}
              >
                스택 초기화
              </button>
            )}
          </div>
          <span style={{ color: theme.colors.textMuted }}>
            최종 업데이트: {stats.lastCrawled || getLastUpdated()}
          </span>
        </div>

        {/* Article List */}
        <ArticleList
          articles={filteredArticles}
          isLoading={isCrawling}
          apiKey={apiKey}
          theme={theme}
        />
      </main>

      {/* Back to Top */}
      <BackToTop theme={theme} />
    </div>
  );
}
