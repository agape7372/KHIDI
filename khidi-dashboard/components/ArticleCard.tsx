"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/lib/types";
import Tag from "./Tag";
import AnalysisRenderer from "./AnalysisRenderer";
import { Theme, getTheme } from "@/lib/themes";

interface ArticleCardProps {
  article: Article;
  apiKey?: string;
  theme?: Theme;
}

// 저장된 분석 키 생성
const getStorageKey = (articleId: string) => `khidi-analysis-${articleId}`;

export default function ArticleCard({ article, apiKey, theme: propTheme }: ArticleCardProps) {
  const theme = propTheme || getTheme('default');
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const hasDecorations = theme.decorations?.noteHeader;

  // 학습 모드로 이동 (기사 데이터 저장 후 이동)
  const handleStudyMode = () => {
    try {
      // localStorage에서 기존 기사 스택 로드
      const stored = localStorage.getItem('articleStack');
      let articles: Article[] = [];
      if (stored) {
        const data = JSON.parse(stored);
        articles = data.articles || data || [];
      }
      // 중복 제거 후 현재 기사 추가
      articles = articles.filter((a: Article) => a.id !== article.id);
      articles.unshift(article);
      // 최대 50개까지만 저장
      localStorage.setItem('articleStack', JSON.stringify({ articles: articles.slice(0, 50) }));
    } catch (e) {
      console.error('Failed to save article:', e);
    }
    router.push(`/briefing/${article.id}`);
  };

  // 컴포넌트 마운트 시 저장된 분석 확인
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(article.id));
    if (saved) {
      setIsSaved(true);
    }
  }, [article.id]);

  // 분석 결과 저장
  const handleSave = () => {
    if (analysis) {
      localStorage.setItem(getStorageKey(article.id), JSON.stringify({
        analysis,
        savedAt: new Date().toISOString(),
        title: article.title,
      }));
      setIsSaved(true);
      alert("분석 결과가 저장되었습니다.");
    }
  };

  // 아카이브에서 불러오기
  const handleLoadArchive = () => {
    const saved = localStorage.getItem(getStorageKey(article.id));
    if (saved) {
      const data = JSON.parse(saved);
      setAnalysis(data.analysis);
      setShowArchive(true);
    }
  };

  // 아카이브 삭제
  const handleDeleteArchive = () => {
    if (confirm("저장된 분석을 삭제하시겠습니까?")) {
      localStorage.removeItem(getStorageKey(article.id));
      setIsSaved(false);
      setShowArchive(false);
      if (!showAnalysis) {
        setAnalysis(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      alert("설정에서 Gemini API 키를 먼저 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.summary,
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        setShowAnalysis(true);
      } else {
        alert(data.error || "분석 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <article
      className="rounded-xl p-4 transition-all duration-200"
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
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows?.card || 'none';
      }}
    >
      {/* 헤더: 소스 + 날짜 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.colors.textMuted }}>
          {article.source}
        </span>
        <span className="text-xs" style={{ color: theme.colors.textMuted }}>{article.date}</span>
      </div>

      {/* 제목 + NEW 뱃지 */}
      <div className="flex items-start gap-2 mb-2">
        <h3 className="flex-1">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-lg font-bold transition-colors line-clamp-2 hover:opacity-80"
            style={{ color: theme.colors.textPrimary }}
          >
            {article.title}
          </a>
        </h3>
        {article.isNew && (
          <span
            className="px-2 py-0.5 text-xs font-bold rounded-full shrink-0"
            style={{ backgroundColor: theme.colors.green.bg, color: theme.colors.green.text }}
          >
            NEW
          </span>
        )}
      </div>

      {/* 요약 */}
      <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
        {article.summary}
      </p>

      {/* 태그 + 버튼들 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Tag label={article.tags.type} theme={theme} />
          <Tag label={article.tags.category} theme={theme} />
          <Tag label={article.tags.layer} theme={theme} />
          <Tag label={article.tags.region} theme={theme} />
        </div>

        <div className="flex items-center gap-2">
          {/* AI 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            style={{ backgroundColor: theme.colors.violet.bg, color: theme.colors.violet.text }}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                분석 중
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {hasDecorations ? `${theme.icon} AI 분석` : 'AI 분석'}
              </>
            )}
          </button>

          {/* 아카이빙 버튼 */}
          <button
            onClick={handleLoadArchive}
            disabled={!isSaved}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
            style={{
              backgroundColor: isSaved ? theme.colors.amber.bg : theme.colors.border,
              color: isSaved ? theme.colors.amber.text : theme.colors.textMuted,
              cursor: isSaved ? 'pointer' : 'not-allowed',
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {hasDecorations ? `${theme.decorations?.bullet || '♦'} 아카이빙` : '아카이빙'}
          </button>

          {/* 학습 모드 버튼 */}
          <button
            onClick={handleStudyMode}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
            style={{ backgroundColor: theme.colors.primary, color: 'white' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {hasDecorations ? `${theme.decorations?.bullet || '♦'} 학습 모드` : '학습 모드'}
          </button>

          {/* 원문 보기 */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium flex items-center gap-1 shrink-0 hover:opacity-80"
            style={{ color: theme.colors.blue.text }}
          >
            원문 보기
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* AI 분석 결과 (새로 분석한 경우) */}
      {analysis && !showArchive && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-sm font-medium flex items-center gap-1 hover:opacity-80"
              style={{ color: theme.colors.violet.text }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAnalysis ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              인바스켓 분석 결과 {showAnalysis ? "접기" : "보기"}
            </button>

            {/* 저장 버튼 (아직 저장 안 된 경우만) */}
            {!isSaved && (
              <button
                onClick={handleSave}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                style={{ backgroundColor: theme.colors.green.bg, color: theme.colors.green.text }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                저장
              </button>
            )}
            {isSaved && (
              <span className="text-xs flex items-center gap-1" style={{ color: theme.colors.green.text }}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                저장됨
              </span>
            )}
          </div>

          {showAnalysis && (
            <div className="mt-3">
              <AnalysisRenderer content={analysis} theme={theme} />
            </div>
          )}
        </div>
      )}

      {/* 아카이빙된 분석 결과 */}
      {showArchive && analysis && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ backgroundColor: theme.colors.amber.bg, color: theme.colors.amber.text }}
              >
                아카이빙된 분석
              </span>
              <button
                onClick={() => setShowArchive(false)}
                className="text-xs hover:opacity-80"
                style={{ color: theme.colors.textMuted }}
              >
                닫기
              </button>
            </div>
            <button
              onClick={handleDeleteArchive}
              className="text-xs flex items-center gap-1 hover:opacity-80"
              style={{ color: theme.colors.amber.text }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          </div>
          <AnalysisRenderer content={analysis} theme={theme} />
        </div>
      )}
    </article>
  );
}
