'use client';

import { useMemo } from 'react';
import { ArticleWithAnalysis } from '@/lib/types';
import { Theme, ThemeType, getTheme } from '@/lib/themes';
import { ThemeHeaderDecoration, ThemeDivider } from '@/components/ThemeIllustrations';

interface BriefingContentProps {
  article: ArticleWithAnalysis;
  isAnalyzing?: boolean;
  analysisError?: string | null;
  onRetryAnalysis?: () => void;
  fontSize?: number;
  theme?: Theme;
  themeType?: ThemeType;
}

// 마크다운 **강조** 텍스트를 굵은 글씨로 변환
function renderWithEmphasis(text: string, textColor?: string) {
  if (!text) return null;

  // **텍스트** 패턴을 찾아서 굵은 글씨 + 진한 색상 적용
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold" style={{ color: textColor }}>
          {content}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

// AI 분석 마크다운 파싱 함수
function parseAnalysis(markdown: string) {
  const sections: {
    background: string;
    problems: string[];
    shortTerm: string[];
    midTerm: string[];
    quantitative: string;
    qualitative: string;
  } = {
    background: '',
    problems: [],
    shortTerm: [],
    midTerm: [],
    quantitative: '',
    qualitative: '',
  };

  if (!markdown) return sections;

  // 마크다운 헤더(#) 제거 헬퍼
  const removeHeaders = (text: string): string => {
    return text.split('\n')
      .filter(line => !line.trim().startsWith('#'))
      .join('\n');
  };

  // 불릿 추출 헬퍼 (•, -, * 지원, **볼드** 처리)
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

  // 섹션별 분리 (## 헤더 기준)
  const bgMatch = markdown.match(/##[^\n]*현황[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (bgMatch) {
    sections.background = removeHeaders(bgMatch[1]).replace(/\n+/g, ' ').trim();
  }

  const probMatch = markdown.match(/##[^\n]*문제점[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (probMatch) {
    sections.problems = extractBullets(probMatch[1]);
  }

  const solMatch = markdown.match(/##[^\n]*방안[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (solMatch) {
    const solText = solMatch[1];
    // ### 또는 #### 단기
    const shortMatch = solText.match(/#{2,4}[^\n]*단기[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (shortMatch) {
      sections.shortTerm = extractBullets(shortMatch[1]);
    }
    // ### 또는 #### 중기
    const midMatch = solText.match(/#{2,4}[^\n]*중기[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (midMatch) {
      sections.midTerm = extractBullets(midMatch[1]);
    }
  }

  const effectMatch = markdown.match(/##[^\n]*(?:기대|효과)[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (effectMatch) {
    const effText = effectMatch[1];
    const quantMatch = effText.match(/#{2,4}[^\n]*정량[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (quantMatch) {
      sections.quantitative = extractBullets(quantMatch[1]).join('\n');
    }
    const qualMatch = effText.match(/#{2,4}[^\n]*정성[^\n]*\n([\s\S]*?)(?=#{2,4}|$)/i);
    if (qualMatch) {
      sections.qualitative = extractBullets(qualMatch[1]).join('\n');
    }
  }

  return sections;
}

// 핵심 수치 추출 함수
function extractKeyMetrics(text: string) {
  const metrics: { value: string; label: string }[] = [];

  // 금액 패턴 (조, 억, 만원 등)
  const moneyMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(조|억|만)\s*(원|달러)?/g);
  if (moneyMatch && moneyMatch[0]) {
    metrics.push({ value: moneyMatch[0], label: '주요 예산/규모' });
  }

  // 퍼센트 패턴
  const percentMatch = text.match(/[+\-]?\d+(?:\.\d+)?%/g);
  if (percentMatch && percentMatch[0]) {
    metrics.push({ value: percentMatch[0], label: '증감률' });
  }

  // 개수 패턴
  const countMatch = text.match(/(\d+)\s*(개|건|곳|명|차)/g);
  if (countMatch && countMatch[0]) {
    metrics.push({ value: countMatch[0], label: '주요 지표' });
  }

  // 최소 3개 채우기
  while (metrics.length < 3) {
    metrics.push({ value: '-', label: '데이터 없음' });
  }

  return metrics.slice(0, 3);
}

export default function BriefingContent({
  article,
  isAnalyzing = false,
  analysisError = null,
  onRetryAnalysis,
  fontSize = 14,
  theme: propTheme,
  themeType = 'default',
}: BriefingContentProps) {
  const theme = propTheme || getTheme('default');
  const currentThemeType = themeType;
  const analysis = article.aiAnalysis || '';
  const parsed = useMemo(() => parseAnalysis(analysis), [analysis]);
  const metrics = useMemo(() => extractKeyMetrics(article.summary + ' ' + analysis), [article.summary, analysis]);

  const metricColors = [theme.colors.blue, theme.colors.green, theme.colors.violet];

  // 내용 영역에만 적용될 폰트 스타일
  const contentStyle = { fontSize: `${fontSize}px` };

  // 장식 요소 여부
  const hasDecorations = theme.decorations?.noteHeader;
  const bullet = theme.decorations?.bullet || '•';

  // 스티치 보더 스타일
  const stitchBorderStyle = theme.decorations?.stitch ? {
    border: `2px dashed ${theme.decorations.stitchColor}`,
    borderRadius: '16px',
    padding: '20px',
    margin: '8px',
  } : {};

  return (
    <div className="flex-1 overflow-y-auto border-r p-5 content-area"
         style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
      <div className="max-w-2xl mx-auto" style={hasDecorations ? stitchBorderStyle : {}}>
        {/* 테마별 노트 헤더 */}
        {hasDecorations && (
          <div className="text-center mb-6 pb-4" style={{ borderBottom: `1px dashed ${theme.colors.border}` }}>
            {/* 테마 일러스트 헤더 장식 */}
            <ThemeHeaderDecoration themeType={currentThemeType} />
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{theme.icon}</span>
              <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                {theme.name} 스터디 노트
              </h2>
              <span className="text-2xl">{theme.icon}</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm" style={{ color: theme.colors.textMuted }}>
              <span>{theme.decorations?.bullet || '•'}</span>
              <span>{theme.decorations?.bullet || '•'}</span>
              <span>{theme.decorations?.bullet || '•'}</span>
            </div>
            <div className="mt-2 text-xs" style={{ color: theme.colors.textMuted }}>
              date: {article.date || new Date().toLocaleDateString()} | subject: {article.category || article.tags?.category || '보건산업'}
            </div>
          </div>
        )}

        {/* 기본 헤더 */}
        {!hasDecorations && (
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded flex items-center justify-center text-xs text-white"
                  style={{ backgroundColor: theme.colors.blue.text }}>
              📄
            </span>
            <h2 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>브리핑 내용</h2>
          </div>
        )}

        {/* 핵심 수치 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {metrics.map((metric, idx) => (
            <div key={idx} className="rounded-xl p-4 text-center" style={{ backgroundColor: metricColors[idx].bg }}>
              <div className="text-xl font-bold" style={{ color: metricColors[idx].text }}>{metric.value}</div>
              <div className="text-[10px] mt-1" style={{ color: theme.colors.textSecondary }}>{metric.label}</div>
            </div>
          ))}
        </div>

        {/* 요약 */}
        {article.summary && (
          <div className="mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
              <span style={{ color: hasDecorations ? theme.colors.primary : theme.colors.blue.text }}>{hasDecorations ? theme.icon : '📋'}</span> 요약
            </h3>
            <div className="p-4 rounded-xl" style={{ ...contentStyle, backgroundColor: theme.colors.summaryBg }}>
              <ul className="space-y-2" style={{ color: theme.colors.textSecondary }}>
                {article.summary.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 10).slice(0, 4).map((sentence, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-0.5" style={{ color: hasDecorations ? theme.colors.primary : theme.colors.blue.text }}>{bullet}</span>
                    <span>{renderWithEmphasis(sentence.trim(), theme.colors.textPrimary)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 분석 중 로딩 */}
        {isAnalyzing && (
          <div className="mb-5 p-8 rounded-xl text-center" style={{ backgroundColor: theme.colors.violet.bg }}>
            <div className="inline-flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" style={{ color: theme.colors.violet.text }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="font-medium" style={{ color: theme.colors.violet.text }}>AI가 원문을 분석하고 있습니다...</span>
            </div>
            <p className="text-sm mt-2" style={{ color: theme.colors.violet.text }}>잠시만 기다려주세요</p>
          </div>
        )}

        {/* 분석 에러 */}
        {analysisError && !isAnalyzing && (
          <div className="mb-5 p-4 rounded-xl border" style={{ backgroundColor: theme.colors.amber.bg, borderColor: theme.colors.amber.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" style={{ color: theme.colors.amber.text }}>
                <span>⚠️</span>
                <span className="text-sm">{analysisError}</span>
              </div>
              {onRetryAnalysis && (
                <button
                  onClick={onRetryAnalysis}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.colors.amber.border, color: theme.colors.amber.text }}
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI 분석 결과 */}
        {analysis && !isAnalyzing ? (
          <>
            {/* 현황 분석 */}
            {parsed.background && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                  <span style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.blue.text }}>{hasDecorations ? theme.decorations?.bullet || '📋' : '📋'}</span> 현황 분석
                </h3>
                <div className="p-4 rounded-xl" style={{ ...contentStyle, backgroundColor: theme.colors.blue.bg }}>
                  <ul className="space-y-2" style={{ color: theme.colors.textSecondary }}>
                    {parsed.background.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 10).slice(0, 4).map((sentence, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-0.5" style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.blue.text }}>{hasDecorations ? theme.decorations?.bullet || '•' : '•'}</span>
                        <span>{renderWithEmphasis(sentence.trim(), theme.colors.textPrimary)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 문제점 */}
            {parsed.problems.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                  <span style={{ color: theme.colors.amber.text }}>⚠️</span> 문제점
                </h3>
                <div className="border-l-4 rounded-r-xl p-4" style={{ ...contentStyle, borderColor: theme.colors.amber.border, backgroundColor: theme.colors.amber.bg }}>
                  <ul className="space-y-2" style={{ color: theme.colors.textSecondary }}>
                    {parsed.problems.slice(0, 5).map((problem, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-0.5" style={{ color: theme.colors.amber.text }}>•</span>
                        <span>{renderWithEmphasis(problem, theme.colors.textPrimary)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 해결방안 */}
            {(parsed.shortTerm.length > 0 || parsed.midTerm.length > 0) && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                  <span style={{ color: theme.colors.green.text }}>💡</span> 해결방안
                </h3>
                <div className="space-y-3">
                  {parsed.shortTerm.length > 0 && (
                    <div className="border-l-4 rounded-r-xl p-4" style={{ ...contentStyle, borderColor: theme.colors.green.border, backgroundColor: theme.colors.green.bg }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-white text-xs font-bold rounded" style={{ backgroundColor: theme.colors.green.text }}>
                          단기
                        </span>
                        <span className="font-medium text-sm" style={{ color: theme.colors.textSecondary }}>즉시 실행 가능한 방안</span>
                      </div>
                      <ul className="space-y-1" style={{ color: theme.colors.textSecondary }}>
                        {parsed.shortTerm.map((item, idx) => (
                          <li key={idx}>• {renderWithEmphasis(item, theme.colors.textPrimary)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsed.midTerm.length > 0 && (
                    <div className="border-l-4 rounded-r-xl p-4" style={{ ...contentStyle, borderColor: theme.colors.green.border, backgroundColor: theme.colors.green.bg }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-white text-xs font-bold rounded" style={{ backgroundColor: theme.colors.green.text }}>
                          중기
                        </span>
                        <span className="font-medium text-sm" style={{ color: theme.colors.textSecondary }}>체계 구축 방안</span>
                      </div>
                      <ul className="text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
                        {parsed.midTerm.map((item, idx) => (
                          <li key={idx}>• {renderWithEmphasis(item, theme.colors.textPrimary)}</li>
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
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                  <span style={{ color: theme.colors.violet.text }}>📈</span> 기대 효과
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {parsed.quantitative && (
                    <div className="border-l-4 rounded-r-xl p-4" style={{ ...contentStyle, borderColor: theme.colors.violet.border, backgroundColor: theme.colors.violet.bg }}>
                      <div className="font-semibold mb-2 text-sm" style={{ color: theme.colors.violet.text }}>정량적 성과</div>
                      <ul className="text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
                        {parsed.quantitative.split('\n').filter(Boolean).map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-0.5" style={{ color: theme.colors.violet.text }}>•</span>
                            <span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsed.qualitative && (
                    <div className="border-l-4 rounded-r-xl p-4" style={{ ...contentStyle, borderColor: theme.colors.violet.border, backgroundColor: theme.colors.violet.bg }}>
                      <div className="font-semibold mb-2 text-sm" style={{ color: theme.colors.violet.text }}>정성적 성과</div>
                      <ul className="text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
                        {parsed.qualitative.split('\n').filter(Boolean).map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-0.5" style={{ color: theme.colors.violet.text }}>•</span>
                            <span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* AI 분석 없고 분석 중도 아닐 때 원문 표시 */}
        {!analysis && !isAnalyzing && article.content && (
          <div className="mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
              <span style={{ color: theme.colors.blue.text }}>📄</span> 원문 내용
            </h3>
            <div className="p-4 rounded-xl leading-relaxed whitespace-pre-wrap" style={{ ...contentStyle, backgroundColor: theme.colors.summaryBg, color: theme.colors.textSecondary }}>
              {article.content}
            </div>
          </div>
        )}

        {/* AI 분석 원문 (접기/펼치기) */}
        {analysis && (
          <details className="mb-5">
            <summary className="cursor-pointer text-sm py-2 hover:opacity-80" style={{ color: theme.colors.textMuted }}>
              AI 분석 원문 보기
            </summary>
            <div className="mt-2 p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: theme.colors.summaryBg, color: theme.colors.textSecondary }}>
              {analysis}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
