"use client";

import { useState, useRef, useEffect } from "react";
import { FilterOption } from "@/lib/types";
import { Theme, getTheme } from "@/lib/themes";

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  counts?: Record<string, number>;
  theme?: Theme;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  counts = {},
  theme: propTheme,
}: FilterDropdownProps) {
  const theme = propTheme || getTheme('default');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all"
        style={
          selected.length > 0
            ? {
                backgroundColor: theme.colors.primaryLight,
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
              }
            : {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
              }
        }
      >
        {label}
        {selected.length > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: theme.colors.primary, color: 'white' }}
          >
            {selected.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto border"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div className="p-2 border-b" style={{ borderColor: theme.colors.border }}>
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium hover:opacity-80"
              style={{ color: theme.colors.primary }}
            >
              {selected.length === options.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2"
                  style={{
                    accentColor: theme.colors.primary,
                  }}
                />
                <span className="text-sm flex-1" style={{ color: theme.colors.textSecondary }}>
                  {option.label}
                </span>
                {counts[option.value] !== undefined && (
                  <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                    ({counts[option.value]})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
