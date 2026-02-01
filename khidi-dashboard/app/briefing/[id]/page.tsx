'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import StudySidebar from '@/components/briefing/StudySidebar';
import BriefingContent from '@/components/briefing/BriefingContent';
import AnswerGuide from '@/components/briefing/AnswerGuide';
import MockTestModal from '@/components/briefing/MockTestModal';
import TextToolbar from '@/components/briefing/TextToolbar';
import { mockArticles } from '@/lib/mockData';
import { ArticleWithAnalysis } from '@/lib/types';
import { ThemeType, getTheme, themes } from '@/lib/themes';

export default function BriefingDetailPage() {
  const params = useParams();
  const [fontSize, setFontSize] = useState(14);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [article, setArticle] = useState<ArticleWithAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const theme = getTheme(currentTheme);

  // 테마 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('briefing_theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // 테마 변경
  const changeTheme = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('briefing_theme', newTheme);
    setShowThemeMenu(false);
  };

  // AI 분석 실행
  const runAnalysis = useCallback(async (articleData: ArticleWithAnalysis) => {
    if (typeof window === 'undefined') return;

    // localStorage 또는 환경 변수에서 API 키 가져오기
    const apiKey = localStorage.getItem('gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // 분석할 콘텐츠 준비 (summary + content)
      const contentToAnalyze = [
        articleData.summary,
        articleData.content,
        articleData.originalContent,
      ].filter(Boolean).join('\n\n');

      if (contentToAnalyze.length < 50) {
        setAnalysisError('분석할 내용이 충분하지 않습니다.');
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleData.title,
          content: contentToAnalyze,
          apiKey: apiKey || undefined, // 서버에서 환경 변수 사용하도록
        }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // 분석 결과 저장
        const id = params.id as string;
        localStorage.setItem(`khidi-analysis-${id}`, JSON.stringify({
          analysis: data.analysis,
          savedAt: new Date().toISOString(),
          title: articleData.title,
        }));

        // article 업데이트
        setArticle((prev) => prev ? { ...prev, aiAnalysis: data.analysis } : null);
      } else {
        setAnalysisError(data.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [params.id]);

  // 브리핑 데이터 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // URL 디코딩된 ID
    const id = decodeURIComponent(params.id as string);
    let foundArticle: ArticleWithAnalysis | null = null;

    console.log('=== Briefing Debug ===');
    console.log('Looking for ID:', id);

    // mockData에서 찾거나 localStorage에서 로드
    const found = mockArticles.find(a => a.id === id);
    if (found) {
      foundArticle = { ...found };
      console.log('Found in mockData');
    } else {
      // localStorage에서 저장된 기사 확인
      try {
        const stored = localStorage.getItem('articleStack');
        if (stored) {
          const data = JSON.parse(stored);
          const articles = data.articles || data;
          console.log('Stored article IDs:', articles.map((a: ArticleWithAnalysis) => a.id));
          const storedArticle = articles.find((a: ArticleWithAnalysis) => a.id === id);
          if (storedArticle) {
            foundArticle = { ...storedArticle };
            console.log('Found in localStorage');
          } else {
            console.log('NOT found in localStorage');
          }
        } else {
          console.log('No articleStack in localStorage');
        }
      } catch (e) {
        console.error('Failed to parse article stack:', e);
      }
    }

    // 저장된 AI 분석 불러오기
    if (foundArticle) {
      try {
        const savedAnalysis = localStorage.getItem(`khidi-analysis-${id}`);
        if (savedAnalysis) {
          const parsed = JSON.parse(savedAnalysis);
          if (parsed?.analysis) {
            foundArticle.aiAnalysis = parsed.analysis;
          }
        }
      } catch (e) {
        console.error('Failed to parse saved analysis:', e);
      }
      setArticle(foundArticle);

      // AI 분석이 없으면 자동 분석 실행
      if (!foundArticle.aiAnalysis) {
        runAnalysis(foundArticle);
      }
    }
  }, [params.id, runAnalysis]);

  // 북마크 상태 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('briefing_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(params.id));
    } catch (e) {
      console.error('Failed to parse bookmarks:', e);
    }
  }, [params.id]);

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(22, Math.max(10, prev + delta)));
  };

  const toggleBookmark = () => {
    if (typeof window === 'undefined') return;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('briefing_bookmarks') || '[]');
      const id = params.id as string;
      const idx = bookmarks.indexOf(id);

      if (idx > -1) {
        bookmarks.splice(idx, 1);
      } else {
        bookmarks.push(id);
      }

      localStorage.setItem('briefing_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  // 배경 패턴 스타일
  const pagePatternStyle = theme.patterns?.page ? {
    backgroundImage: theme.patterns.page,
    backgroundSize: theme.patterns.page.includes('linear-gradient') ? 'auto' : '24px 24px',
  } : {};

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.pageBg }}>
        <div className="text-center">
          <div className="text-lg mb-4" style={{ color: theme.colors.textMuted }}>브리핑을 찾을 수 없습니다</div>
          <Link href="/ai-newsfeed" className="hover:underline" style={{ color: theme.colors.primary }}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 스캘럽 보더 CSS
  const scallopedBorderStyle = theme.decorations?.scalloped ? {
    backgroundImage: `radial-gradient(circle at 50% 0, transparent 8px, ${theme.decorations.scalllopColor} 8px, ${theme.decorations.scalllopColor} 10px, transparent 10px)`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: '20px 10px',
    height: '10px',
  } : {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.pageBg, ...pagePatternStyle }}>
      {/* 스캘럽 상단 보더 (딸기초코 테마) */}
      {theme.decorations?.scalloped && (
        <div style={scallopedBorderStyle} />
      )}

      {/* 상단 헤더 */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b"
              style={{ backgroundColor: theme.colors.headerBg, borderColor: theme.colors.headerBorder }}>
        <div className="flex items-center gap-4">
          <Link href="/ai-newsfeed" className="text-xs hover:opacity-80 flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
            {theme.decorations?.noteHeader && <span>{theme.icon}</span>}
            ← 목록
          </Link>
          <div className="flex items-center gap-2">
            {(article.category || article.tags?.category) && (
              <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}>
                {article.category || article.tags?.category}
              </span>
            )}
            {article.isNew && (
              <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: theme.colors.green.bg, color: theme.colors.green.text }}>NEW</span>
            )}
            <h1 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>{article.title}</h1>
            {article.link && (
              <a href={article.link} target="_blank" rel="noopener noreferrer"
                 className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: theme.colors.blue.text }}>
                <span>↗</span> 원문
              </a>
            )}
            <span style={{ color: theme.colors.border }}>|</span>
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{article.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 테마 선택 */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 text-lg"
              style={{ backgroundColor: theme.colors.primaryLight }}
              title="테마 변경"
            >
              {theme.icon}
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-1 rounded-lg shadow-lg border py-1 z-20"
                   style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => changeTheme(key as ThemeType)}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:opacity-80 ${currentTheme === key ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: currentTheme === key ? theme.colors.primaryLight : 'transparent',
                      color: theme.colors.textPrimary
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                    {currentTheme === key && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 북마크 */}
          <button
            onClick={toggleBookmark}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 text-lg"
            style={{ color: isBookmarked ? theme.colors.bookmark : theme.colors.textMuted }}
            title="북마크"
          >
            {isBookmarked ? '★' : '☆'}
          </button>
          {/* 폰트 크기 조절 */}
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1" style={{ borderColor: theme.colors.border }}>
            <button
              onClick={() => changeFontSize(-1)}
              className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold hover:opacity-80"
              style={{ color: theme.colors.textSecondary }}
            >
              A-
            </button>
            <span className="text-xs px-1" style={{ color: theme.colors.textMuted }}>{fontSize}</span>
            <button
              onClick={() => changeFontSize(1)}
              className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold hover:opacity-80"
              style={{ color: theme.colors.textSecondary }}
            >
              A+
            </button>
          </div>
          <button className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: theme.colors.buttonBg, color: theme.colors.buttonText }}>
            저장
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 좌측: 학습 사이드바 */}
        <StudySidebar
          article={article}
          onOpenModal={() => setIsModalOpen(true)}
          theme={theme}
        />

        {/* 중앙: 브리핑 내용 */}
        <BriefingContent
          article={article}
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
          onRetryAnalysis={() => runAnalysis(article)}
          fontSize={fontSize}
          theme={theme}
          themeType={currentTheme}
        />

        {/* 우측: 답안 작성 가이드 */}
        <AnswerGuide article={article} fontSize={fontSize} theme={theme} />
      </div>

      {/* 모의 테스트 모달 */}
      <MockTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        briefingId={params.id as string}
        theme={theme}
      />

      {/* 텍스트 서식 툴바 */}
      <TextToolbar />
    </div>
  );
}
