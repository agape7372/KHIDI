"use client";

import { Theme, getTheme } from "@/lib/themes";

interface TagProps {
  label: string;
  className?: string;
  theme?: Theme;
}

// 테마별 태그 색상 매핑
const getThemedTagColor = (tag: string, theme: Theme): { bg: string; text: string } => {
  const isStrawberry = theme.name === '딸기초코';

  // 딸기초코 테마용 색상 (따뜻한 파스텔톤)
  const strawberryColors: Record<string, { bg: string; text: string }> = {
    // TYPE
    "브리핑": { bg: '#E8D8D0', text: '#6B5B50' },
    "뉴스": { bg: '#E0D5E8', text: '#5B4A6B' },
    "채용공고": { bg: '#D8E8D0', text: '#4A6B40' },
    "인바스켓": { bg: '#F0D8E0', text: '#8B5A6B' },

    // CATEGORY
    "R&D정책": { bg: '#D8E8E8', text: '#4A6B6B' },
    "바이오헬스": { bg: '#D8E8D8', text: '#4A6B4A' },
    "디지털헬스케어": { bg: '#E8D8E8', text: '#6B4A6B' },
    "의료기기": { bg: '#F0E8D0', text: '#8B7640' },
    "글로벌진출": { bg: '#D0E8E8', text: '#408B8B' },
    "규제인허가": { bg: '#F0D8D8', text: '#8B5050' },
    "채용분석": { bg: '#E8F0D0', text: '#6B8B40' },
    "산업동향": { bg: '#F0E0D0', text: '#8B6040' },
    "인력양성": { bg: '#D0E8E0', text: '#408B70' },
    "제약바이오": { bg: '#F0D0E8', text: '#8B4070' },
    "헬스케어IT": { bg: '#D8E0F0', text: '#4060A0' },
    "공중보건": { bg: '#F0D0D0', text: '#A04040' },

    // LAYER
    "보건산업브리프": { bg: '#E8E0D0', text: '#6B6040' },
    "글로벌동향": { bg: '#D0E0F0', text: '#4060A0' },
    "뉴스레터": { bg: '#E0D0F0', text: '#6040A0' },
    "정책보고서": { bg: '#D8D8E8', text: '#5050A0' },
    "백서": { bg: '#E8E8E0', text: '#6B6B50' },
    "통계자료": { bg: '#D0E8D8', text: '#408B50' },
    "연구보고서": { bg: '#E0D8E8', text: '#604080' },

    // REGION
    "국내": { bg: '#E0E0E0', text: '#606060' },
    "북미": { bg: '#D0E8F0', text: '#4080A0' },
    "유럽": { bg: '#D8D8F0', text: '#5050A0' },
    "아시아": { bg: '#F0F0D0', text: '#A0A040' },
    "글로벌": { bg: '#E0E0E8', text: '#606080' },
    "중동": { bg: '#F0E0D0', text: '#A06040' },
    "동남아": { bg: '#D8E8D0', text: '#50A040' },

    // SOURCE
    "KHIDI": { bg: '#F0D8E0', text: '#A05070' },
    "식약처": { bg: '#F0D0D0', text: '#A04040' },
    "복지부": { bg: '#D8F0D8', text: '#40A040' },
    "산업부": { bg: '#E8D0F0', text: '#8040A0' },
    "언론보도": { bg: '#E8E0E0', text: '#706060' },
    "학술자료": { bg: '#D8D8F0', text: '#5050A0' },
    "기업공시": { bg: '#F0E8D0', text: '#A08040' },
  };

  // 기본 테마용 색상
  const defaultColors: Record<string, { bg: string; text: string }> = {
    // TYPE
    "브리핑": { bg: '#DBEAFE', text: '#1D4ED8' },
    "뉴스": { bg: '#E0E7FF', text: '#4338CA' },
    "채용공고": { bg: '#DCFCE7', text: '#15803D' },
    "인바스켓": { bg: '#F3E8FF', text: '#7C3AED' },

    // CATEGORY
    "R&D정책": { bg: '#E0F2FE', text: '#0369A1' },
    "바이오헬스": { bg: '#D1FAE5', text: '#047857' },
    "디지털헬스케어": { bg: '#EDE9FE', text: '#6D28D9' },
    "의료기기": { bg: '#FEF3C7', text: '#B45309' },
    "글로벌진출": { bg: '#CFFAFE', text: '#0E7490' },
    "규제인허가": { bg: '#FFE4E6', text: '#BE123C' },
    "채용분석": { bg: '#ECFCCB', text: '#4D7C0F' },
    "산업동향": { bg: '#FFEDD5', text: '#C2410C' },
    "인력양성": { bg: '#CCFBF1', text: '#0F766E' },
    "제약바이오": { bg: '#FAE8FF', text: '#A21CAF' },
    "헬스케어IT": { bg: '#DBEAFE', text: '#1D4ED8' },
    "공중보건": { bg: '#FEE2E2', text: '#DC2626' },

    // LAYER
    "보건산업브리프": { bg: '#FEF3C7', text: '#B45309' },
    "글로벌동향": { bg: '#DBEAFE', text: '#1D4ED8' },
    "뉴스레터": { bg: '#E0E7FF', text: '#4338CA' },
    "정책보고서": { bg: '#F3E8FF', text: '#7C3AED' },
    "백서": { bg: '#F3F4F6', text: '#4B5563' },
    "통계자료": { bg: '#D1FAE5', text: '#047857' },
    "연구보고서": { bg: '#EDE9FE', text: '#6D28D9' },

    // REGION
    "국내": { bg: '#F1F5F9', text: '#475569' },
    "북미": { bg: '#CFFAFE', text: '#0E7490' },
    "유럽": { bg: '#E0E7FF', text: '#4338CA' },
    "아시아": { bg: '#FEF9C3', text: '#A16207' },
    "글로벌": { bg: '#F3F4F6', text: '#4B5563' },
    "중동": { bg: '#FFEDD5', text: '#C2410C' },
    "동남아": { bg: '#DCFCE7', text: '#15803D' },

    // SOURCE
    "KHIDI": { bg: '#DBEAFE', text: '#1D4ED8' },
    "식약처": { bg: '#FEE2E2', text: '#DC2626' },
    "복지부": { bg: '#DCFCE7', text: '#15803D' },
    "산업부": { bg: '#F3E8FF', text: '#7C3AED' },
    "언론보도": { bg: '#F3F4F6', text: '#4B5563' },
    "학술자료": { bg: '#E0E7FF', text: '#4338CA' },
    "기업공시": { bg: '#FEF3C7', text: '#B45309' },
  };

  const colors = isStrawberry ? strawberryColors : defaultColors;
  const defaultFallback = isStrawberry
    ? { bg: '#E8E0E0', text: '#6B6060' }
    : { bg: '#F3F4F6', text: '#4B5563' };

  return colors[tag] || defaultFallback;
};

export default function Tag({ label, className = "", theme: propTheme }: TagProps) {
  const theme = propTheme || getTheme('default');
  const colors = getThemedTagColor(label, theme);

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

export function NewBadge({ theme: propTheme }: { theme?: Theme }) {
  const theme = propTheme || getTheme('default');

  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ backgroundColor: theme.colors.green.bg, color: theme.colors.green.text }}
    >
      NEW
    </span>
  );
}
