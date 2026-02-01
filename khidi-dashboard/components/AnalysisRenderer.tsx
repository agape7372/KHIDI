"use client";

import { Theme, getTheme } from "@/lib/themes";

interface AnalysisRendererProps {
  content: string;
  theme?: Theme;
}

interface Section {
  title: string;
  emoji: string;
  content: string[];
  subsections?: { title: string; content: string[] }[];
}

export default function AnalysisRenderer({ content, theme: propTheme }: AnalysisRendererProps) {
  const theme = propTheme || getTheme('default');
  const parseAnalysis = (text: string): Section[] => {
    const sections: Section[] = [];
    const lines = text.split("\n");

    let currentSection: Section | null = null;
    let currentSubsection: { title: string; content: string[] } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // ## 메인 섹션 감지
      if (trimmed.startsWith("## ")) {
        if (currentSection) {
          if (currentSubsection) {
            currentSection.subsections = currentSection.subsections || [];
            currentSection.subsections.push(currentSubsection);
            currentSubsection = null;
          }
          sections.push(currentSection);
        }

        const titleMatch = trimmed.match(/^## (.+)/);
        if (titleMatch) {
          const fullTitle = titleMatch[1];
          const emojiMatch = fullTitle.match(/^(\p{Emoji})\s*(.+)/u);

          currentSection = {
            emoji: emojiMatch ? emojiMatch[1] : "📌",
            title: emojiMatch ? emojiMatch[2] : fullTitle,
            content: [],
          };
        }
      }
      // ### 서브섹션 감지
      else if (trimmed.startsWith("### ") && currentSection) {
        if (currentSubsection) {
          currentSection.subsections = currentSection.subsections || [];
          currentSection.subsections.push(currentSubsection);
        }

        const subTitle = trimmed.replace("### ", "");
        currentSubsection = {
          title: subTitle,
          content: [],
        };
      }
      // 일반 내용
      else if (trimmed && currentSection) {
        if (currentSubsection) {
          currentSubsection.content.push(trimmed);
        } else {
          currentSection.content.push(trimmed);
        }
      }
    }

    // 마지막 섹션 추가
    if (currentSection) {
      if (currentSubsection) {
        currentSection.subsections = currentSection.subsections || [];
        currentSection.subsections.push(currentSubsection);
      }
      sections.push(currentSection);
    }

    return sections;
  };

  const renderContent = (items: string[]) => {
    return items.map((item, idx) => {
      // 불릿 포인트 처리
      if (item.startsWith("* ") || item.startsWith("- ")) {
        const text = item.slice(2);
        // **볼드** 처리
        const parts = text.split(/(\*\*[^*]+\*\*)/g);

        return (
          <li key={idx} className="flex items-start gap-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
            <span className="mt-1.5 text-xs" style={{ color: theme.colors.primary }}>●</span>
            <span>
              {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={i} className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </span>
          </li>
        );
      }

      // **볼드**: 설명 형식
      if (item.includes("**") && item.includes(":")) {
        const parts = item.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={idx} className="leading-relaxed" style={{ color: theme.colors.textSecondary }}>
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }

      // 일반 텍스트
      return (
        <p key={idx} className="leading-relaxed" style={{ color: theme.colors.textSecondary }}>
          {item}
        </p>
      );
    });
  };

  const getSectionStyle = (emoji: string) => {
    const styles: Record<string, { bg: string; border: string; iconBg: string; titleColor: string }> = {
      "📋": {
        bg: theme.colors.blue.bg,
        border: theme.colors.blue.border,
        iconBg: theme.colors.blue.bg,
        titleColor: theme.colors.blue.text,
      },
      "⚠️": {
        bg: theme.colors.amber.bg,
        border: theme.colors.amber.border,
        iconBg: theme.colors.amber.bg,
        titleColor: theme.colors.amber.text,
      },
      "💡": {
        bg: theme.colors.green.bg,
        border: theme.colors.green.border,
        iconBg: theme.colors.green.bg,
        titleColor: theme.colors.green.text,
      },
      "📈": {
        bg: theme.colors.violet.bg,
        border: theme.colors.violet.border,
        iconBg: theme.colors.violet.bg,
        titleColor: theme.colors.violet.text,
      },
    };

    return (
      styles[emoji] || {
        bg: theme.colors.primaryLight,
        border: theme.colors.border,
        iconBg: theme.colors.primaryLight,
        titleColor: theme.colors.textPrimary,
      }
    );
  };

  const sections = parseAnalysis(content);

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const style = getSectionStyle(section.emoji);

        return (
          <div
            key={idx}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: style.border,
              backgroundColor: style.bg,
            }}
          >
            {/* 섹션 헤더 */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{
                borderColor: style.border,
                backgroundColor: `${theme.colors.cardBg}80`,
              }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: style.iconBg }}
              >
                {section.emoji}
              </span>
              <h3 className="font-bold" style={{ color: style.titleColor }}>
                {section.title}
              </h3>
            </div>

            {/* 섹션 내용 */}
            <div className="p-4 space-y-3">
              {section.content.length > 0 && (
                <ul className="space-y-2">{renderContent(section.content)}</ul>
              )}

              {/* 서브섹션 */}
              {section.subsections?.map((sub, subIdx) => (
                <div key={subIdx} className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-1 h-5 rounded-full opacity-50"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <h4 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                      {sub.title}
                    </h4>
                  </div>
                  <ul className="space-y-2 pl-3">{renderContent(sub.content)}</ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
