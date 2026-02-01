'use client';

import { ThemeType } from '@/lib/themes';

interface ThemeIllustrationsProps {
  themeType: ThemeType;
  variant: 'corner' | 'divider' | 'header' | 'floating';
  className?: string;
}

// 민트초코 테마 일러스트
const MintChocoIllustrations = {
  // 민트 잎 + 초코칩
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 민트 잎 */}
      <ellipse cx="35" cy="40" rx="20" ry="12" fill="#7DC898" opacity="0.6" transform="rotate(-30 35 40)" />
      <ellipse cx="45" cy="35" rx="18" ry="10" fill="#5BA878" opacity="0.7" transform="rotate(15 45 35)" />
      <path d="M30 45 Q40 30 50 40" stroke="#3D7A5C" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* 초코칩 */}
      <circle cx="60" cy="55" r="6" fill="#3A2E28" />
      <circle cx="55" cy="65" r="4" fill="#4A3E38" />
      <circle cx="68" cy="62" r="5" fill="#3A2E28" />
      <ellipse cx="25" cy="60" rx="4" ry="3" fill="#4A3E38" transform="rotate(20 25 60)" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 20" className="w-full h-5">
      <defs>
        <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5BA878" stopOpacity="0" />
          <stop offset="50%" stopColor="#5BA878" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5BA878" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="10" x2="200" y2="10" stroke="url(#mintGrad)" strokeWidth="2" />
      {/* 초코칩 점들 */}
      <circle cx="40" cy="10" r="3" fill="#3A2E28" />
      <circle cx="100" cy="10" r="4" fill="#3A2E28" />
      <circle cx="160" cy="10" r="3" fill="#3A2E28" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 120 40" className="h-10">
      {/* 아이스크림 스쿱 */}
      <ellipse cx="60" cy="25" rx="35" ry="20" fill="#A8E6CF" opacity="0.3" />
      <ellipse cx="50" cy="22" rx="25" ry="15" fill="#7DC898" opacity="0.4" />
      {/* 초코 드리즐 */}
      <path d="M30 15 Q45 25 60 15 Q75 5 90 18" stroke="#3A2E28" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
    </svg>
  ),
  floating: [
    <circle key="chip1" r="4" fill="#3A2E28" opacity="0.4" />,
    <ellipse key="leaf" rx="8" ry="5" fill="#7DC898" opacity="0.3" transform="rotate(30)" />,
  ],
};

// 구름 테마 일러스트
const CloudIllustrations = {
  // 몽실몽실 구름
  corner: (
    <svg viewBox="0 0 100 60" className="w-24 h-14">
      {/* 큰 구름 */}
      <ellipse cx="50" cy="40" rx="35" ry="18" fill="#D0E4F5" opacity="0.7" />
      <ellipse cx="35" cy="35" rx="20" ry="15" fill="#E0EDF8" opacity="0.8" />
      <ellipse cx="65" cy="35" rx="22" ry="14" fill="#E5F0FA" opacity="0.75" />
      <ellipse cx="50" cy="30" rx="18" ry="12" fill="#F0F6FC" opacity="0.9" />
      {/* 작은 별 */}
      <path d="M85 15 L87 20 L92 20 L88 24 L90 29 L85 26 L80 29 L82 24 L78 20 L83 20 Z" fill="#B8C8D8" opacity="0.5" />
      <circle cx="20" cy="20" r="2" fill="#9AA5B5" opacity="0.4" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 300 30" className="w-full h-8">
      {/* 구름 라인 */}
      <ellipse cx="50" cy="15" rx="25" ry="12" fill="#D0E4F5" opacity="0.5" />
      <ellipse cx="100" cy="18" rx="30" ry="10" fill="#E0EDF8" opacity="0.4" />
      <ellipse cx="150" cy="15" rx="35" ry="13" fill="#D8E8F5" opacity="0.5" />
      <ellipse cx="200" cy="17" rx="28" ry="11" fill="#E0EDF8" opacity="0.4" />
      <ellipse cx="250" cy="15" rx="25" ry="12" fill="#D0E4F5" opacity="0.5" />
      {/* 별 포인트 */}
      <circle cx="75" cy="8" r="2" fill="#7A9CC8" opacity="0.6" />
      <circle cx="175" cy="6" r="2.5" fill="#7A9CC8" opacity="0.5" />
      <circle cx="225" cy="9" r="2" fill="#7A9CC8" opacity="0.6" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 150 50" className="h-12">
      {/* 드리미 구름들 */}
      <ellipse cx="30" cy="35" rx="25" ry="14" fill="#E5EEF8" opacity="0.6" />
      <ellipse cx="75" cy="30" rx="35" ry="18" fill="#D8E8F5" opacity="0.5" />
      <ellipse cx="120" cy="35" rx="28" ry="15" fill="#E0EDF8" opacity="0.6" />
      {/* 달 */}
      <circle cx="130" cy="15" r="10" fill="#F5F8FC" opacity="0.8" />
      <circle cx="134" cy="13" r="8" fill="#F0F5FB" />
      {/* 별들 */}
      <circle cx="20" cy="12" r="1.5" fill="#9AA5B5" />
      <circle cx="50" cy="8" r="2" fill="#7A9CC8" opacity="0.7" />
      <circle cx="95" cy="10" r="1.5" fill="#9AA5B5" />
    </svg>
  ),
  floating: [
    <ellipse key="cloud1" rx="15" ry="8" fill="#E0EDF8" opacity="0.4" />,
    <circle key="star1" r="2" fill="#7A9CC8" opacity="0.5" />,
  ],
};

// 밀크티베어 테마 일러스트
const MilkteaIllustrations = {
  // 곰발바닥 + 쿠키
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 곰발바닥 */}
      <ellipse cx="40" cy="50" rx="18" ry="15" fill="#C4956A" opacity="0.5" />
      <circle cx="28" cy="35" r="7" fill="#C4956A" opacity="0.4" />
      <circle cx="40" cy="30" r="8" fill="#C4956A" opacity="0.45" />
      <circle cx="52" cy="35" r="7" fill="#C4956A" opacity="0.4" />
      {/* 쿠키 */}
      <circle cx="65" cy="65" r="10" fill="#DEB060" opacity="0.6" />
      <circle cx="62" cy="62" r="2" fill="#8B6914" opacity="0.5" />
      <circle cx="68" cy="66" r="1.5" fill="#8B6914" opacity="0.5" />
      <circle cx="65" cy="70" r="2" fill="#8B6914" opacity="0.5" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 24" className="w-full h-6">
      <defs>
        <linearGradient id="milkteaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4956A" stopOpacity="0" />
          <stop offset="50%" stopColor="#C4956A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C4956A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="200" y2="12" stroke="url(#milkteaGrad)" strokeWidth="2" strokeDasharray="8 4" />
      {/* 미니 곰발 */}
      <g transform="translate(95, 12) scale(0.4)">
        <ellipse cx="0" cy="5" rx="12" ry="10" fill="#C4956A" opacity="0.5" />
        <circle cx="-8" cy="-5" r="5" fill="#C4956A" opacity="0.4" />
        <circle cx="0" cy="-8" r="5" fill="#C4956A" opacity="0.45" />
        <circle cx="8" cy="-5" r="5" fill="#C4956A" opacity="0.4" />
      </g>
    </svg>
  ),
  header: (
    <svg viewBox="0 0 140 50" className="h-12">
      {/* 밀크티 컵 */}
      <path d="M50 45 L55 15 L85 15 L90 45 Z" fill="#F5EEE5" stroke="#C4956A" strokeWidth="2" opacity="0.6" />
      <ellipse cx="70" cy="15" rx="17" ry="5" fill="#D4A870" opacity="0.4" />
      {/* 타피오카 */}
      <circle cx="60" cy="38" r="3" fill="#3D2E22" opacity="0.5" />
      <circle cx="70" cy="40" r="3" fill="#3D2E22" opacity="0.5" />
      <circle cx="80" cy="38" r="3" fill="#3D2E22" opacity="0.5" />
      {/* 곰 귀 */}
      <circle cx="30" cy="25" r="12" fill="#C4956A" opacity="0.4" />
      <circle cx="110" cy="25" r="12" fill="#C4956A" opacity="0.4" />
      <circle cx="30" cy="25" r="7" fill="#E8DDD0" opacity="0.5" />
      <circle cx="110" cy="25" r="7" fill="#E8DDD0" opacity="0.5" />
    </svg>
  ),
  floating: [
    <circle key="cookie" r="6" fill="#DEB060" opacity="0.3" />,
    <circle key="tapioca" r="3" fill="#3D2E22" opacity="0.2" />,
  ],
};

// 라벤더 테마 일러스트
const LavenderIllustrations = {
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 라벤더 꽃대 */}
      <path d="M40 70 Q42 50 40 30" stroke="#7B5BA8" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M55 65 Q53 48 55 35" stroke="#9B7BC8" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* 라벤더 꽃송이 */}
      <ellipse cx="40" cy="25" rx="5" ry="8" fill="#9B7BC8" opacity="0.6" />
      <ellipse cx="40" cy="18" rx="4" ry="6" fill="#B090D8" opacity="0.5" />
      <ellipse cx="40" cy="12" rx="3" ry="5" fill="#C0A8E0" opacity="0.4" />
      <ellipse cx="55" cy="30" rx="4" ry="7" fill="#9B7BC8" opacity="0.5" />
      <ellipse cx="55" cy="24" rx="3" ry="5" fill="#B090D8" opacity="0.4" />
      {/* 나비 */}
      <ellipse cx="65" cy="50" rx="8" ry="5" fill="#E0D4F0" opacity="0.6" transform="rotate(-20 65 50)" />
      <ellipse cx="72" cy="48" rx="6" ry="4" fill="#E8E0F5" opacity="0.5" transform="rotate(20 72 48)" />
      <circle cx="68" cy="50" r="2" fill="#6B5090" opacity="0.4" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 24" className="w-full h-6">
      <defs>
        <linearGradient id="lavGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9B7BC8" stopOpacity="0" />
          <stop offset="50%" stopColor="#9B7BC8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9B7BC8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="200" y2="12" stroke="url(#lavGrad)" strokeWidth="1.5" />
      <ellipse cx="100" cy="8" rx="3" ry="5" fill="#9B7BC8" opacity="0.5" />
      <ellipse cx="100" cy="16" rx="3" ry="5" fill="#B090D8" opacity="0.4" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 140 45" className="h-11">
      {/* 라벤더 밭 */}
      {[20, 40, 60, 80, 100, 120].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 40 Q${x+1} 28 ${x} 18`} stroke="#7B5BA8" strokeWidth="1.5" fill="none" opacity="0.4" />
          <ellipse cx={x} cy="15" rx="3" ry="5" fill="#9B7BC8" opacity={0.4 + i * 0.05} />
          <ellipse cx={x} cy="10" rx="2.5" ry="4" fill="#B090D8" opacity={0.3 + i * 0.05} />
        </g>
      ))}
    </svg>
  ),
  floating: [
    <ellipse key="flower" rx="4" ry="6" fill="#9B7BC8" opacity="0.3" />,
  ],
};

// 체리블라썸 테마 일러스트
const CherryIllustrations = {
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 벚꽃 가지 */}
      <path d="M10 70 Q30 50 50 40 Q65 35 75 20" stroke="#8B6050" strokeWidth="2" fill="none" opacity="0.4" />
      {/* 벚꽃들 */}
      <g transform="translate(50, 38)">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse key={i} cx="0" cy="-8" rx="4" ry="7" fill="#E091A8" opacity="0.6"
            transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="4" fill="#FFE8EE" opacity="0.8" />
      </g>
      <g transform="translate(70, 22) scale(0.7)">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse key={i} cx="0" cy="-8" rx="4" ry="7" fill="#F0A8B8" opacity="0.5"
            transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="3" fill="#FFF0F3" opacity="0.7" />
      </g>
      {/* 꽃잎 날리는 효과 */}
      <ellipse cx="25" cy="55" rx="3" ry="5" fill="#E091A8" opacity="0.3" transform="rotate(45 25 55)" />
      <ellipse cx="60" cy="60" rx="2" ry="4" fill="#F0A8B8" opacity="0.25" transform="rotate(-30 60 60)" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 24" className="w-full h-6">
      <defs>
        <linearGradient id="cherryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E091A8" stopOpacity="0" />
          <stop offset="50%" stopColor="#E091A8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E091A8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="200" y2="12" stroke="url(#cherryGrad)" strokeWidth="1.5" />
      {/* 미니 벚꽃 */}
      <g transform="translate(100, 12) scale(0.5)">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse key={i} cx="0" cy="-6" rx="3" ry="5" fill="#E091A8" opacity="0.5"
            transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="3" fill="#FFF0F3" opacity="0.6" />
      </g>
    </svg>
  ),
  header: (
    <svg viewBox="0 0 150 50" className="h-12">
      {/* 벚꽃 가지 */}
      <path d="M0 45 Q40 30 75 25 Q110 20 150 30" stroke="#8B6050" strokeWidth="2" fill="none" opacity="0.3" />
      {/* 여러 벚꽃 */}
      {[[30, 35], [60, 28], [90, 25], [120, 30]].map(([x, y], idx) => (
        <g key={idx} transform={`translate(${x}, ${y}) scale(${0.6 + idx * 0.1})`}>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse key={i} cx="0" cy="-6" rx="3" ry="5" fill="#E091A8" opacity={0.4 + idx * 0.1}
              transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#FFF0F3" opacity="0.7" />
        </g>
      ))}
    </svg>
  ),
  floating: [
    <ellipse key="petal" rx="3" ry="5" fill="#E091A8" opacity="0.3" transform="rotate(30)" />,
  ],
};

// 오션 테마 일러스트
const OceanIllustrations = {
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 파도 */}
      <path d="M5 50 Q15 45 25 50 Q35 55 45 50 Q55 45 65 50 Q75 55 80 50"
        stroke="#40A0D8" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M0 60 Q12 55 24 60 Q36 65 48 60 Q60 55 72 60 Q80 63 85 60"
        stroke="#70B0E0" strokeWidth="2" fill="none" opacity="0.3" />
      {/* 조개 */}
      <ellipse cx="60" cy="70" rx="10" ry="7" fill="#F0E8D8" opacity="0.6" />
      <path d="M52 70 Q60 63 68 70" stroke="#D8C8B0" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M54 70 Q60 65 66 70" stroke="#D8C8B0" strokeWidth="1" fill="none" opacity="0.5" />
      {/* 불가사리 */}
      <g transform="translate(25, 68)">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse key={i} cx="0" cy="-6" rx="2" ry="5" fill="#E8A080" opacity="0.5"
            transform={`rotate(${angle})`} />
        ))}
      </g>
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 20" className="w-full h-5">
      <path d="M0 10 Q20 5 40 10 Q60 15 80 10 Q100 5 120 10 Q140 15 160 10 Q180 5 200 10"
        stroke="#40A0D8" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M0 14 Q25 10 50 14 Q75 18 100 14 Q125 10 150 14 Q175 18 200 14"
        stroke="#70B0E0" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 150 45" className="h-11">
      {/* 파도들 */}
      <path d="M0 35 Q20 28 40 35 Q60 42 80 35 Q100 28 120 35 Q140 42 150 35"
        stroke="#40A0D8" strokeWidth="3" fill="none" opacity="0.35" />
      <path d="M0 28 Q25 22 50 28 Q75 34 100 28 Q125 22 150 28"
        stroke="#70B0E0" strokeWidth="2" fill="none" opacity="0.25" />
      {/* 태양 반사 */}
      <circle cx="120" cy="15" r="8" fill="#FFE8A0" opacity="0.3" />
      <circle cx="120" cy="15" r="5" fill="#FFF0C0" opacity="0.4" />
    </svg>
  ),
  floating: [
    <circle key="bubble" r="4" fill="#70B0E0" opacity="0.2" />,
  ],
};

// 포레스트 테마 일러스트
const ForestIllustrations = {
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 나무 */}
      <path d="M40 75 L40 50" stroke="#6B5040" strokeWidth="4" opacity="0.5" />
      <ellipse cx="40" cy="40" rx="18" ry="22" fill="#5A9060" opacity="0.5" />
      <ellipse cx="40" cy="30" rx="14" ry="18" fill="#70A870" opacity="0.4" />
      <ellipse cx="40" cy="22" rx="10" ry="12" fill="#88B888" opacity="0.35" />
      {/* 작은 나무 */}
      <path d="M65 75 L65 60" stroke="#7B6050" strokeWidth="2" opacity="0.4" />
      <ellipse cx="65" cy="52" rx="10" ry="14" fill="#5A9060" opacity="0.4" />
      <ellipse cx="65" cy="45" rx="7" ry="10" fill="#70A870" opacity="0.35" />
      {/* 도토리 */}
      <ellipse cx="20" cy="70" rx="5" ry="6" fill="#A08060" opacity="0.5" />
      <ellipse cx="20" cy="65" rx="6" ry="3" fill="#8B7050" opacity="0.4" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 24" className="w-full h-6">
      <defs>
        <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5A9060" stopOpacity="0" />
          <stop offset="50%" stopColor="#5A9060" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5A9060" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="200" y2="12" stroke="url(#forestGrad)" strokeWidth="2" />
      {/* 나뭇잎 */}
      <ellipse cx="85" cy="12" rx="8" ry="4" fill="#5A9060" opacity="0.4" transform="rotate(-20 85 12)" />
      <ellipse cx="100" cy="10" rx="6" ry="3" fill="#70A870" opacity="0.35" transform="rotate(15 100 10)" />
      <ellipse cx="115" cy="12" rx="7" ry="4" fill="#5A9060" opacity="0.4" transform="rotate(-10 115 12)" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 150 50" className="h-12">
      {/* 숲 실루엣 */}
      {[15, 35, 55, 75, 95, 115, 135].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={35 - (i % 3) * 5} rx={8 + (i % 2) * 4} ry={15 + (i % 3) * 5}
            fill="#5A9060" opacity={0.25 + (i % 3) * 0.08} />
        </g>
      ))}
      {/* 새 */}
      <path d="M110 15 Q115 12 120 15" stroke="#3A6840" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M125 20 Q130 17 135 20" stroke="#3A6840" strokeWidth="1.5" fill="none" opacity="0.35" />
    </svg>
  ),
  floating: [
    <ellipse key="leaf" rx="5" ry="3" fill="#5A9060" opacity="0.25" transform="rotate(30)" />,
  ],
};

// 선셋 테마 일러스트
const SunsetIllustrations = {
  corner: (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {/* 태양 */}
      <circle cx="60" cy="25" r="15" fill="#F0A060" opacity="0.4" />
      <circle cx="60" cy="25" r="10" fill="#F8B880" opacity="0.5" />
      <circle cx="60" cy="25" r="6" fill="#FFC898" opacity="0.6" />
      {/* 구름 실루엣 */}
      <ellipse cx="25" cy="40" rx="20" ry="10" fill="#E88060" opacity="0.25" />
      <ellipse cx="40" cy="38" rx="15" ry="8" fill="#F0A080" opacity="0.2" />
      {/* 수평선 */}
      <line x1="0" y1="60" x2="80" y2="60" stroke="#D06848" strokeWidth="2" opacity="0.3" />
      {/* 물 반사 */}
      <ellipse cx="40" cy="70" rx="30" ry="5" fill="#F0A060" opacity="0.15" />
    </svg>
  ),
  divider: (
    <svg viewBox="0 0 200 20" className="w-full h-5">
      <defs>
        <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E88060" stopOpacity="0" />
          <stop offset="30%" stopColor="#F0A080" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#F8B898" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#F0A080" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E88060" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="8" width="200" height="4" fill="url(#sunsetGrad)" rx="2" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 150 50" className="h-12">
      {/* 노을 하늘 그라데이션 느낌 */}
      <ellipse cx="75" cy="45" rx="70" ry="25" fill="#E88060" opacity="0.15" />
      <ellipse cx="75" cy="40" rx="55" ry="18" fill="#F0A080" opacity="0.12" />
      {/* 태양 */}
      <circle cx="75" cy="35" r="12" fill="#F8B070" opacity="0.4" />
      <circle cx="75" cy="35" r="8" fill="#FFC890" opacity="0.5" />
      {/* 구름 */}
      <ellipse cx="30" cy="25" rx="18" ry="8" fill="#F8C0A0" opacity="0.3" />
      <ellipse cx="120" cy="28" rx="20" ry="9" fill="#F0B090" opacity="0.25" />
    </svg>
  ),
  floating: [
    <circle key="sun" r="5" fill="#F0A060" opacity="0.2" />,
  ],
};

// 테마별 일러스트 맵핑
const illustrationMap: Record<string, typeof MintChocoIllustrations> = {
  mintchoco: MintChocoIllustrations,
  cloud: CloudIllustrations,
  milktea: MilkteaIllustrations,
  lavender: LavenderIllustrations,
  cherry: CherryIllustrations,
  ocean: OceanIllustrations,
  forest: ForestIllustrations,
  sunset: SunsetIllustrations,
};

export default function ThemeIllustrations({ themeType, variant, className = '' }: ThemeIllustrationsProps) {
  const illustrations = illustrationMap[themeType];

  if (!illustrations) return null;

  const illustration = illustrations[variant as keyof typeof illustrations];

  if (!illustration) return null;

  if (variant === 'floating' && Array.isArray(illustration)) {
    return (
      <div className={`pointer-events-none ${className}`}>
        {illustration.map((el, idx) => (
          <span key={idx} className="absolute opacity-30">{el}</span>
        ))}
      </div>
    );
  }

  return (
    <div className={`pointer-events-none ${className}`}>
      {illustration as React.ReactNode}
    </div>
  );
}

// 테마별 카드 장식 컴포넌트
export function ThemeCardDecoration({ themeType, position = 'top-right' }: { themeType: ThemeType; position?: 'top-right' | 'bottom-left' }) {
  const positionClass = position === 'top-right'
    ? 'absolute -top-2 -right-2 opacity-40'
    : 'absolute -bottom-2 -left-2 opacity-30 transform rotate-180';

  return (
    <ThemeIllustrations themeType={themeType} variant="corner" className={positionClass} />
  );
}

// 테마별 구분선 컴포넌트
export function ThemeDivider({ themeType }: { themeType: ThemeType }) {
  const supportedThemes = ['mintchoco', 'cloud', 'milktea', 'lavender', 'cherry', 'ocean', 'forest', 'sunset'];
  if (!supportedThemes.includes(themeType)) {
    return <hr className="my-4 border-current opacity-20" />;
  }

  return (
    <div className="my-4">
      <ThemeIllustrations themeType={themeType} variant="divider" />
    </div>
  );
}

// 테마별 헤더 장식 컴포넌트
export function ThemeHeaderDecoration({ themeType }: { themeType: ThemeType }) {
  const supportedThemes = ['mintchoco', 'cloud', 'milktea', 'lavender', 'cherry', 'ocean', 'forest', 'sunset'];
  if (!supportedThemes.includes(themeType)) {
    return null;
  }

  return (
    <div className="flex justify-center opacity-60 mb-2">
      <ThemeIllustrations themeType={themeType} variant="header" />
    </div>
  );
}
