"use client";

import { Theme, getTheme } from "@/lib/themes";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: Theme;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "제목, 요약 검색...",
  theme: propTheme,
}: SearchInputProps) {
  const theme = propTheme || getTheme('default');

  return (
    <div className="relative flex-1 min-w-[200px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: theme.colors.textMuted }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primaryLight}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
          style={{ color: theme.colors.textMuted }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
