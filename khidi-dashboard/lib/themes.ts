// 테마 정의
export type ThemeType = 'default' | 'strawberry' | 'milktea' | 'mintchoco' | 'cloud' | 'lavender' | 'cherry' | 'ocean' | 'forest' | 'sunset';

export interface Theme {
  name: string;
  icon: string;
  colors: {
    // 기본 배경/텍스트
    pageBg: string;
    headerBg: string;
    headerBorder: string;
    cardBg: string;
    sidebarBg: string;
    guideBg: string;
    summaryBg: string;

    // 텍스트
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // 액센트
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // 기능별 색상
    blue: { bg: string; text: string; border: string };
    green: { bg: string; text: string; border: string };
    amber: { bg: string; text: string; border: string };
    violet: { bg: string; text: string; border: string };

    // 버튼
    buttonBg: string;
    buttonText: string;

    // 기타
    bookmark: string;
    border: string;
  };
  // 배경 패턴 (CSS background)
  patterns?: {
    page?: string;           // 페이지 전체 배경 패턴
    card?: string;           // 카드 배경 패턴
    accent?: string;         // 강조 영역 패턴
  };
  // 장식 요소
  decorations?: {
    scalloped: boolean;      // 스캘럽(물결) 헤더 보더
    stitch: boolean;         // 스티치(점선) 효과
    noteHeader: boolean;     // 노트 스타일 헤더
    bullet: string;          // 커스텀 불릿
    scalllopColor: string;   // 스캘럽 보더 색상
    stitchColor: string;     // 스티치 보더 색상
    // 추가 장식 옵션
    cardStyle?: 'flat' | 'raised' | 'soft' | 'glass';
    borderStyle?: 'solid' | 'dashed' | 'double' | 'groove';
    headerAccent?: string;   // 헤더 아래 그라데이션/장식
  };
  // 그림자 스타일
  shadows?: {
    card?: string;
    button?: string;
    hover?: string;
  };
  // 일러스트/장식 SVG
  illustrations?: {
    corner?: string;        // 코너 장식 SVG
    divider?: string;       // 구분선 장식 SVG
    accent?: string;        // 포인트 장식 SVG
    floatingElements?: string[];  // 플로팅 장식 요소들
  };
}

export const themes: Record<ThemeType, Theme> = {
  // ========== 기본 테마 ==========
  default: {
    name: '기본',
    icon: '🎨',
    colors: {
      pageBg: '#F3F4F6',
      headerBg: '#FFFFFF',
      headerBorder: '#E5E7EB',
      cardBg: '#FFFFFF',
      sidebarBg: '#F9FAFB',
      guideBg: '#FAF5FF',
      summaryBg: '#F9FAFB',

      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',

      primary: '#6366F1',
      primaryLight: '#EEF2FF',
      primaryDark: '#4F46E5',

      blue: { bg: '#EFF6FF', text: '#2563EB', border: '#93C5FD' },
      green: { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7' },
      amber: { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
      violet: { bg: '#F5F3FF', text: '#7C3AED', border: '#C4B5FD' },

      buttonBg: '#111827',
      buttonText: '#FFFFFF',

      bookmark: '#EAB308',
      border: '#E5E7EB',
    },
  },

  // ========== 🍓 딸기초코 ==========
  // 컨셉: 달콤한 딸기초콜릿 디저트 카페
  strawberry: {
    name: '딸기초코',
    icon: '🍓',
    colors: {
      pageBg: '#FDFBF8',
      headerBg: '#FFFFFF',
      headerBorder: '#E8C8CD',
      cardBg: '#FFFFFF',
      sidebarBg: '#FDF7F8',
      guideBg: '#FDF7F8',
      summaryBg: '#FBF5E8',

      textPrimary: '#6B5B50',
      textSecondary: '#9D8B78',
      textMuted: '#DDD0C0',

      primary: '#C9969D',
      primaryLight: '#FDF7F8',
      primaryDark: '#A87880',

      blue: { bg: '#E8F4F4', text: '#2A7B7B', border: '#5DAAAA' },
      green: { bg: '#EDF5E8', text: '#4A7744', border: '#7DB070' },
      amber: { bg: '#FEF3E8', text: '#B85C2C', border: '#E08850' },
      violet: { bg: '#EDE8F5', text: '#5B4A8C', border: '#8B7AB8' },

      buttonBg: '#6B5B50',
      buttonText: '#FFFFFF',

      bookmark: '#B85C2C',
      border: '#E8C8CD',
    },
    patterns: {
      page: 'radial-gradient(#F0E8E0 1.5px, transparent 1.5px)',
    },
    decorations: {
      scalloped: true,
      stitch: true,
      noteHeader: true,
      bullet: '♥',
      scalllopColor: '#6B5B50',
      stitchColor: '#C9969D',
      cardStyle: 'soft',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 8px rgba(107, 91, 80, 0.08)',
      button: '0 2px 4px rgba(107, 91, 80, 0.15)',
      hover: '0 4px 12px rgba(201, 150, 157, 0.2)',
    },
  },

  // ========== 🍫 민트초코 ==========
  // 컨셉: 상쾌한 민트초코 아이스크림 카페 - 초코칩이 박힌 민트
  mintchoco: {
    name: '민트초코',
    icon: '🍫',
    colors: {
      pageBg: '#F2F9F5',           // 연한 민트
      headerBg: '#FFFFFF',
      headerBorder: '#A8D4C0',
      cardBg: '#FFFFFF',
      sidebarBg: '#E8F5EE',
      guideBg: '#E0F0E8',
      summaryBg: '#ECF7F2',

      textPrimary: '#1E3328',      // 진한 다크그린
      textSecondary: '#3D5A4A',
      textMuted: '#7A9C88',

      primary: '#4CAF7A',          // 선명한 민트
      primaryLight: '#E0F5EA',
      primaryDark: '#2D8055',

      blue: { bg: '#E0F2ED', text: '#2D6B55', border: '#6BC4A0' },
      green: { bg: '#D8F0E5', text: '#1D6045', border: '#4CAF7A' },
      amber: { bg: '#FDF5E8', text: '#7A5020', border: '#D4A050' },
      violet: { bg: '#EDE8F2', text: '#4A3860', border: '#8878A8' },

      buttonBg: '#2C231E',         // 진한 다크초콜릿
      buttonText: '#E8FAF0',

      bookmark: '#4CAF7A',
      border: '#B8DCC8',
    },
    patterns: {
      // 초코칩 느낌의 불규칙 도트
      page: `
        radial-gradient(circle at 15% 25%, rgba(44, 35, 30, 0.08) 3px, transparent 3px),
        radial-gradient(circle at 85% 15%, rgba(44, 35, 30, 0.06) 4px, transparent 4px),
        radial-gradient(circle at 45% 75%, rgba(44, 35, 30, 0.07) 3px, transparent 3px),
        radial-gradient(circle at 75% 65%, rgba(44, 35, 30, 0.05) 4px, transparent 4px)
      `,
    },
    decorations: {
      scalloped: false,
      stitch: false,
      noteHeader: true,
      bullet: '◆',
      scalllopColor: '#4CAF7A',
      stitchColor: '#7A5020',
      cardStyle: 'raised',
      borderStyle: 'solid',
      headerAccent: 'linear-gradient(90deg, #4CAF7A 0%, #6BD498 50%, #4CAF7A 100%)',
    },
    shadows: {
      card: '0 2px 8px rgba(30, 51, 40, 0.06), 0 4px 16px rgba(30, 51, 40, 0.04)',
      button: '0 3px 8px rgba(44, 35, 30, 0.25)',
      hover: '0 8px 24px rgba(76, 175, 122, 0.18)',
    },
  },

  // ========== ☁️ 구름 ==========
  // 컨셉: 몽글몽글 구름 위 드리미한 공부방 - 별빛 하늘
  cloud: {
    name: '구름',
    icon: '☁️',
    colors: {
      pageBg: '#EDF4FC',           // 맑은 하늘색
      headerBg: '#FFFFFF',
      headerBorder: '#C8D8E8',
      cardBg: '#FFFFFF',
      sidebarBg: '#F0F6FC',
      guideBg: '#E5EEF8',
      summaryBg: '#F0F6FC',

      textPrimary: '#2A3A50',      // 밤하늘 네이비
      textSecondary: '#4A5A70',
      textMuted: '#8898A8',

      primary: '#6A9DD8',          // 선명한 스카이블루
      primaryLight: '#E5F0FA',
      primaryDark: '#4A7DB8',

      blue: { bg: '#E0ECF8', text: '#3A5A80', border: '#80A8D0' },
      green: { bg: '#E5F2ED', text: '#3A6858', border: '#78B8A0' },
      amber: { bg: '#FDF6E8', text: '#806838', border: '#D4B868' },
      violet: { bg: '#EAE5F5', text: '#4A3870', border: '#8878B8' },

      buttonBg: '#4A6A90',         // 저녁하늘 블루
      buttonText: '#FFFFFF',

      bookmark: '#80A0C8',
      border: '#C8D8E8',
    },
    patterns: {
      // 구름 + 별 패턴
      page: `
        radial-gradient(ellipse 120px 70px at 8% 15%, rgba(255,255,255,0.9) 0%, transparent 50%),
        radial-gradient(ellipse 90px 55px at 92% 20%, rgba(255,255,255,0.7) 0%, transparent 50%),
        radial-gradient(ellipse 150px 80px at 50% 85%, rgba(255,255,255,0.6) 0%, transparent 50%),
        radial-gradient(ellipse 100px 60px at 20% 70%, rgba(255,255,255,0.5) 0%, transparent 50%),
        radial-gradient(circle at 30% 30%, rgba(106, 157, 216, 0.15) 2px, transparent 2px),
        radial-gradient(circle at 70% 25%, rgba(106, 157, 216, 0.12) 1.5px, transparent 1.5px),
        radial-gradient(circle at 85% 60%, rgba(106, 157, 216, 0.1) 2px, transparent 2px),
        linear-gradient(180deg, #EDF4FC 0%, #E0ECF8 100%)
      `,
      accent: 'linear-gradient(135deg, rgba(106, 157, 216, 0.12) 0%, rgba(128, 160, 200, 0.06) 100%)',
    },
    decorations: {
      scalloped: true,
      stitch: false,
      noteHeader: true,
      bullet: '✦',
      scalllopColor: '#A8C0D8',
      stitchColor: '#C8D8E8',
      cardStyle: 'glass',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 4px 12px rgba(42, 58, 80, 0.05), 0 8px 32px rgba(42, 58, 80, 0.06)',
      button: '0 3px 10px rgba(74, 106, 144, 0.28)',
      hover: '0 12px 36px rgba(106, 157, 216, 0.22)',
    },
  },

  // ========== 🧸 밀크티베어 ==========
  // 컨셉: 포근한 테디베어 카페 - 따뜻한 코지 브라운과 쿠키
  milktea: {
    name: '밀크티베어',
    icon: '🧸',
    colors: {
      pageBg: '#FDF9F5',           // 따뜻한 크림색
      headerBg: '#FFFFFF',
      headerBorder: '#E5D8C8',
      cardBg: '#FFFFFF',
      sidebarBg: '#FBF6F0',
      guideBg: '#FDF8F2',
      summaryBg: '#FCF7F1',

      textPrimary: '#3A2A1E',      // 진한 에스프레소
      textSecondary: '#5D4A3A',    // 코코아
      textMuted: '#9A8878',

      primary: '#C08050',          // 카라멜
      primaryLight: '#FCF5EC',
      primaryDark: '#9A6840',

      blue: { bg: '#F0F4F2', text: '#4A6A5D', border: '#98B8A8' },
      green: { bg: '#F2F5EC', text: '#5A7048', border: '#A0B890' },
      amber: { bg: '#FEF5E5', text: '#8A5820', border: '#D8A850' },
      violet: { bg: '#F5F0F4', text: '#6A5568', border: '#B0A0A8' },

      buttonBg: '#5D4535',         // 초콜릿 브라운
      buttonText: '#FFFBF5',

      bookmark: '#D09840',
      border: '#E5D8C8',
    },
    patterns: {
      // 곰발바닥 + 쿠키 느낌의 원형 패턴
      page: `
        radial-gradient(circle at 20% 30%, rgba(192, 128, 80, 0.06) 8px, transparent 8px),
        radial-gradient(circle at 80% 20%, rgba(192, 128, 80, 0.05) 6px, transparent 6px),
        radial-gradient(circle at 60% 70%, rgba(192, 128, 80, 0.04) 10px, transparent 10px),
        radial-gradient(circle at 10% 80%, rgba(192, 128, 80, 0.05) 7px, transparent 7px)
      `,
    },
    decorations: {
      scalloped: true,
      stitch: false,
      noteHeader: true,
      bullet: '🍪',
      scalllopColor: '#C08050',
      stitchColor: '#9A6840',
      cardStyle: 'soft',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 8px rgba(58, 42, 30, 0.05), 0 6px 16px rgba(58, 42, 30, 0.04)',
      button: '0 3px 8px rgba(93, 69, 53, 0.18)',
      hover: '0 6px 20px rgba(192, 128, 80, 0.18)',
    },
  },

  // ========== 💜 라벤더 ==========
  // 컨셉: 프로방스 라벤더 꽃밭 - 차분하고 힐링되는 보라색
  lavender: {
    name: '라벤더',
    icon: '💜',
    colors: {
      pageBg: '#F8F5FC',
      headerBg: '#FFFFFF',
      headerBorder: '#E0D4F0',
      cardBg: '#FFFFFF',
      sidebarBg: '#F5F0FA',
      guideBg: '#F0EBF8',
      summaryBg: '#F8F4FC',

      textPrimary: '#2D2640',
      textSecondary: '#524868',
      textMuted: '#9088A8',

      primary: '#9B7BC8',
      primaryLight: '#F0EBF8',
      primaryDark: '#7B5BA8',

      blue: { bg: '#EDE8F5', text: '#5048A0', border: '#A098D0' },
      green: { bg: '#EDF2ED', text: '#4A6850', border: '#90B898' },
      amber: { bg: '#FDF5EC', text: '#8A6030', border: '#D4A860' },
      violet: { bg: '#EBE5F5', text: '#6B48A0', border: '#A890D8' },

      buttonBg: '#6B5090',
      buttonText: '#FFFFFF',

      bookmark: '#B090D8',
      border: '#E0D4F0',
    },
    patterns: {
      page: `
        radial-gradient(ellipse at 15% 20%, rgba(155, 123, 200, 0.08) 20px, transparent 20px),
        radial-gradient(ellipse at 85% 30%, rgba(155, 123, 200, 0.06) 15px, transparent 15px),
        radial-gradient(ellipse at 40% 80%, rgba(155, 123, 200, 0.07) 18px, transparent 18px),
        radial-gradient(ellipse at 70% 70%, rgba(155, 123, 200, 0.05) 12px, transparent 12px)
      `,
    },
    decorations: {
      scalloped: false,
      stitch: false,
      noteHeader: true,
      bullet: '❀',
      scalllopColor: '#9B7BC8',
      stitchColor: '#7B5BA8',
      cardStyle: 'soft',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 10px rgba(45, 38, 64, 0.05), 0 6px 20px rgba(45, 38, 64, 0.04)',
      button: '0 3px 10px rgba(107, 80, 144, 0.22)',
      hover: '0 8px 24px rgba(155, 123, 200, 0.2)',
    },
  },

  // ========== 🌸 체리블라썸 ==========
  // 컨셉: 봄날의 벚꽃 - 로맨틱하고 부드러운 핑크
  cherry: {
    name: '체리블라썸',
    icon: '🌸',
    colors: {
      pageBg: '#FDF6F8',
      headerBg: '#FFFFFF',
      headerBorder: '#F0D8E0',
      cardBg: '#FFFFFF',
      sidebarBg: '#FCF2F5',
      guideBg: '#FCEEF2',
      summaryBg: '#FDF5F8',

      textPrimary: '#3D2832',
      textSecondary: '#6B4858',
      textMuted: '#A88898',

      primary: '#E091A8',
      primaryLight: '#FCEEF2',
      primaryDark: '#C87088',

      blue: { bg: '#F0EEF8', text: '#5858A0', border: '#A8A8D0' },
      green: { bg: '#EDF5F0', text: '#4A7058', border: '#88C0A0' },
      amber: { bg: '#FDF6EC', text: '#906838', border: '#D8B068' },
      violet: { bg: '#F5EDF5', text: '#7A5878', border: '#C0A0B8' },

      buttonBg: '#C87088',
      buttonText: '#FFFFFF',

      bookmark: '#E8A0B8',
      border: '#F0D8E0',
    },
    patterns: {
      page: `
        radial-gradient(circle at 10% 15%, rgba(224, 145, 168, 0.12) 4px, transparent 4px),
        radial-gradient(circle at 25% 40%, rgba(224, 145, 168, 0.08) 3px, transparent 3px),
        radial-gradient(circle at 80% 20%, rgba(224, 145, 168, 0.1) 5px, transparent 5px),
        radial-gradient(circle at 65% 60%, rgba(224, 145, 168, 0.06) 4px, transparent 4px),
        radial-gradient(circle at 90% 80%, rgba(224, 145, 168, 0.09) 3px, transparent 3px),
        radial-gradient(circle at 40% 85%, rgba(224, 145, 168, 0.07) 4px, transparent 4px)
      `,
    },
    decorations: {
      scalloped: true,
      stitch: false,
      noteHeader: true,
      bullet: '✿',
      scalllopColor: '#E8B0C0',
      stitchColor: '#C87088',
      cardStyle: 'soft',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 10px rgba(61, 40, 50, 0.04), 0 6px 18px rgba(61, 40, 50, 0.03)',
      button: '0 3px 10px rgba(200, 112, 136, 0.25)',
      hover: '0 8px 24px rgba(224, 145, 168, 0.22)',
    },
  },

  // ========== 🌊 오션 ==========
  // 컨셉: 여름 바다 - 시원하고 청량한 블루
  ocean: {
    name: '오션',
    icon: '🌊',
    colors: {
      pageBg: '#F0F8FC',
      headerBg: '#FFFFFF',
      headerBorder: '#C8E0F0',
      cardBg: '#FFFFFF',
      sidebarBg: '#EBF5FC',
      guideBg: '#E5F2FA',
      summaryBg: '#EDF6FC',

      textPrimary: '#1A3648',
      textSecondary: '#3A5A70',
      textMuted: '#7898A8',

      primary: '#40A0D8',
      primaryLight: '#E5F2FA',
      primaryDark: '#2080B8',

      blue: { bg: '#E0F0F8', text: '#2060A0', border: '#70B0E0' },
      green: { bg: '#E8F5F0', text: '#308060', border: '#68C8A0' },
      amber: { bg: '#FCF5E8', text: '#907030', border: '#E0B850' },
      violet: { bg: '#F0EAF8', text: '#6050A0', border: '#A090D0' },

      buttonBg: '#2080B8',
      buttonText: '#FFFFFF',

      bookmark: '#50B8E8',
      border: '#C8E0F0',
    },
    patterns: {
      page: `
        radial-gradient(ellipse 200px 40px at 0% 30%, rgba(64, 160, 216, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 180px 35px at 100% 50%, rgba(64, 160, 216, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse 220px 45px at 20% 80%, rgba(64, 160, 216, 0.07) 0%, transparent 50%),
        radial-gradient(ellipse 160px 30px at 80% 90%, rgba(64, 160, 216, 0.05) 0%, transparent 50%),
        linear-gradient(180deg, #F0F8FC 0%, #E5F2FA 100%)
      `,
    },
    decorations: {
      scalloped: true,
      stitch: false,
      noteHeader: true,
      bullet: '◈',
      scalllopColor: '#90C8E8',
      stitchColor: '#40A0D8',
      cardStyle: 'glass',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 10px rgba(26, 54, 72, 0.05), 0 8px 24px rgba(26, 54, 72, 0.04)',
      button: '0 3px 12px rgba(32, 128, 184, 0.28)',
      hover: '0 10px 30px rgba(64, 160, 216, 0.2)',
    },
  },

  // ========== 🌲 포레스트 ==========
  // 컨셉: 깊은 숲속 - 자연스럽고 평화로운 그린
  forest: {
    name: '포레스트',
    icon: '🌲',
    colors: {
      pageBg: '#F5F8F4',
      headerBg: '#FFFFFF',
      headerBorder: '#D0E0C8',
      cardBg: '#FFFFFF',
      sidebarBg: '#F0F5EE',
      guideBg: '#EBF2E8',
      summaryBg: '#F2F7F0',

      textPrimary: '#1E3020',
      textSecondary: '#3A5038',
      textMuted: '#788878',

      primary: '#5A9060',
      primaryLight: '#EBF2E8',
      primaryDark: '#3A7040',

      blue: { bg: '#E8F0F0', text: '#386878', border: '#80B0B8' },
      green: { bg: '#E5F0E8', text: '#2A6038', border: '#60A870' },
      amber: { bg: '#FAF5E8', text: '#806020', border: '#D0A848' },
      violet: { bg: '#F0EBF2', text: '#584870', border: '#9888A8' },

      buttonBg: '#3A6840',
      buttonText: '#F8FCF8',

      bookmark: '#70A878',
      border: '#D0E0C8',
    },
    patterns: {
      page: `
        radial-gradient(circle at 5% 10%, rgba(90, 144, 96, 0.1) 6px, transparent 6px),
        radial-gradient(circle at 95% 25%, rgba(90, 144, 96, 0.08) 8px, transparent 8px),
        radial-gradient(circle at 20% 70%, rgba(90, 144, 96, 0.07) 5px, transparent 5px),
        radial-gradient(circle at 75% 85%, rgba(90, 144, 96, 0.09) 7px, transparent 7px),
        radial-gradient(circle at 50% 40%, rgba(90, 144, 96, 0.05) 4px, transparent 4px)
      `,
    },
    decorations: {
      scalloped: false,
      stitch: false,
      noteHeader: true,
      bullet: '🌿',
      scalllopColor: '#5A9060',
      stitchColor: '#3A7040',
      cardStyle: 'raised',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 8px rgba(30, 48, 32, 0.05), 0 6px 18px rgba(30, 48, 32, 0.04)',
      button: '0 3px 10px rgba(58, 104, 64, 0.22)',
      hover: '0 8px 24px rgba(90, 144, 96, 0.18)',
    },
  },

  // ========== 🌅 선셋 ==========
  // 컨셉: 저녁노을 - 따뜻하고 감성적인 오렌지/핑크
  sunset: {
    name: '선셋',
    icon: '🌅',
    colors: {
      pageBg: '#FDF8F5',
      headerBg: '#FFFFFF',
      headerBorder: '#F0D8D0',
      cardBg: '#FFFFFF',
      sidebarBg: '#FCF5F2',
      guideBg: '#FAF0EC',
      summaryBg: '#FCF6F3',

      textPrimary: '#3D2825',
      textSecondary: '#6B4840',
      textMuted: '#A88878',

      primary: '#E88060',
      primaryLight: '#FAF0EC',
      primaryDark: '#C86040',

      blue: { bg: '#F0EDF5', text: '#5A5090', border: '#A098C8' },
      green: { bg: '#F0F5ED', text: '#507048', border: '#90B880' },
      amber: { bg: '#FDF3E5', text: '#905818', border: '#E0A030' },
      violet: { bg: '#F5EDF2', text: '#785068', border: '#C090A8' },

      buttonBg: '#D06848',
      buttonText: '#FFFFFF',

      bookmark: '#F0A080',
      border: '#F0D8D0',
    },
    patterns: {
      page: `
        linear-gradient(135deg, rgba(232, 128, 96, 0.06) 0%, transparent 50%),
        linear-gradient(225deg, rgba(240, 160, 128, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(232, 128, 96, 0.08) 30px, transparent 30px),
        radial-gradient(circle at 20% 80%, rgba(240, 160, 128, 0.06) 25px, transparent 25px)
      `,
    },
    decorations: {
      scalloped: false,
      stitch: false,
      noteHeader: true,
      bullet: '◉',
      scalllopColor: '#E8A080',
      stitchColor: '#C86040',
      cardStyle: 'soft',
      borderStyle: 'solid',
    },
    shadows: {
      card: '0 2px 10px rgba(61, 40, 37, 0.05), 0 6px 20px rgba(61, 40, 37, 0.04)',
      button: '0 3px 12px rgba(208, 104, 72, 0.25)',
      hover: '0 8px 26px rgba(232, 128, 96, 0.22)',
    },
  },
};

export const getTheme = (type: ThemeType): Theme => {
  return themes[type] || themes.default;
};

// 테마별 CSS 변수 생성 유틸리티
export const getThemeCSSVariables = (theme: Theme): Record<string, string> => {
  return {
    '--theme-page-bg': theme.colors.pageBg,
    '--theme-card-bg': theme.colors.cardBg,
    '--theme-text-primary': theme.colors.textPrimary,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-primary': theme.colors.primary,
    '--theme-border': theme.colors.border,
    '--theme-card-shadow': theme.shadows?.card || 'none',
    '--theme-hover-shadow': theme.shadows?.hover || 'none',
  };
};
