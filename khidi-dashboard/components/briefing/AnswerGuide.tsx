'use client';

import { useMemo } from 'react';
import { ArticleWithAnalysis } from '@/lib/types';
import { Theme, getTheme } from '@/lib/themes';

interface AnswerGuideProps {
  article: ArticleWithAnalysis;
  fontSize?: number;
  theme?: Theme;
}

// AI 분석 결과에서 기획안 항목 추출
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

  // 불릿 라인 추출 (•, -, ○, * 모두 지원, **볼드** 제거, # 헤더 제외)
  const extractBullets = (text: string, max: number = 3): string[] => {
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => /^[•\-○\*]/.test(l) && !l.includes('###') && !l.includes('##'))
      .map(l => {
        // 불릿 기호 제거
        let cleaned = l.replace(/^[•\-○\*]\s*/, '');
        // **볼드**: 형식에서 제목만 추출하거나 전체 사용
        const boldMatch = cleaned.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
        if (boldMatch) {
          cleaned = boldMatch[1] + (boldMatch[2] ? ': ' + boldMatch[2] : '');
        }
        return cleaned.replace(/\*\*/g, '').trim();
      })
      .filter(l => l.length > 5);
    return lines.slice(0, max);
  };

  // 섹션 내용 추출 (## 헤더 사이, 이모지 무시)
  const getSection = (text: string, keyword: string): string => {
    // ##로 시작하고 keyword를 포함하는 라인 찾기, 다음 ## 또는 ### 헤더까지만
    const pattern = new RegExp(`##[^\\n]*${keyword}[^\\n]*\\n([\\s\\S]*?)(?=\\n#{2,}\\s|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1] : '';
  };

  // 사업명 = 제목에서 추출
  result.projectName = title.replace(/\[.*?\]/g, '').trim();

  // ## 현황 및 배경 → background
  const bgSection = getSection(analysis, '현황');
  if (bgSection) {
    // # 헤더 라인 제거 후 문단 텍스트를 문장으로 분리
    const cleanedBg = bgSection.split('\n')
      .filter(l => !l.trim().startsWith('#'))
      .join(' ')
      .replace(/\s+/g, ' ');
    const sentences = cleanedBg.split(/(?<=[.다])\s+/).filter(s => s.trim().length > 15 && !s.includes('##'));
    result.background = sentences.slice(0, 3).map(s => s.trim());
  }

  // ## 핵심 문제점 → problems
  const probSection = getSection(analysis, '문제점');
  if (probSection) {
    result.problems = extractBullets(probSection, 3);
  }

  // ## 대응 방안 → solutions (단기 + 중기 모두)
  const solSection = getSection(analysis, '방안');
  if (solSection) {
    result.solutions = extractBullets(solSection, 6);
  }

  // ## 기대 효과 → objectives + contents
  const effectSection = getSection(analysis, '기대');
  if (effectSection) {
    const allBullets = extractBullets(effectSection, 6);
    result.objectives = allBullets.slice(0, 2); // 앞 2개는 추진 목적
    result.contents = allBullets.slice(0, 3);   // 앞 3개는 사업 내용
  }

  // solutions이 비어있으면 contents로 대체
  if (result.solutions.length === 0 && result.contents.length > 0) {
    result.solutions = result.contents;
  }
  // contents가 비어있으면 solutions에서 가져오기
  if (result.contents.length === 0 && result.solutions.length > 0) {
    result.contents = result.solutions.slice(0, 3);
  }

  return result;
}

// 마크다운 **강조** 텍스트를 굵은 글씨로 변환
function renderWithEmphasis(text: string, textColor?: string) {
  if (!text) return null;

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

export default function AnswerGuide({ article, fontSize = 14, theme: propTheme }: AnswerGuideProps) {
  const theme = propTheme || getTheme('default');
  // 내용 영역에만 적용될 폰트 스타일
  const contentStyle = { fontSize: `${fontSize}px` };

  const parsed = useMemo(
    () => parseForTemplate(article.aiAnalysis || '', article.title),
    [article.aiAnalysis, article.title]
  );

  const hasAnalysis = article.aiAnalysis && article.aiAnalysis.length > 0;

  // 장식 요소 여부
  const hasDecorations = theme.decorations?.noteHeader;
  const bullet = theme.decorations?.bullet || '•';

  // 패턴 스타일
  const patternStyle = theme.patterns?.page ? {
    backgroundImage: theme.patterns.page,
    backgroundSize: theme.patterns.page.includes('linear-gradient') ? 'auto' : '24px 24px',
  } : {};

  return (
    <div className="flex-1 overflow-y-auto p-5 content-area" style={{ backgroundColor: theme.colors.guideBg, ...patternStyle }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          {hasDecorations ? (
            <>
              <span className="text-lg">{theme.icon}</span>
              <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>답안 작성 가이드</h2>
            </>
          ) : (
            <>
              <span className="w-6 h-6 rounded flex items-center justify-center text-sm text-white"
                    style={{ backgroundColor: theme.colors.violet.text }}>
                ✍️
              </span>
              <h2 className="font-bold" style={{ color: theme.colors.violet.text }}>답안 작성 가이드</h2>
            </>
          )}
        </div>

        {/* 기획안 템플릿 */}
        <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: theme.colors.cardBg, borderColor: hasDecorations ? theme.colors.primary : theme.colors.violet.border }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}>
            <span>{hasDecorations ? theme.icon : '★'}</span> 기획안 템플릿
            <span className="px-2 py-0.5 text-xs rounded ml-auto" style={{ backgroundColor: hasDecorations ? theme.colors.primaryLight : theme.colors.violet.bg, color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}>
              6개 항목
            </span>
          </h3>
          <div className="space-y-3" style={contentStyle}>
            {/* 사업 개요 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: hasDecorations ? theme.colors.textMuted : theme.colors.violet.border, backgroundColor: hasDecorations ? theme.colors.summaryBg : theme.colors.violet.bg }}>
              <div className="font-bold" style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.violet.text }}>◎ 사업 개요</div>
              <div className="mt-1 flex gap-2" style={{ color: theme.colors.textSecondary }}>
                <span className="mt-0.5" style={{ color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}>{bullet}</span>
                <span>사업명: {hasAnalysis && parsed.projectName ? (
                  <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{parsed.projectName}</span>
                ) : (
                  <span style={{ color: theme.colors.textMuted }}>[브리핑 주제를 바탕으로 작성]</span>
                )}</span>
              </div>
            </div>

            {/* 추진 배경 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: hasDecorations ? theme.colors.textMuted : theme.colors.violet.border, backgroundColor: hasDecorations ? theme.colors.summaryBg : theme.colors.violet.bg }}>
              <div className="font-bold" style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.violet.text }}>◎ 추진 배경</div>
              {hasAnalysis && parsed.background.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.background.map((item, idx) => (
                    <li key={idx} className="flex gap-2"><span className="mt-0.5" style={{ color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}>{bullet}</span><span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span></li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>{bullet}</span><span>현재 상황 및 트렌드</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>{bullet}</span><span>필요성 및 시급성</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>{bullet}</span><span>관련 정책/제도 동향</span></li>
                </ul>
              )}
            </div>

            {/* 추진 목적 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: hasDecorations ? theme.colors.textMuted : theme.colors.violet.border, backgroundColor: hasDecorations ? theme.colors.summaryBg : theme.colors.violet.bg }}>
              <div className="font-bold" style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.violet.text }}>◎ 추진 목적</div>
              {hasAnalysis && parsed.objectives.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.objectives.map((item, idx) => (
                    <li key={idx} className="flex gap-2"><span className="mt-0.5" style={{ color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}>{bullet}</span><span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span></li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>{bullet}</span><span>정량적 목표 (수치화)</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>{bullet}</span><span>정성적 목표</span></li>
                </ul>
              )}
            </div>

            {/* 문제점 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.amber.border, backgroundColor: theme.colors.amber.bg }}>
              <div className="font-bold" style={{ color: theme.colors.amber.text }}>◎ 문제점</div>
              {hasAnalysis && parsed.problems.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.problems.map((item, idx) => (
                    <li key={idx} className="flex gap-2"><span className="mt-0.5" style={{ color: theme.colors.amber.text }}>•</span><span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span></li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>현재 시스템/제도의 한계</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>인력/예산/기술 부족</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>외부 환경 요인</span></li>
                </ul>
              )}
            </div>

            {/* 해결방안 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.green.border, backgroundColor: theme.colors.green.bg }}>
              <div className="font-bold" style={{ color: theme.colors.green.text }}>◎ 해결방안</div>
              {hasAnalysis && parsed.solutions.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.solutions.map((item, idx) => (
                    <li key={idx} className="flex gap-2"><span className="mt-0.5" style={{ color: theme.colors.green.text }}>•</span><span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span></li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>단기: 즉시 실행 가능한 방안</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>중기: 제도/체계 정비</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>장기: 지속가능한 시스템 구축</span></li>
                </ul>
              )}
            </div>

            {/* 사업 내용 */}
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.blue.border, backgroundColor: theme.colors.blue.bg }}>
              <div className="font-bold" style={{ color: theme.colors.blue.text }}>◎ 사업 내용</div>
              {hasAnalysis && parsed.contents.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.contents.map((item, idx) => (
                    <li key={idx} className="flex gap-2"><span className="mt-0.5" style={{ color: theme.colors.blue.text }}>•</span><span>{renderWithEmphasis(item, theme.colors.textPrimary)}</span></li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>세부 추진 과제</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>추진 일정</span></li>
                  <li className="flex gap-2"><span style={{ color: theme.colors.textMuted }}>•</span><span>소요 예산</span></li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 문제점/해결방안 템플릿 */}
        <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.violet.border }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.violet.text }}>
            <span>★</span> 문제점 및 해결방안 템플릿
            <span className="px-2 py-0.5 text-xs rounded ml-auto" style={{ backgroundColor: theme.colors.violet.bg, color: theme.colors.violet.text }}>
              3개 항목
            </span>
          </h3>
          <div className="space-y-3" style={contentStyle}>
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.blue.border, backgroundColor: theme.colors.blue.bg }}>
              <div className="font-bold" style={{ color: theme.colors.blue.text }}>◎ 현황</div>
              {hasAnalysis && parsed.background.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.background.slice(0, 3).map((item, idx) => (
                    <li key={idx}>- {renderWithEmphasis(item, theme.colors.textPrimary)}</li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li>- 현재 상황 객관적 기술</li>
                  <li>- 관련 수치/통계</li>
                  <li>- 정책/제도 현황</li>
                </ul>
              )}
            </div>
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.amber.border, backgroundColor: theme.colors.amber.bg }}>
              <div className="font-bold" style={{ color: theme.colors.amber.text }}>◎ 문제점</div>
              {hasAnalysis && parsed.problems.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.problems.map((item, idx) => (
                    <li key={idx}>- {renderWithEmphasis(item, theme.colors.textPrimary)}</li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li>- 구조적 문제</li>
                  <li>- 운영상 문제</li>
                  <li>- 외부 환경 문제</li>
                </ul>
              )}
            </div>
            <div className="border-l-4 pl-3 py-2 rounded-r-lg" style={{ borderColor: theme.colors.green.border, backgroundColor: theme.colors.green.bg }}>
              <div className="font-bold" style={{ color: theme.colors.green.text }}>◎ 해결방안</div>
              {hasAnalysis && parsed.solutions.length > 0 ? (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textSecondary }}>
                  {parsed.solutions.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-medium" style={{ color: theme.colors.green.text }}>○ {idx === 0 ? '단기' : idx === 1 ? '중기' : '추가'}:</span> {renderWithEmphasis(item, theme.colors.textPrimary)}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-1 space-y-1" style={{ color: theme.colors.textMuted }}>
                  <li>
                    <span className="font-medium" style={{ color: theme.colors.green.text }}>○ 단기:</span> 즉시 실행 과제
                  </li>
                  <li>
                    <span className="font-medium" style={{ color: theme.colors.green.text }}>○ 중기:</span> 체계 정비
                  </li>
                  <li>
                    <span className="font-medium" style={{ color: theme.colors.green.text }}>○ 장기:</span> 지속가능 시스템
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 인바스켓 예상 포인트 */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.violet.border }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: theme.colors.violet.text }}>
            <span>💡</span> 인바스켓 예상 포인트
          </h3>
          <div className="space-y-2" style={contentStyle}>
            <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.colors.violet.bg }}>
              <span className="w-6 h-6 text-white rounded text-xs flex items-center justify-center shrink-0" style={{ backgroundColor: theme.colors.violet.text }}>
                1
              </span>
              <div>
                <div className="font-semibold" style={{ color: theme.colors.violet.text }}>우선순위 판단</div>
                <p className="mt-0.5" style={{ color: theme.colors.textSecondary }}>제한된 자원 배분 논술</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.colors.violet.bg }}>
              <span className="w-6 h-6 text-white rounded text-xs flex items-center justify-center shrink-0" style={{ backgroundColor: theme.colors.violet.text }}>
                2
              </span>
              <div>
                <div className="font-semibold" style={{ color: theme.colors.violet.text }}>이해관계자 조정</div>
                <p className="mt-0.5" style={{ color: theme.colors.textSecondary }}>부처간/기관간 협력 방안</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.colors.violet.bg }}>
              <span className="w-6 h-6 text-white rounded text-xs flex items-center justify-center shrink-0" style={{ backgroundColor: theme.colors.violet.text }}>
                3
              </span>
              <div>
                <div className="font-semibold" style={{ color: theme.colors.violet.text }}>성과 지표</div>
                <p className="mt-0.5" style={{ color: theme.colors.textSecondary }}>KPI 설정 및 평가 방안</p>
              </div>
            </div>
          </div>
        </div>

        {/* 작성 팁 */}
        <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: hasDecorations ? theme.colors.cardBg : theme.colors.amber.bg, borderColor: hasDecorations ? theme.colors.textMuted : theme.colors.amber.border }}>
          <div className="font-bold text-sm mb-1" style={{ color: hasDecorations ? theme.colors.textPrimary : theme.colors.amber.text }}>
            {hasDecorations ? theme.decorations?.bullet || '💡' : '💡'} 작성 팁
          </div>
          <ul className="space-y-1" style={{ ...contentStyle, color: theme.colors.textSecondary }}>
            {hasDecorations ? (
              <>
                <li className="flex gap-2"><span>{theme.decorations?.bullet || '•'}</span><span>시간 배분을 효율적으로!</span></li>
                <li className="flex gap-2"><span>{theme.decorations?.bullet || '•'}</span><span>항목별 명확하게 구분</span></li>
                <li className="flex gap-2"><span>{theme.decorations?.bullet || '•'}</span><span>구체적인 방안 제시</span></li>
              </>
            ) : (
              <>
                <li>• 시간 배분: 4문항을 모두 작성하려면 효율적인 시간 관리 필수</li>
                <li>• 구조화: 항목별로 명확하게 구분하여 작성</li>
                <li>• 구체성: 추상적 표현보다 구체적인 방안 제시</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
