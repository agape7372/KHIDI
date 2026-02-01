'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockArticles } from '@/lib/mockData';
import { ArticleWithAnalysis } from '@/lib/types';

// 딸기/초코 테마 컬러 (채도 낮춤)
const theme = {
  strawberry: {
    light: '#FDF7F8',
    medium: '#E8C8CD',
    dark: '#C9969D',
    accent: '#D4A5AD',
  },
  chocolate: {
    light: '#DDD0C0',
    medium: '#9D8B78',
    dark: '#6B5B50',
    accent: '#A89080',
  },
  cream: '#FDFBF8',
  dot: '#F0E8E0',
  // 기능별 색상 (대비되면서 테마와 조화)
  blue: { bg: '#E8F4F4', text: '#2A7B7B', border: '#5DAAAA' },      // 틸/청록
  green: { bg: '#EDF5E8', text: '#4A7744', border: '#7DB070' },     // 포레스트 그린
  amber: { bg: '#FEF3E8', text: '#B85C2C', border: '#E08850' },     // 테라코타
  violet: { bg: '#EDE8F5', text: '#5B4A8C', border: '#8B7AB8' },    // 인디고/포도
};

// 마크다운 **강조** 텍스트를 굵은 글씨로 변환
function renderWithEmphasis(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={idx} className="font-semibold" style={{ color: theme.chocolate.dark }}>{content}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

// AI 분석 마크다운 파싱
function parseAnalysis(markdown: string) {
  const sections = {
    background: '',
    problems: [] as string[],
    shortTerm: [] as string[],
    midTerm: [] as string[],
    quantitative: '',
    qualitative: '',
  };

  if (!markdown) return sections;

  const removeHeaders = (text: string): string => {
    return text.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');
  };

  const extractBullets = (text: string): string[] => {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => /^[•\-\*]/.test(l) && !l.startsWith('#'))
      .map(l => {
        let cleaned = l.replace(/^[•\-\*]\s*/, '');
        const boldMatch = cleaned.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
        if (boldMatch) {
          cleaned = boldMatch[1] + (boldMatch[2] ? ': ' + boldMatch[2] : '');
        }
        return cleaned.replace(/\*\*/g, '').trim();
      })
      .filter(l => l.length > 5);
  };

  const bgMatch = markdown.match(/##[^\n]*현황[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (bgMatch) sections.background = removeHeaders(bgMatch[1]).replace(/\n+/g, ' ').trim();

  const probMatch = markdown.match(/##[^\n]*문제점[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (probMatch) sections.problems = extractBullets(probMatch[1]);

  const solMatch = markdown.match(/##[^\n]*방안[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (solMatch) {
    const solText = solMatch[1];
    const shortMatch = solText.match(/#{2,4}[^\n]*단기[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (shortMatch) sections.shortTerm = extractBullets(shortMatch[1]);
    const midMatch = solText.match(/#{2,4}[^\n]*중기[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (midMatch) sections.midTerm = extractBullets(midMatch[1]);
  }

  const effectMatch = markdown.match(/##[^\n]*(?:기대|효과)[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (effectMatch) {
    const effText = effectMatch[1];
    const quantMatch = effText.match(/#{2,4}[^\n]*정량[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (quantMatch) sections.quantitative = extractBullets(quantMatch[1]).join('\n');
    const qualMatch = effText.match(/#{2,4}[^\n]*정성[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (qualMatch) sections.qualitative = extractBullets(qualMatch[1]).join('\n');
  }

  return sections;
}

// 핵심 수치 추출
function extractKeyMetrics(text: string) {
  const metrics: { value: string; label: string }[] = [];
  const moneyMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(조|억|만)\s*(원|달러)?/g);
  if (moneyMatch && moneyMatch[0]) metrics.push({ value: moneyMatch[0], label: '주요 예산/규모' });
  const percentMatch = text.match(/[+\-]?\d+(?:\.\d+)?%/g);
  if (percentMatch && percentMatch[0]) metrics.push({ value: percentMatch[0], label: '증감률' });
  const countMatch = text.match(/(\d+)\s*(개|건|곳|명|차)/g);
  if (countMatch && countMatch[0]) metrics.push({ value: countMatch[0], label: '주요 지표' });
  while (metrics.length < 3) metrics.push({ value: '-', label: '데이터 없음' });
  return metrics.slice(0, 3);
}

// 기획안 템플릿 파싱
function parseForTemplate(analysis: string, title: string) {
  const result = {
    projectName: '',
    background: [] as string[],
    objectives: [] as string[],
    problems: [] as string[],
    solutions: [] as string[],
    contents: [] as string[],
  };

  if (!analysis) return result;

  const extractBullets = (text: string, max: number = 3): string[] => {
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => /^[•\-○\*]/.test(l) && !l.includes('###') && !l.includes('##'))
      .map(l => {
        let cleaned = l.replace(/^[•\-○\*]\s*/, '');
        const boldMatch = cleaned.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
        if (boldMatch) cleaned = boldMatch[1] + (boldMatch[2] ? ': ' + boldMatch[2] : '');
        return cleaned.replace(/\*\*/g, '').trim();
      })
      .filter(l => l.length > 5);
    return lines.slice(0, max);
  };

  const getSection = (text: string, keyword: string): string => {
    const pattern = new RegExp(`##[^\\n]*${keyword}[^\\n]*\\n([\\s\\S]*?)(?=\\n#{2,}\\s|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1] : '';
  };

  result.projectName = title.replace(/\[.*?\]/g, '').trim();

  const bgSection = getSection(analysis, '현황');
  if (bgSection) {
    const cleanedBg = bgSection.split('\n').filter(l => !l.trim().startsWith('#')).join(' ').replace(/\s+/g, ' ');
    const sentences = cleanedBg.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 15 && !s.includes('##'));
    result.background = sentences.slice(0, 3).map(s => s.trim());
  }

  const probSection = getSection(analysis, '문제점');
  if (probSection) result.problems = extractBullets(probSection, 3);

  const solSection = getSection(analysis, '방안');
  if (solSection) result.solutions = extractBullets(solSection, 6);

  const effectSection = getSection(analysis, '기대');
  if (effectSection) {
    const allBullets = extractBullets(effectSection, 6);
    result.objectives = allBullets.slice(0, 2);
    result.contents = allBullets.slice(0, 3);
  }

  if (result.solutions.length === 0 && result.contents.length > 0) result.solutions = result.contents;
  if (result.contents.length === 0 && result.solutions.length > 0) result.contents = result.solutions.slice(0, 3);

  return result;
}

export default function BriefingDemoPage() {
  const params = useParams();
  const [fontSize, setFontSize] = useState(14);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [article, setArticle] = useState<ArticleWithAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  const checklistItems = ['핵심 수치 암기', '현황 분석 이해', '문제점 파악', '해결방안 숙지', '기획안 템플릿 연습', '모의 답안 작성'];

  // AI 분석 실행
  const runAnalysis = useCallback(async (articleData: ArticleWithAnalysis) => {
    if (typeof window === 'undefined') return;
    const apiKey = localStorage.getItem('gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const contentToAnalyze = [articleData.summary, articleData.content, articleData.originalContent].filter(Boolean).join('\n\n');
      if (contentToAnalyze.length < 50) {
        setAnalysisError('분석할 내용이 충분하지 않습니다.');
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: articleData.title, content: contentToAnalyze, apiKey: apiKey || undefined }),
      });

      if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        const id = params.id as string;
        localStorage.setItem(`khidi-analysis-${id}`, JSON.stringify({
          analysis: data.analysis,
          savedAt: new Date().toISOString(),
          title: articleData.title,
        }));
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

  // 데이터 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = decodeURIComponent(params.id as string);
    let foundArticle: ArticleWithAnalysis | null = null;

    const found = mockArticles.find(a => a.id === id);
    if (found) {
      foundArticle = { ...found };
    } else {
      try {
        const stored = localStorage.getItem('articleStack');
        if (stored) {
          const data = JSON.parse(stored);
          const articles = data.articles || data;
          const storedArticle = articles.find((a: ArticleWithAnalysis) => a.id === id);
          if (storedArticle) foundArticle = { ...storedArticle };
        }
      } catch (e) {
        console.error('Failed to parse article stack:', e);
      }
    }

    if (foundArticle) {
      try {
        const savedAnalysis = localStorage.getItem(`khidi-analysis-${id}`);
        if (savedAnalysis) {
          const parsed = JSON.parse(savedAnalysis);
          if (parsed?.analysis) foundArticle.aiAnalysis = parsed.analysis;
        }
      } catch (e) {
        console.error('Failed to parse saved analysis:', e);
      }
      setArticle(foundArticle);
      if (!foundArticle.aiAnalysis) runAnalysis(foundArticle);
    }

    // 체크리스트 로드
    try {
      const savedChecklist = localStorage.getItem(`study_progress_demo_${id}`);
      if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
    } catch (e) {
      console.error('Failed to load checklist:', e);
    }
  }, [params.id, runAnalysis]);

  // 북마크 상태
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
      if (idx > -1) bookmarks.splice(idx, 1);
      else bookmarks.push(id);
      localStorage.setItem('briefing_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  const toggleChecklist = (idx: number) => {
    const newChecklist = [...checklist];
    newChecklist[idx] = !newChecklist[idx];
    setChecklist(newChecklist);
    localStorage.setItem(`study_progress_demo_${params.id}`, JSON.stringify(newChecklist));
  };

  const analysis = article?.aiAnalysis || '';
  const parsed = parseAnalysis(analysis);
  const metrics = extractKeyMetrics((article?.summary || '') + ' ' + analysis);
  const template = parseForTemplate(analysis, article?.title || '');
  const contentStyle = { fontSize: `${fontSize}px` };
  const hasAnalysis = analysis.length > 0;
  const completedCount = checklist.filter(Boolean).length;

  // 도트 패턴
  const dotPattern = {
    backgroundImage: `radial-gradient(${theme.dot} 1.5px, transparent 1.5px)`,
    backgroundSize: '16px 16px',
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.cream, ...dotPattern }}>
        <div className="text-center">
          <div style={{ color: theme.chocolate.dark }} className="text-lg mb-4">🍓 브리핑을 찾을 수 없습니다</div>
          <Link href="/ai-newsfeed" className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: theme.strawberry.dark }}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.cream }}>
      {/* 상단 헤더 */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b"
              style={{ backgroundColor: 'white', borderColor: theme.strawberry.medium }}>
        <div className="flex items-center gap-4">
          <Link href="/ai-newsfeed" className="text-xs flex items-center gap-1" style={{ color: theme.chocolate.medium }}>
            🍓 ← 목록
          </Link>
          <div className="flex items-center gap-2">
            {(article.category || article.tags?.category) && (
              <span className="px-2 py-0.5 text-white text-xs rounded" style={{ backgroundColor: theme.strawberry.dark }}>
                {article.category || article.tags?.category}
              </span>
            )}
            {article.isNew && (
              <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: theme.green.bg, color: theme.green.text }}>NEW</span>
            )}
            <h1 className="font-bold text-sm" style={{ color: theme.chocolate.dark }}>{article.title}</h1>
            {article.link && (
              <a href={article.link} target="_blank" rel="noopener noreferrer"
                 className="text-xs flex items-center gap-1" style={{ color: theme.blue.text }}>
                <span>↗</span> 원문
              </a>
            )}
            <span style={{ color: theme.chocolate.light }}>|</span>
            <span className="text-xs" style={{ color: theme.chocolate.medium }}>{article.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleBookmark}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg`}
                  style={{ color: isBookmarked ? theme.amber.text : theme.chocolate.light }}>
            {isBookmarked ? '★' : '☆'}
          </button>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1" style={{ borderColor: theme.strawberry.medium }}>
            <button onClick={() => changeFontSize(-1)} className="w-6 h-6 flex items-center justify-center text-sm font-bold"
                    style={{ color: theme.chocolate.dark }}>A-</button>
            <span className="text-xs px-1" style={{ color: theme.chocolate.medium }}>{fontSize}</span>
            <button onClick={() => changeFontSize(1)} className="w-6 h-6 flex items-center justify-center text-sm font-bold"
                    style={{ color: theme.chocolate.dark }}>A+</button>
          </div>
          <button className="px-3 py-1.5 rounded text-xs text-white" style={{ backgroundColor: theme.chocolate.dark }}>
            🍫 저장
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 좌측: 학습 사이드바 */}
        <div className="w-52 overflow-y-auto p-4 border-r" style={{ backgroundColor: theme.strawberry.light, borderColor: theme.strawberry.medium }}>
          <div className="text-xs mb-1 px-2 py-1 rounded font-bold" style={{ backgroundColor: theme.strawberry.dark, color: 'white' }}>학습모드</div>
          <h3 className="font-bold text-sm mb-2 truncate" style={{ color: theme.chocolate.dark }}>{article.title}</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: theme.chocolate.medium }}>학습 진도</span>
              <span style={{ color: theme.strawberry.dark }}>{completedCount}/{checklistItems.length}</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: theme.strawberry.medium }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width: `${(completedCount / checklistItems.length) * 100}%`, backgroundColor: theme.strawberry.dark }} />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            {checklistItems.map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 rounded cursor-pointer text-sm"
                     style={{ backgroundColor: checklist[idx] ? theme.strawberry.medium : 'white', color: theme.chocolate.dark }}>
                <input type="checkbox" checked={checklist[idx]} onChange={() => toggleChecklist(idx)}
                       className="rounded" style={{ accentColor: theme.strawberry.dark }} />
                <span className={checklist[idx] ? 'line-through opacity-60' : ''}>{item}</span>
              </label>
            ))}
          </div>

          <button className="w-full py-2.5 rounded text-white text-sm font-bold mb-2"
                  style={{ backgroundColor: theme.strawberry.dark }}>
            🍓 모의 테스트
          </button>
          {article.link && (
            <a href={article.link} target="_blank" rel="noopener noreferrer"
               className="block text-center text-xs py-2 rounded border"
               style={{ borderColor: theme.chocolate.light, color: theme.chocolate.medium }}>
              원문 보기
            </a>
          )}
        </div>

        {/* 중앙: 브리핑 내용 */}
        <div className="flex-1 overflow-y-auto p-5 border-r" style={{ backgroundColor: 'white', borderColor: theme.strawberry.medium }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded flex items-center justify-center text-xs text-white" style={{ backgroundColor: theme.blue.text }}>
                📄
              </span>
              <h2 className="font-bold text-base" style={{ color: theme.chocolate.dark }}>브리핑 내용</h2>
            </div>

            {/* 핵심 수치 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {metrics.map((metric, idx) => {
                const colors = [theme.blue, theme.green, theme.violet];
                return (
                  <div key={idx} className="rounded-xl p-4 text-center" style={{ backgroundColor: colors[idx].bg }}>
                    <div className="text-xl font-bold" style={{ color: colors[idx].text }}>{metric.value}</div>
                    <div className="text-[10px] mt-1" style={{ color: theme.chocolate.medium }}>{metric.label}</div>
                  </div>
                );
              })}
            </div>

            {/* 요약 */}
            {article.summary && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                  <span style={{ color: theme.strawberry.dark }}>🍓</span> 요약
                </h3>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.cream, ...contentStyle }}>
                  <ul className="space-y-2" style={{ color: theme.chocolate.dark }}>
                    {article.summary.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 10).slice(0, 4).map((sentence, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span style={{ color: theme.strawberry.dark }}>♥</span>
                        <span>{renderWithEmphasis(sentence.trim())}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 분석 중 로딩 */}
            {isAnalyzing && (
              <div className="mb-5 p-8 rounded-xl text-center" style={{ backgroundColor: theme.strawberry.light }}>
                <div className="inline-flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" style={{ color: theme.strawberry.dark }} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-medium" style={{ color: theme.strawberry.dark }}>AI가 원문을 분석하고 있습니다...</span>
                </div>
              </div>
            )}

            {/* 분석 에러 */}
            {analysisError && !isAnalyzing && (
              <div className="mb-5 p-4 rounded-xl border" style={{ backgroundColor: theme.amber.bg, borderColor: theme.amber.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: theme.amber.text }}>
                    <span>⚠️</span>
                    <span className="text-sm">{analysisError}</span>
                  </div>
                  <button onClick={() => runAnalysis(article)}
                          className="px-3 py-1.5 text-xs rounded-lg" style={{ backgroundColor: theme.amber.border, color: theme.amber.text }}>
                    다시 시도
                  </button>
                </div>
              </div>
            )}

            {/* AI 분석 결과 */}
            {analysis && !isAnalyzing && (
              <>
                {/* 현황 분석 */}
                {parsed.background && (
                  <div className="mb-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                      <span style={{ color: theme.chocolate.medium }}>🍫</span> 현황 분석
                    </h3>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: theme.blue.bg, ...contentStyle }}>
                      <ul className="space-y-2" style={{ color: theme.chocolate.dark }}>
                        {parsed.background.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 10).slice(0, 4).map((sentence, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span style={{ color: theme.chocolate.medium }}>◆</span>
                            <span>{renderWithEmphasis(sentence.trim())}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 문제점 */}
                {parsed.problems.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                      <span style={{ color: theme.amber.text }}>⚠️</span> 문제점
                    </h3>
                    <div className="rounded-xl p-4" style={{ backgroundColor: theme.amber.bg, borderLeft: `4px solid ${theme.amber.border}`, ...contentStyle }}>
                      <ul className="space-y-2" style={{ color: theme.chocolate.dark }}>
                        {parsed.problems.slice(0, 5).map((problem, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span style={{ color: theme.amber.text }}>•</span>
                            <span>{renderWithEmphasis(problem)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 해결방안 */}
                {(parsed.shortTerm.length > 0 || parsed.midTerm.length > 0) && (
                  <div className="mb-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                      <span style={{ color: theme.green.text }}>💡</span> 해결방안
                    </h3>
                    <div className="space-y-3">
                      {parsed.shortTerm.length > 0 && (
                        <div className="rounded-xl p-4" style={{ backgroundColor: theme.green.bg, borderLeft: `4px solid ${theme.green.border}`, ...contentStyle }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 text-white text-xs font-bold rounded" style={{ backgroundColor: theme.green.text }}>
                              🌱 단기
                            </span>
                            <span className="font-medium text-sm" style={{ color: theme.chocolate.medium }}>즉시 실행 가능한 방안</span>
                          </div>
                          <ul className="space-y-1" style={{ color: theme.chocolate.dark }}>
                            {parsed.shortTerm.map((item, idx) => (
                              <li key={idx}>• {renderWithEmphasis(item)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsed.midTerm.length > 0 && (
                        <div className="rounded-xl p-4" style={{ backgroundColor: theme.green.bg, borderLeft: `4px solid ${theme.green.text}`, ...contentStyle }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 text-white text-xs font-bold rounded" style={{ backgroundColor: theme.green.text }}>
                              🌳 중기
                            </span>
                            <span className="font-medium text-sm" style={{ color: theme.chocolate.medium }}>체계 구축 방안</span>
                          </div>
                          <ul className="space-y-1" style={{ color: theme.chocolate.dark }}>
                            {parsed.midTerm.map((item, idx) => (
                              <li key={idx}>• {renderWithEmphasis(item)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 기대 효과 */}
                {(parsed.quantitative || parsed.qualitative) && (
                  <div className="mb-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                      <span style={{ color: theme.violet.text }}>📈</span> 기대 효과
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {parsed.quantitative && (
                        <div className="rounded-xl p-4" style={{ backgroundColor: theme.strawberry.light, borderLeft: `4px solid ${theme.strawberry.dark}`, ...contentStyle }}>
                          <div className="font-semibold mb-2 text-sm" style={{ color: theme.strawberry.dark }}>🍓 정량적 성과</div>
                          <ul className="space-y-1" style={{ color: theme.chocolate.dark }}>
                            {parsed.quantitative.split('\n').filter(Boolean).map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span style={{ color: theme.strawberry.dark }}>•</span>
                                <span>{renderWithEmphasis(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsed.qualitative && (
                        <div className="rounded-xl p-4" style={{ backgroundColor: theme.violet.bg, borderLeft: `4px solid ${theme.violet.border}`, ...contentStyle }}>
                          <div className="font-semibold mb-2 text-sm" style={{ color: theme.violet.text }}>🍫 정성적 성과</div>
                          <ul className="space-y-1" style={{ color: theme.chocolate.dark }}>
                            {parsed.qualitative.split('\n').filter(Boolean).map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span style={{ color: theme.violet.text }}>•</span>
                                <span>{renderWithEmphasis(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* AI 분석 없고 분석 중도 아닐 때 원문 표시 */}
            {!analysis && !isAnalyzing && article.content && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                  <span style={{ color: theme.blue.text }}>📄</span> 원문 내용
                </h3>
                <div className="p-4 rounded-xl leading-relaxed whitespace-pre-wrap"
                     style={{ backgroundColor: theme.cream, color: theme.chocolate.dark, ...contentStyle }}>
                  {article.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 답안 작성 가이드 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: theme.strawberry.light, ...dotPattern }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ backgroundColor: theme.chocolate.dark, color: 'white' }}>
                ✍️
              </span>
              <h2 className="font-bold text-base" style={{ color: theme.chocolate.dark }}>답안 작성 가이드</h2>
            </div>

            {/* 기획안 템플릿 */}
            <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: 'white', borderColor: theme.strawberry.medium }}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                <span style={{ color: theme.strawberry.dark }}>★</span> 기획안 템플릿
                <span className="px-2 py-0.5 text-xs rounded ml-auto font-medium" style={{ backgroundColor: theme.strawberry.medium, color: 'white' }}>
                  6개 항목
                </span>
              </h3>
              <div className="space-y-3" style={contentStyle}>
                {/* 사업 개요 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.cream, borderLeft: `4px solid ${theme.chocolate.light}` }}>
                  <div className="font-bold" style={{ color: theme.chocolate.dark }}>◎ 사업 개요</div>
                  <div className="mt-1 flex gap-2" style={{ color: theme.chocolate.dark }}>
                    <span style={{ color: theme.strawberry.dark }}>♥</span>
                    <span>사업명: {hasAnalysis && template.projectName ? (
                      <span className="font-medium">{template.projectName}</span>
                    ) : (
                      <span style={{ color: theme.chocolate.light }}>[브리핑 주제를 바탕으로 작성]</span>
                    )}</span>
                  </div>
                </div>

                {/* 추진 배경 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.cream, borderLeft: `4px solid ${theme.chocolate.light}` }}>
                  <div className="font-bold" style={{ color: theme.chocolate.dark }}>◎ 추진 배경</div>
                  {hasAnalysis && template.background.length > 0 ? (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.dark }}>
                      {template.background.map((item, idx) => (
                        <li key={idx} className="flex gap-2"><span style={{ color: theme.strawberry.dark }}>♥</span><span>{renderWithEmphasis(item)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.light }}>
                      <li className="flex gap-2"><span>♥</span><span>현재 상황 및 트렌드</span></li>
                      <li className="flex gap-2"><span>♥</span><span>필요성 및 시급성</span></li>
                    </ul>
                  )}
                </div>

                {/* 추진 목적 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.cream, borderLeft: `4px solid ${theme.chocolate.light}` }}>
                  <div className="font-bold" style={{ color: theme.chocolate.dark }}>◎ 추진 목적</div>
                  {hasAnalysis && template.objectives.length > 0 ? (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.dark }}>
                      {template.objectives.map((item, idx) => (
                        <li key={idx} className="flex gap-2"><span style={{ color: theme.strawberry.dark }}>♥</span><span>{renderWithEmphasis(item)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.light }}>
                      <li className="flex gap-2"><span>♥</span><span>정량적 목표 (수치화)</span></li>
                      <li className="flex gap-2"><span>♥</span><span>정성적 목표</span></li>
                    </ul>
                  )}
                </div>

                {/* 문제점 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.amber.bg, borderLeft: `4px solid ${theme.amber.border}` }}>
                  <div className="font-bold" style={{ color: theme.amber.text }}>◎ 문제점</div>
                  {hasAnalysis && template.problems.length > 0 ? (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.dark }}>
                      {template.problems.map((item, idx) => (
                        <li key={idx} className="flex gap-2"><span style={{ color: theme.amber.text }}>•</span><span>{renderWithEmphasis(item)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.light }}>
                      <li className="flex gap-2"><span>•</span><span>현재 시스템/제도의 한계</span></li>
                      <li className="flex gap-2"><span>•</span><span>인력/예산/기술 부족</span></li>
                    </ul>
                  )}
                </div>

                {/* 해결방안 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.green.bg, borderLeft: `4px solid ${theme.green.border}` }}>
                  <div className="font-bold" style={{ color: theme.green.text }}>◎ 해결방안</div>
                  {hasAnalysis && template.solutions.length > 0 ? (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.dark }}>
                      {template.solutions.map((item, idx) => (
                        <li key={idx} className="flex gap-2"><span style={{ color: theme.green.text }}>•</span><span>{renderWithEmphasis(item)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.light }}>
                      <li className="flex gap-2"><span>•</span><span>단기: 즉시 실행 가능한 방안</span></li>
                      <li className="flex gap-2"><span>•</span><span>중기: 제도/체계 정비</span></li>
                    </ul>
                  )}
                </div>

                {/* 사업 내용 */}
                <div className="pl-3 py-2 rounded-r-lg" style={{ backgroundColor: theme.blue.bg, borderLeft: `4px solid ${theme.blue.border}` }}>
                  <div className="font-bold" style={{ color: theme.blue.text }}>◎ 사업 내용</div>
                  {hasAnalysis && template.contents.length > 0 ? (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.dark }}>
                      {template.contents.map((item, idx) => (
                        <li key={idx} className="flex gap-2"><span style={{ color: theme.blue.text }}>•</span><span>{renderWithEmphasis(item)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-1 space-y-1" style={{ color: theme.chocolate.light }}>
                      <li className="flex gap-2"><span>•</span><span>세부 추진 과제</span></li>
                      <li className="flex gap-2"><span>•</span><span>추진 일정</span></li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 작성 팁 */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'white', borderColor: theme.chocolate.light }}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.chocolate.dark }}>
                <span style={{ color: theme.chocolate.medium }}>🍫</span> 작성 팁
              </h3>
              <ul className="space-y-2" style={{ ...contentStyle, color: theme.chocolate.dark }}>
                <li className="flex gap-2">
                  <span>🧁</span>
                  <span>시간 배분을 효율적으로!</span>
                </li>
                <li className="flex gap-2">
                  <span>🍰</span>
                  <span>항목별 명확하게 구분</span>
                </li>
                <li className="flex gap-2">
                  <span>🍪</span>
                  <span>구체적인 방안 제시</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
