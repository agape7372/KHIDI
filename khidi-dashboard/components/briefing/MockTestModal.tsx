'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, getTheme } from '@/lib/themes';

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefingId: string;
  theme?: Theme;
}

const planFields = ['사업 개요', '추진 배경', '추진 목적', '문제점', '해결방안', '사업 내용'];
const problemFields = ['현황', '문제점', '해결방안'];

export default function MockTestModal({ isOpen, onClose, briefingId, theme: propTheme }: MockTestModalProps) {
  const theme = propTheme || getTheme('default');
  const hasDecorations = theme.decorations?.noteHeader;

  // 타이머 상태
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdownTotal, setCountdownTotal] = useState(3600);
  const [countdownRemaining, setCountdownRemaining] = useState(3600);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 답안 상태
  const [planAnswers, setPlanAnswers] = useState<string[]>(Array(6).fill(''));
  const [problemAnswers, setProblemAnswers] = useState<string[]>(Array(3).fill(''));
  const [autoSaveIndicator, setAutoSaveIndicator] = useState('');

  // 자동저장 인터벌
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 타이머 시작
  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
  };

  // 타이머 일시정지
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // 타이머 리셋
  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'stopwatch') {
      setTimerSeconds(0);
    } else {
      setCountdownRemaining(countdownTotal);
    }
  };

  // 프리셋 설정
  const setPreset = (minutes: number) => {
    const total = minutes * 60;
    setCountdownTotal(total);
    setCountdownRemaining(total);
  };

  // 알람 재생
  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playBeep(880, 0, 0.2);
      playBeep(880, 0.3, 0.2);
      playBeep(1100, 0.6, 0.4);
    } catch (e) {
      console.log('Audio not supported');
    }
    alert('⏰ 시간이 종료되었습니다!');
  }, [soundEnabled]);

  // 타이머 효과
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setTimerSeconds(prev => prev + 1);
        } else {
          setCountdownRemaining(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              playAlarm();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode, playAlarm]);

  // 자동저장
  const autoSave = useCallback(() => {
    const hasContent = [...planAnswers, ...problemAnswers].some(a => a.trim().length > 0);
    if (hasContent) {
      localStorage.setItem(`mockTest_autosave_${briefingId}`, JSON.stringify({
        time: timerMode === 'stopwatch' ? formatTime(timerSeconds) : formatTime(countdownTotal - countdownRemaining),
        plan: planAnswers,
        problem: problemAnswers,
        savedAt: new Date().toISOString()
      }));
      setAutoSaveIndicator('자동저장됨');
      setTimeout(() => setAutoSaveIndicator(''), 2000);
    }
  }, [planAnswers, problemAnswers, briefingId, timerMode, timerSeconds, countdownTotal, countdownRemaining]);

  // 자동저장 시작
  useEffect(() => {
    if (isOpen) {
      autoSaveRef.current = setInterval(autoSave, 30000);
      // 자동저장 데이터 로드
      try {
        const stored = localStorage.getItem(`mockTest_autosave_${briefingId}`);
        if (stored) {
          const data = JSON.parse(stored);
          if (data?.savedAt) {
            const savedTime = new Date(data.savedAt);
            const now = new Date();
            const diffMin = Math.floor((now.getTime() - savedTime.getTime()) / 60000);
            if (diffMin < 60 && confirm(`${diffMin}분 전 자동저장된 답안이 있습니다. 불러올까요?`)) {
              setPlanAnswers(data.plan || Array(6).fill(''));
              setProblemAnswers(data.problem || Array(3).fill(''));
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse autosave data:', e);
      }
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [isOpen, briefingId, autoSave]);

  // 수동 저장
  const saveAnswer = () => {
    const time = timerMode === 'stopwatch' ? formatTime(timerSeconds) : formatTime(countdownTotal - countdownRemaining);
    localStorage.setItem(`mockTest_${Date.now()}`, JSON.stringify({
      briefingId,
      time,
      plan: planAnswers,
      problem: problemAnswers,
      savedAt: new Date().toISOString()
    }));
    alert('저장되었습니다!');
  };

  // Word 내보내기
  const exportWord = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR');
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const elapsed = timerMode === 'stopwatch' ? formatTime(timerSeconds) : formatTime(countdownTotal - countdownRemaining);

    const textToHtml = (text: string) => {
      if (!text || text.trim() === '') return '';
      return text.split('\n').filter(line => line.trim()).map(line => {
        const isSubItem = line.trim().startsWith('•');
        return `<p style="margin:2px 0; ${isSubItem ? 'margin-left:15px;' : ''}">${line}</p>`;
      }).join('');
    };

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8">
        <xml><w:Section><w:TopMargin>720</w:TopMargin><w:BottomMargin>720</w:BottomMargin><w:LeftMargin>720</w:LeftMargin><w:RightMargin>720</w:RightMargin></w:Section></xml>
        <style>
          @page { margin: 1.27cm; }
          body { font-family: '맑은 고딕', sans-serif; font-size: 10pt; line-height: 1.4; }
          h1 { text-align: center; font-size: 14pt; margin: 0 0 5px 0; }
          .meta { text-align: center; color: #666; font-size: 9pt; margin-bottom: 15px; }
          .section { font-weight: bold; font-size: 11pt; border-bottom: 1px solid ${theme.colors.violet.text}; color: ${theme.colors.violet.text}; padding-bottom: 3px; margin: 15px 0 8px 0; }
          .section2 { border-color: ${theme.colors.blue.text}; color: ${theme.colors.blue.text}; }
          .item { margin-bottom: 8px; }
          .item-title { font-weight: bold; }
          .item-content { margin-left: 12px; }
        </style>
      </head>
      <body>
        <h1>KHIDI 인바스켓 모의 답안</h1>
        <p class="meta">${dateStr} ${timeStr} · 소요시간: ${elapsed}</p>
        <div class="section">★ 기획안</div>
        ${planFields.map((label, i) => {
          const content = textToHtml(planAnswers[i]);
          if (!content) return '';
          return `<div class="item"><span class="item-title">◎ ${label}</span><div class="item-content">${content}</div></div>`;
        }).join('')}
        <div class="section section2">★ 문제점 및 해결방안</div>
        ${problemFields.map((label, i) => {
          const content = textToHtml(problemAnswers[i]);
          if (!content) return '';
          return `<div class="item"><span class="item-title">◎ ${label}</span><div class="item-content">${content}</div></div>`;
        }).join('')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const filename = `KHIDI_모의답안_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.doc`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // 글자 수 계산
  const getCharCount = (text: string) => {
    const chars = text.length;
    const lines = text.split('\n').filter(l => l.trim()).length;
    return `${chars}자 / ${lines}줄`;
  };

  // 자동 bullet 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, bullet: string) => {
    const textarea = e.currentTarget;
    const { selectionStart, value } = textarea;

    if (e.key === 'Enter') {
      e.preventDefault();
      const newText = value.substring(0, selectionStart) + '\n' + bullet + ' ' + value.substring(selectionStart);
      const newPos = selectionStart + 2 + bullet.length;

      // React state를 통해 업데이트
      const name = textarea.name;
      const [type, idx] = name.split('-');
      const index = parseInt(idx, 10);
      if (isNaN(index)) return;

      if (type === 'plan') {
        const newAnswers = [...planAnswers];
        newAnswers[index] = newText;
        setPlanAnswers(newAnswers);
      } else {
        const newAnswers = [...problemAnswers];
        newAnswers[index] = newText;
        setProblemAnswers(newAnswers);
      }

      // 커서 위치 설정
      setTimeout(() => {
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      }, 0);
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const lines = value.substring(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const lineStart = selectionStart - currentLine.length;

      if (currentLine.startsWith(bullet + ' ')) {
        const afterBullet = currentLine.substring(2);
        const newLine = '  • ' + afterBullet;
        const newText = value.substring(0, lineStart) + newLine + value.substring(selectionStart);

        const name = textarea.name;
        const [type, idx] = name.split('-');
        const index = parseInt(idx, 10);
        if (isNaN(index)) return;

        if (type === 'plan') {
          const newAnswers = [...planAnswers];
          newAnswers[index] = newText;
          setPlanAnswers(newAnswers);
        } else {
          const newAnswers = [...problemAnswers];
          newAnswers[index] = newText;
          setProblemAnswers(newAnswers);
        }
      }
    }
  };

  // 타이머 색상 (테마 적용)
  const getTimerBgColor = () => {
    if (timerMode === 'stopwatch') return theme.colors.border;
    if (countdownRemaining <= 300) return '#FEE2E2';
    if (countdownRemaining <= 600) return theme.colors.amber.bg;
    return theme.colors.green.bg;
  };

  const getTimerTextColor = () => {
    if (timerMode === 'stopwatch') return theme.colors.textPrimary;
    if (countdownRemaining <= 300) return '#DC2626';
    if (countdownRemaining <= 600) return theme.colors.amber.text;
    return theme.colors.green.text;
  };

  const getProgressBarColor = () => {
    if (countdownRemaining <= 300) return '#EF4444';
    if (countdownRemaining <= 600) return theme.colors.amber.text;
    return theme.colors.green.text;
  };

  // 필드별 색상 가져오기 (딸기초코 테마는 통일감 있게)
  const getFieldColors = (label: string, type: 'plan' | 'problem') => {
    // 딸기초코 테마는 부드러운 크림톤 배경 + 포인트 보더
    if (hasDecorations) {
      const subtleBg = '#FFFAF5'; // 아주 연한 크림색
      if (label === '문제점') {
        return { border: '#D4A373', bg: subtleBg, text: '#B85C2C' };
      }
      if (label === '해결방안') {
        return { border: '#7DB070', bg: subtleBg, text: '#4A7744' };
      }
      if (label === '현황') {
        return { border: '#5DAAAA', bg: subtleBg, text: '#2A7B7B' };
      }
      if (type === 'plan') {
        return { border: theme.colors.primary, bg: subtleBg, text: theme.colors.primary };
      }
      return { border: '#5DAAAA', bg: subtleBg, text: '#2A7B7B' };
    }

    // 기본 테마는 색상 배경 유지
    if (label === '문제점') {
      return { border: theme.colors.amber.text, bg: theme.colors.amber.bg, text: theme.colors.amber.text };
    }
    if (label === '해결방안') {
      return { border: theme.colors.green.text, bg: theme.colors.green.bg, text: theme.colors.green.text };
    }
    if (label === '현황') {
      return { border: theme.colors.blue.text, bg: theme.colors.blue.bg, text: theme.colors.blue.text };
    }
    if (type === 'plan') {
      return { border: theme.colors.violet.text, bg: theme.colors.violet.bg, text: theme.colors.violet.text };
    }
    return { border: theme.colors.blue.text, bg: theme.colors.blue.bg, text: theme.colors.blue.text };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        className="rounded-2xl w-[90vw] h-[90vh] flex flex-col shadow-2xl"
        style={{ backgroundColor: hasDecorations ? '#FDF8F5' : theme.colors.cardBg }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: hasDecorations ? '#FDF8F5' : undefined,
          }}
        >
          <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
            {hasDecorations ? `${theme.icon} ` : '✍️ '}모의 답안 작성
          </h2>
          <div className="flex items-center gap-3">
            {/* 타이머 */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
              style={{ minWidth: '420px', backgroundColor: getTimerBgColor() }}
            >
              {/* 모드 전환 */}
              <div className="flex rounded p-0.5" style={{ backgroundColor: theme.colors.border }}>
                <button
                  onClick={() => { setTimerMode('stopwatch'); setTimerSeconds(0); }}
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: timerMode === 'stopwatch' ? theme.colors.cardBg : 'transparent',
                    color: timerMode === 'stopwatch' ? theme.colors.textPrimary : theme.colors.textMuted,
                    fontWeight: timerMode === 'stopwatch' ? 500 : 400,
                  }}
                >
                  스톱워치
                </button>
                <button
                  onClick={() => { setTimerMode('countdown'); setPreset(60); }}
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: timerMode === 'countdown' ? theme.colors.cardBg : 'transparent',
                    color: timerMode === 'countdown' ? theme.colors.textPrimary : theme.colors.textMuted,
                    fontWeight: timerMode === 'countdown' ? 500 : 400,
                  }}
                >
                  카운트다운
                </button>
              </div>

              {/* 프리셋 */}
              {timerMode === 'countdown' ? (
                <div className="flex gap-1">
                  {[30, 60, 90].map((min) => (
                    <button
                      key={min}
                      onClick={() => setPreset(min)}
                      className="px-2 py-1 rounded text-xs hover:opacity-80"
                      style={{ backgroundColor: theme.colors.blue.bg, color: theme.colors.blue.text }}
                    >
                      {min}분
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-1" style={{ visibility: 'hidden' }}>
                  <span className="px-2 py-1 text-xs">30분</span>
                  <span className="px-2 py-1 text-xs">60분</span>
                  <span className="px-2 py-1 text-xs">90분</span>
                </div>
              )}

              {/* 시간 표시 */}
              <div className="flex items-center gap-1">
                <span
                  className="text-2xl font-mono font-bold"
                  style={{ color: getTimerTextColor() }}
                >
                  {timerMode === 'stopwatch' ? formatTime(timerSeconds) : formatTime(countdownRemaining)}
                </span>
                {timerMode === 'countdown' && (
                  <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                    / {formatTime(countdownTotal)}
                  </span>
                )}
              </div>

              {/* 진행바 */}
              {timerMode === 'countdown' && (
                <div
                  className="w-24 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: theme.colors.border }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(countdownRemaining / countdownTotal) * 100}%`,
                      backgroundColor: getProgressBarColor(),
                    }}
                  />
                </div>
              )}

              {/* 컨트롤 */}
              <div className="flex gap-1">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="px-2 py-1 rounded text-xs text-white hover:opacity-80"
                    style={{ backgroundColor: theme.colors.green.text }}
                  >
                    ▶
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="px-2 py-1 rounded text-xs text-white hover:opacity-80"
                    style={{ backgroundColor: theme.colors.amber.text }}
                  >
                    ⏸
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="px-2 py-1 rounded text-xs text-white hover:opacity-80"
                  style={{ backgroundColor: theme.colors.textSecondary }}
                >
                  ↺
                </button>
              </div>

              {/* 알림 토글 */}
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  style={{ accentColor: theme.colors.primary }}
                />
                <span className="text-xs" style={{ color: theme.colors.textMuted }}>🔔</span>
              </label>
            </div>

            {autoSaveIndicator && (
              <span className="text-xs" style={{ color: theme.colors.green.text }}>{autoSaveIndicator}</span>
            )}
            <button
              onClick={saveAnswer}
              className="px-4 py-2 rounded-lg text-sm text-white hover:opacity-80"
              style={{ backgroundColor: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}
            >
              {hasDecorations ? `${theme.icon} ` : '💾 '}저장
            </button>
            <button
              onClick={exportWord}
              className="px-4 py-2 rounded-lg text-sm text-white hover:opacity-80"
              style={{ backgroundColor: hasDecorations ? '#6B5B50' : theme.colors.blue.text }}
            >
              {hasDecorations ? `${theme.decorations?.bullet || '📝'} ` : '📝 '}Word
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm hover:opacity-80"
              style={{ backgroundColor: theme.colors.border, color: theme.colors.textSecondary }}
            >
              ✕ 닫기
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌: 기획안 */}
          <div
            className="w-1/2 overflow-y-auto p-5 border-r"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: hasDecorations ? '#FDF8F5' : undefined,
            }}
          >
            <h3
              className="font-bold mb-4 flex items-center gap-2"
              style={{ color: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}
            >
              <span
                className="w-6 h-6 text-white rounded flex items-center justify-center text-xs"
                style={{ backgroundColor: hasDecorations ? theme.colors.primary : theme.colors.violet.text }}
              >
                {hasDecorations ? theme.icon : '★'}
              </span>
              기획안 템플릿
              <span
                className="px-2 py-0.5 text-xs rounded ml-auto"
                style={{
                  backgroundColor: hasDecorations ? theme.colors.primaryLight : theme.colors.violet.bg,
                  color: hasDecorations ? theme.colors.primary : theme.colors.violet.text
                }}
              >
                6개 항목
              </span>
            </h3>
            <div className="space-y-3">
              {planFields.map((label, i) => {
                const colors = getFieldColors(label, 'plan');
                return (
                  <div
                    key={i}
                    className="rounded-r-xl p-3"
                    style={{
                      borderLeft: `4px solid ${colors.border}`,
                      backgroundColor: colors.bg,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-sm" style={{ color: colors.text }}>
                        {hasDecorations ? '♥' : '◎'} {label}
                      </label>
                      <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                        {getCharCount(planAnswers[i])}
                      </span>
                    </div>
                    <textarea
                      name={`plan-${i}`}
                      value={planAnswers[i]}
                      onChange={(e) => {
                        const newAnswers = [...planAnswers];
                        newAnswers[i] = e.target.value;
                        setPlanAnswers(newAnswers);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, '○')}
                      onFocus={(e) => {
                        if (!e.target.value) {
                          const newAnswers = [...planAnswers];
                          newAnswers[i] = '○ ';
                          setPlanAnswers(newAnswers);
                        }
                      }}
                      className="w-full h-20 p-2 rounded-lg text-sm resize-none"
                      style={{
                        backgroundColor: hasDecorations ? '#FFFCFA' : theme.colors.cardBg,
                        borderColor: theme.colors.border,
                        borderWidth: '1px',
                        color: theme.colors.textPrimary,
                      }}
                      placeholder="Enter=줄바꿈(○) | Tab=소항목(•)"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우: 문제점/해결방안 */}
          <div
            className="w-1/2 overflow-y-auto p-5"
            style={{
              backgroundColor: hasDecorations ? '#FAF5F0' : theme.colors.summaryBg,
            }}
          >
            <h3
              className="font-bold mb-4 flex items-center gap-2"
              style={{ color: hasDecorations ? '#6B5B50' : theme.colors.blue.text }}
            >
              <span
                className="w-6 h-6 text-white rounded flex items-center justify-center text-xs"
                style={{ backgroundColor: hasDecorations ? '#6B5B50' : theme.colors.blue.text }}
              >
                {hasDecorations ? theme.decorations?.bullet || '★' : '★'}
              </span>
              문제점 및 해결방안 템플릿
              <span
                className="px-2 py-0.5 text-xs rounded ml-auto"
                style={{
                  backgroundColor: hasDecorations ? '#F5EDE3' : theme.colors.blue.bg,
                  color: hasDecorations ? '#6B5B50' : theme.colors.blue.text
                }}
              >
                3개 항목
              </span>
            </h3>
            <div className="space-y-3">
              {problemFields.map((label, i) => {
                const colors = getFieldColors(label, 'problem');
                const bullet = label === '해결방안' ? '○' : '-';
                return (
                  <div
                    key={i}
                    className="rounded-r-xl p-3"
                    style={{
                      borderLeft: `4px solid ${colors.border}`,
                      backgroundColor: colors.bg,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-sm" style={{ color: colors.text }}>
                        {hasDecorations ? '♥' : '◎'} {label}
                      </label>
                      <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                        {getCharCount(problemAnswers[i])}
                      </span>
                    </div>
                    <textarea
                      name={`problem-${i}`}
                      value={problemAnswers[i]}
                      onChange={(e) => {
                        const newAnswers = [...problemAnswers];
                        newAnswers[i] = e.target.value;
                        setProblemAnswers(newAnswers);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, bullet)}
                      onFocus={(e) => {
                        if (!e.target.value) {
                          const newAnswers = [...problemAnswers];
                          newAnswers[i] = bullet + ' ';
                          setProblemAnswers(newAnswers);
                        }
                      }}
                      className="w-full h-28 p-2 rounded-lg text-sm resize-none"
                      style={{
                        backgroundColor: hasDecorations ? '#FFFCFA' : theme.colors.cardBg,
                        borderColor: theme.colors.border,
                        borderWidth: '1px',
                        color: theme.colors.textPrimary,
                      }}
                      placeholder={`Enter=줄바꿈(${bullet}) | Tab=소항목(•)`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
