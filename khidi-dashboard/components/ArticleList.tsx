"use client";

import { Article } from "@/lib/types";
import { Theme, getTheme } from "@/lib/themes";
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  apiKey?: string;
  theme?: Theme;
}

export default function ArticleList({
  articles,
  isLoading = false,
  apiKey,
  theme: propTheme,
}: ArticleListProps) {
  const theme = propTheme || getTheme('default');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border animate-pulse"
            style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
          >
            <div className="flex justify-between mb-2">
              <div className="h-3 w-20 rounded" style={{ backgroundColor: theme.colors.border }}></div>
              <div className="h-3 w-24 rounded" style={{ backgroundColor: theme.colors.border }}></div>
            </div>
            <div className="h-5 w-3/4 rounded mb-2" style={{ backgroundColor: theme.colors.border }}></div>
            <div className="h-4 w-full rounded mb-1" style={{ backgroundColor: theme.colors.border }}></div>
            <div className="h-4 w-2/3 rounded mb-3" style={{ backgroundColor: theme.colors.border }}></div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-5 w-16 rounded" style={{ backgroundColor: theme.colors.border }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: theme.colors.border }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
          검색 결과가 없습니다
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          필터를 조정하거나 다른 검색어를 입력해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} apiKey={apiKey} theme={theme} />
      ))}
    </div>
  );
}
