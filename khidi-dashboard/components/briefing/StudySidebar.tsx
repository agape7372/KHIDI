'use client';

import { useState, useEffect } from 'react';
import { ArticleWithAnalysis } from '@/lib/types';
import { Theme, getTheme } from '@/lib/themes';

interface StudySidebarProps {
  article: ArticleWithAnalysis;
  onOpenModal: () => void;
  theme?: Theme;
}

const checklistItems = [
  { id: 'numbers', label: '핵심 수치 암기' },
  { id: 'analysis', label: '현황 분석 이해' },
  { id: 'problems', label: '문제점 파악' },
  { id: 'solutions', label: '해결방안 숙지' },
  { id: 'template', label: '기획안 템플릿 연습' },
  { id: 'mock', label: '모의 답안 작성' },
];

export default function StudySidebar({ article, onOpenModal, theme: propTheme }: StudySidebarProps) {
  const theme = propTheme || getTheme('default');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // localStorage에서 체크 상태 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(`study_progress_${article.id}`);
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse study progress:', e);
    }
  }, [article.id]);

  // 체크 상태 저장
  const toggleCheck = (id: string) => {
    const newChecked = checkedItems.includes(id)
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];

    setCheckedItems(newChecked);
    try {
      localStorage.setItem(`study_progress_${article.id}`, JSON.stringify(newChecked));
    } catch (e) {
      console.error('Failed to save study progress:', e);
    }
  };

  const progress = Math.round((checkedItems.length / checklistItems.length) * 100);

  // 스티치 효과 스타일
  const stitchStyle = theme.decorations?.stitch ? {
    border: `2px dashed ${theme.decorations.stitchColor}`,
    borderRadius: '12px',
  } : {};

  const hasDecorations = theme.decorations?.noteHeader;

  return (
    <aside className="w-56 border-r flex flex-col overflow-y-auto"
           style={{ fontSize: '13px', backgroundColor: theme.colors.sidebarBg, borderColor: theme.colors.border }}>
      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2">
          {hasDecorations && <span>{theme.icon}</span>}
          <span className="px-2 py-0.5 text-xs rounded font-bold"
                style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
            {hasDecorations ? '학습 체크리스트' : '학습모드'}
          </span>
        </div>
        <h2 className="font-bold mt-2 text-sm line-clamp-2" style={{ color: theme.colors.textPrimary }}>{article.title}</h2>
      </div>

      {/* 진도 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: theme.colors.textSecondary }}>학습 진도</span>
          <span className="font-bold" style={{ color: theme.colors.primary }}>{checkedItems.length}/{checklistItems.length}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.border }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: theme.colors.primary }} />
        </div>
      </div>

      {/* 학습 체크리스트 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!hasDecorations && (
          <div className="text-[10px] font-medium mb-2" style={{ color: theme.colors.textMuted }}>학습 체크리스트</div>
        )}
        <div className="space-y-2" style={theme.decorations?.stitch ? { ...stitchStyle, padding: '12px' } : {}}>
          {checklistItems.map(item => {
            const isChecked = checkedItems.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border"
                style={{
                  backgroundColor: isChecked ? theme.colors.green.bg : theme.colors.cardBg,
                  borderColor: isChecked ? theme.colors.green.border : theme.colors.border,
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  style={{ accentColor: isChecked ? theme.colors.green.text : theme.colors.primary }}
                />
                <span className="text-xs" style={{ color: isChecked ? theme.colors.green.text : theme.colors.textSecondary }}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
        <button
          onClick={onOpenModal}
          className="w-full px-3 py-2 rounded-lg text-xs mb-2 hover:opacity-90 flex items-center justify-center gap-1"
          style={{ backgroundColor: theme.colors.primary, color: 'white' }}
        >
          {hasDecorations && <span>{theme.icon}</span>}
          모의 테스트{hasDecorations ? ' 시작' : ''}
        </button>
        {article.link && (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-3 py-1.5 rounded text-xs text-center border hover:opacity-80"
            style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
          >
            원문 보기
          </a>
        )}
      </div>
    </aside>
  );
}
