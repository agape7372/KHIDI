// KHIDI 채용 비서 맞춤 필터 옵션

export const TYPE_OPTIONS = [
  { value: "브리핑", label: "브리핑" },
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
];

export const LAYER_OPTIONS = [
  { value: "보건산업브리프", label: "보건산업브리프" },
  { value: "보도자료", label: "보도자료" },
  { value: "채용정보", label: "채용정보" },
];

export const REGION_OPTIONS = [
  { value: "국내", label: "국내" },
];

export const SOURCE_OPTIONS = [
  { value: "KHIDI", label: "KHIDI" },
];

// 태그 색상 매핑
export const TAG_COLORS: Record<string, string> = {
  // TYPE
  "브리핑": "bg-blue-100 text-blue-700",

  // CATEGORY
  "R&D정책": "bg-sky-100 text-sky-700",
  "바이오헬스": "bg-emerald-100 text-emerald-700",
  "디지털헬스케어": "bg-violet-100 text-violet-700",
  "의료기기": "bg-amber-100 text-amber-700",
  "글로벌진출": "bg-cyan-100 text-cyan-700",
  "규제인허가": "bg-rose-100 text-rose-700",
  "채용분석": "bg-lime-100 text-lime-700",
  "산업동향": "bg-orange-100 text-orange-700",

  // LAYER (발행처)
  "보건산업브리프": "bg-indigo-100 text-indigo-700",
  "보도자료": "bg-teal-100 text-teal-700",
  "채용정보": "bg-green-100 text-green-700",

  // REGION
  "국내": "bg-slate-100 text-slate-700",

  // SOURCE
  "KHIDI": "bg-blue-100 text-blue-700",
};

export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-600";
};
