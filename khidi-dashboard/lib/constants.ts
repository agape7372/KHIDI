// KHIDI 채용 비서 맞춤 필터 옵션

export const TYPE_OPTIONS = [
  { value: "브리핑", label: "브리핑" },
  { value: "뉴스", label: "뉴스" },
  { value: "채용공고", label: "채용공고" },
  { value: "인바스켓", label: "인바스켓" },
];

export const CATEGORY_OPTIONS = [
  { value: "R&D정책", label: "R&D정책" },
  { value: "바이오헬스", label: "바이오헬스" },
  { value: "디지털헬스케어", label: "디지털헬스케어" },
  { value: "의료기기", label: "의료기기" },
  { value: "글로벌진출", label: "글로벌진출" },
  { value: "규제인허가", label: "규제인허가" },
  { value: "채용분석", label: "채용분석" },
  { value: "산업동향", label: "산업동향" },
  { value: "인력양성", label: "인력양성" },
  { value: "제약바이오", label: "제약바이오" },
  { value: "헬스케어IT", label: "헬스케어IT" },
  { value: "공중보건", label: "공중보건" },
];

export const LAYER_OPTIONS = [
  { value: "보건산업브리프", label: "보건산업브리프" },
  { value: "글로벌동향", label: "글로벌동향" },
  { value: "뉴스레터", label: "뉴스레터" },
  { value: "정책보고서", label: "정책보고서" },
  { value: "백서", label: "백서" },
  { value: "통계자료", label: "통계자료" },
  { value: "연구보고서", label: "연구보고서" },
];

export const REGION_OPTIONS = [
  { value: "국내", label: "국내" },
  { value: "북미", label: "북미" },
  { value: "유럽", label: "유럽" },
  { value: "아시아", label: "아시아" },
  { value: "글로벌", label: "글로벌" },
  { value: "중동", label: "중동" },
  { value: "동남아", label: "동남아" },
];

export const SOURCE_OPTIONS = [
  { value: "KHIDI", label: "KHIDI" },
  { value: "식약처", label: "식약처" },
  { value: "복지부", label: "복지부" },
  { value: "산업부", label: "산업부" },
  { value: "언론보도", label: "언론보도" },
  { value: "학술자료", label: "학술자료" },
  { value: "기업공시", label: "기업공시" },
];

// 태그 색상 매핑
export const TAG_COLORS: Record<string, string> = {
  // TYPE
  "브리핑": "bg-blue-100 text-blue-700",
  "뉴스": "bg-indigo-100 text-indigo-700",
  "채용공고": "bg-green-100 text-green-700",
  "인바스켓": "bg-purple-100 text-purple-700",

  // CATEGORY
  "R&D정책": "bg-sky-100 text-sky-700",
  "바이오헬스": "bg-emerald-100 text-emerald-700",
  "디지털헬스케어": "bg-violet-100 text-violet-700",
  "의료기기": "bg-amber-100 text-amber-700",
  "글로벌진출": "bg-cyan-100 text-cyan-700",
  "규제인허가": "bg-rose-100 text-rose-700",
  "채용분석": "bg-lime-100 text-lime-700",
  "산업동향": "bg-orange-100 text-orange-700",
  "인력양성": "bg-teal-100 text-teal-700",
  "제약바이오": "bg-fuchsia-100 text-fuchsia-700",
  "헬스케어IT": "bg-blue-100 text-blue-700",
  "공중보건": "bg-red-100 text-red-700",

  // REGION
  "국내": "bg-slate-100 text-slate-700",
  "북미": "bg-cyan-100 text-cyan-700",
  "유럽": "bg-indigo-100 text-indigo-700",
  "아시아": "bg-yellow-100 text-yellow-700",
  "글로벌": "bg-gray-100 text-gray-700",
  "중동": "bg-orange-100 text-orange-700",
  "동남아": "bg-green-100 text-green-700",

  // SOURCE
  "KHIDI": "bg-blue-100 text-blue-700",
  "식약처": "bg-red-100 text-red-700",
  "복지부": "bg-green-100 text-green-700",
  "산업부": "bg-purple-100 text-purple-700",
  "언론보도": "bg-gray-100 text-gray-600",
  "학술자료": "bg-indigo-100 text-indigo-700",
  "기업공시": "bg-amber-100 text-amber-700",
};

export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-600";
};
