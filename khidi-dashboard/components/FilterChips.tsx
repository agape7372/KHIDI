"use client";

import { Theme } from "@/lib/themes";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  counts?: Record<string, number>;
  theme: Theme;
}

export default function FilterChips({
  label,
  options,
  selected,
  onChange,
  counts,
  theme,
}: FilterChipsProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // 옵션이 1개면 렌더링하지 않음
  if (options.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="text-sm font-medium shrink-0"
        style={{ color: theme.colors.textSecondary }}
      >
        {label}:
      </span>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const count = counts?.[option.value] || 0;

        return (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className="px-3 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center gap-1.5"
            style={{
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.cardBg,
              color: isSelected
                ? "#ffffff"
                : theme.colors.textSecondary,
              border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
            }}
          >
            <span>{option.label}</span>
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.2)"
                    : theme.colors.primaryLight,
                  color: isSelected
                    ? "#ffffff"
                    : theme.colors.primary,
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
