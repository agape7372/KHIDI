// KHIDI 조직 구조 데이터
// 출처: 한국보건산업진흥원 공식 홈페이지 (https://www.khidi.or.kr)

export interface Department {
  id: string;
  name: string;
  englishName?: string;
  parent?: string;
  level: "headquarter" | "division" | "team" | "center" | "overseas";
  description: string;
  mainTasks: string[];
  keywords: string[]; // 뉴스 필터링용 키워드
  relatedCategories: string[];
  contact?: string;
}

export interface HeadquarterGroup {
  id: string;
  name: string;
  description: string;
  departments: Department[];
}

// 원장 직속 조직 (감사팀만)
export const directOrganizations: Department[] = [
  {
    id: "audit",
    name: "감사팀",
    level: "team",
    description: "기관 내부 감사 및 윤리경영 담당",
    mainTasks: [
      "내부 감사 업무",
      "윤리경영 및 청렴도 관리",
      "감사 결과 보고 및 후속 조치",
    ],
    keywords: ["감사", "윤리경영", "청렴", "내부통제"],
    relatedCategories: ["경영지원"],
  },
];

// 기획이사 산하 조직
export const planningDirectorUnit: HeadquarterGroup = {
  id: "planning-director",
  name: "기획이사",
  description: "기관 전략기획 및 정책연구 총괄",
  departments: [
    {
      id: "policy-research-center",
      name: "바이오헬스정책연구센터",
      parent: "planning-director",
      level: "center",
      description: "보건산업 정책 연구 및 분석",
      mainTasks: [
        "보건산업 정책 연구",
        "산업 동향 분석 및 보고서 발간",
        "정책 제언 및 자문",
        "보건산업브리프 발간",
      ],
      keywords: ["정책연구", "산업분석", "브리프", "동향", "보고서", "백서"],
      relatedCategories: ["R&D정책", "바이오헬스"],
    },
    {
      id: "hrd",
      name: "인력개발실",
      parent: "planning-director",
      level: "team",
      description: "보건산업 인력 양성 및 교육",
      mainTasks: [
        "보건산업 전문인력 양성",
        "직무교육 프로그램 운영",
        "인력 수급 현황 조사",
      ],
      keywords: ["인력양성", "교육", "전문인력", "HRD", "인재"],
      relatedCategories: ["인력양성"],
    },
  ],
};

// K-헬스미래추진단
export const kHealthUnit: HeadquarterGroup = {
  id: "k-health",
  name: "K-헬스미래추진단",
  description: "한국형 ARPA-H 프로젝트 전담 조직",
  departments: [
    {
      id: "k-health-support",
      name: "총괄지원센터",
      parent: "k-health",
      level: "center",
      description: "K-헬스미래추진단 총괄 지원",
      mainTasks: [
        "사업 총괄 기획 및 조정",
        "예산 및 행정 지원",
        "성과 관리",
      ],
      keywords: ["ARPA-H", "K-헬스", "미래의료", "혁신"],
      relatedCategories: ["R&D정책", "디지털헬스케어"],
    },
    {
      id: "k-health-pm",
      name: "PM센터",
      parent: "k-health",
      level: "center",
      description: "프로젝트 매니저 운영 및 과제 관리",
      mainTasks: [
        "PM 선발 및 운영",
        "혁신 과제 발굴",
        "과제 진행 관리",
      ],
      keywords: ["PM", "프로젝트", "과제관리", "혁신과제"],
      relatedCategories: ["R&D정책"],
    },
    {
      id: "k-health-essential",
      name: "필수의료센터",
      parent: "k-health",
      level: "center",
      description: "필수의료 분야 R&D 지원",
      mainTasks: [
        "필수의료 기술 개발 지원",
        "응급·중증 의료 R&D",
        "의료 접근성 개선 사업",
      ],
      keywords: ["필수의료", "응급의료", "중증", "의료접근성"],
      relatedCategories: ["공중보건", "R&D정책"],
    },
  ],
};

// 국가통합바이오 빅데이터구축사업단
export const bigDataUnit: HeadquarterGroup = {
  id: "bigdata",
  name: "국가통합바이오 빅데이터구축사업단",
  description: "국가 바이오 빅데이터 플랫폼 구축 및 운영",
  departments: [
    {
      id: "bigdata-office",
      name: "사무국",
      parent: "bigdata",
      level: "team",
      description: "빅데이터 사업단 운영 지원",
      mainTasks: [
        "바이오 빅데이터 수집 및 통합",
        "데이터 품질 관리",
        "데이터 활용 지원",
        "플랫폼 운영",
      ],
      keywords: ["빅데이터", "바이오데이터", "데이터플랫폼", "의료데이터", "AI"],
      relatedCategories: ["헬스케어IT", "디지털헬스케어"],
    },
  ],
};

// 5개 본부
export const headquarters: HeadquarterGroup[] = [
  {
    id: "management",
    name: "경영기획본부",
    description: "기관 경영전략 및 행정 총괄",
    departments: [
      {
        id: "planning-coordination",
        name: "기획조정실",
        parent: "management",
        level: "team",
        description: "기관 전략기획 및 조정",
        mainTasks: [
          "중장기 경영전략 수립",
          "경영평가 대응",
          "조직 관리 및 조정",
          "대외협력",
        ],
        keywords: ["경영전략", "기획", "조정", "평가"],
        relatedCategories: ["경영지원"],
      },
      {
        id: "management-support",
        name: "경영지원실",
        parent: "management",
        level: "team",
        description: "인사, 재무, 총무 등 경영지원",
        mainTasks: [
          "인사 관리",
          "재무 회계",
          "총무 및 시설 관리",
          "법무 지원",
        ],
        keywords: ["인사", "재무", "총무", "채용", "예산"],
        relatedCategories: ["경영지원", "채용분석"],
      },
    ],
  },
  {
    id: "biohealth-innovation",
    name: "바이오헬스혁신본부",
    description: "바이오헬스 산업 혁신 및 인재 양성",
    departments: [
      {
        id: "biohealth-planning",
        name: "바이오헬스혁신기획단",
        parent: "biohealth-innovation",
        level: "division",
        description: "바이오헬스 혁신 전략 기획",
        mainTasks: [
          "바이오헬스 혁신 전략 수립",
          "신산업 발굴",
          "규제혁신 지원",
        ],
        keywords: ["바이오헬스", "혁신", "전략", "규제혁신"],
        relatedCategories: ["바이오헬스", "규제인허가"],
      },
      {
        id: "biohealth-talent",
        name: "바이오헬스인재양성단",
        parent: "biohealth-innovation",
        level: "division",
        description: "바이오헬스 분야 전문인력 양성",
        mainTasks: [
          "바이오헬스 인력 양성 사업",
          "산학협력 프로그램",
          "글로벌 인재 육성",
        ],
        keywords: ["인재양성", "교육", "산학협력", "전문인력"],
        relatedCategories: ["인력양성"],
      },
      {
        id: "digital-health",
        name: "디지털헬스사업단",
        parent: "biohealth-innovation",
        level: "division",
        description: "디지털 헬스케어 산업 육성",
        mainTasks: [
          "디지털치료제(DTx) 지원",
          "AI 의료기기 육성",
          "원격의료 기반 조성",
          "디지털 헬스케어 생태계 구축",
        ],
        keywords: ["디지털헬스", "DTx", "디지털치료제", "AI의료기기", "원격의료", "스마트헬스"],
        relatedCategories: ["디지털헬스케어", "헬스케어IT"],
      },
    ],
  },
  {
    id: "rnd-innovation",
    name: "연구개발혁신본부",
    description: "보건의료 R&D 기획, 관리, 지원 총괄",
    departments: [
      {
        id: "rnd-policy",
        name: "R&D정책전략단",
        parent: "rnd-innovation",
        level: "division",
        description: "보건의료 R&D 정책 및 전략 수립",
        mainTasks: [
          "R&D 중장기 전략 수립",
          "R&D 정책 연구",
          "성과 분석 및 환류",
        ],
        keywords: ["R&D정책", "연구개발전략", "성과분석"],
        relatedCategories: ["R&D정책"],
      },
      {
        id: "rnd-planning",
        name: "R&D사업기획단",
        parent: "rnd-innovation",
        level: "division",
        description: "R&D 사업 기획 및 공고",
        mainTasks: [
          "R&D 사업 기획",
          "과제 공고 및 선정",
          "사업 예산 편성",
        ],
        keywords: ["R&D사업", "과제공고", "사업기획", "연구과제"],
        relatedCategories: ["R&D정책"],
      },
      {
        id: "rnd-support",
        name: "R&D사업지원단",
        parent: "rnd-innovation",
        level: "division",
        description: "R&D 과제 관리 및 지원",
        mainTasks: [
          "R&D 과제 관리",
          "연구비 집행 관리",
          "성과 평가",
          "연구자 지원",
        ],
        keywords: ["R&D지원", "과제관리", "연구비", "성과평가"],
        relatedCategories: ["R&D정책"],
        contact: "R&D 사업지원 부문 지원자 주목!",
      },
      {
        id: "advanced-bio-rnd",
        name: "첨단바이오기술R&D단",
        parent: "rnd-innovation",
        level: "division",
        description: "첨단 바이오 기술 R&D 지원",
        mainTasks: [
          "유전자치료제 R&D",
          "세포치료제 R&D",
          "mRNA 플랫폼 개발",
          "합성생물학 연구 지원",
        ],
        keywords: ["첨단바이오", "유전자치료", "세포치료", "mRNA", "합성생물학", "CAR-T"],
        relatedCategories: ["제약바이오", "R&D정책"],
      },
      {
        id: "medical-tech-rnd",
        name: "의료기술R&D단",
        parent: "rnd-innovation",
        level: "division",
        description: "의료기술 R&D 지원",
        mainTasks: [
          "의료기기 R&D",
          "진단기술 개발",
          "치료기술 개발",
          "재활·복지기기 R&D",
        ],
        keywords: ["의료기술", "의료기기R&D", "진단", "치료기술"],
        relatedCategories: ["의료기기", "R&D정책"],
      },
      {
        id: "research-hospital",
        name: "연구중심병원지원단",
        parent: "rnd-innovation",
        level: "division",
        description: "연구중심병원 육성 지원",
        mainTasks: [
          "연구중심병원 지정 및 평가",
          "임상연구 인프라 지원",
          "병원 연구역량 강화",
        ],
        keywords: ["연구중심병원", "임상연구", "병원연구", "임상시험"],
        relatedCategories: ["R&D정책", "제약바이오"],
      },
    ],
  },
  {
    id: "industry-promotion",
    name: "산업진흥본부",
    description: "보건산업 육성 및 기업 지원",
    departments: [
      {
        id: "health-industry",
        name: "보건산업육성단",
        parent: "industry-promotion",
        level: "division",
        description: "보건산업 전반 육성 지원",
        mainTasks: [
          "보건산업 창업 지원",
          "중소기업 육성",
          "산업 생태계 조성",
          "투자 유치 지원",
        ],
        keywords: ["산업육성", "창업", "스타트업", "중소기업", "투자"],
        relatedCategories: ["바이오헬스"],
      },
      {
        id: "pharma-bio",
        name: "제약바이오산업단",
        parent: "industry-promotion",
        level: "division",
        description: "제약·바이오 산업 지원",
        mainTasks: [
          "제약산업 경쟁력 강화",
          "바이오의약품 육성",
          "CMO/CDMO 지원",
          "의약품 품질 향상",
        ],
        keywords: ["제약", "바이오의약품", "CMO", "CDMO", "신약", "바이오시밀러"],
        relatedCategories: ["제약바이오"],
      },
      {
        id: "device-cosmetics",
        name: "의료기기화장품산업단",
        parent: "industry-promotion",
        level: "division",
        description: "의료기기 및 화장품 산업 지원",
        mainTasks: [
          "의료기기 산업 육성",
          "화장품 산업 지원",
          "인허가 컨설팅",
          "품질 인증 지원",
        ],
        keywords: ["의료기기", "화장품", "인허가", "품질인증", "GMP"],
        relatedCategories: ["의료기기", "규제인허가"],
        contact: "043-713-8867",
      },
    ],
  },
  {
    id: "international-medical",
    name: "국제의료본부",
    description: "의료 해외진출 및 외국인 환자 유치",
    departments: [
      {
        id: "foreign-patient",
        name: "외국인환자유치단",
        parent: "international-medical",
        level: "division",
        description: "외국인 환자 유치 지원",
        mainTasks: [
          "외국인 환자 유치 사업",
          "의료관광 활성화",
          "유치기관 지원",
          "의료 한류 확산",
        ],
        keywords: ["외국인환자", "의료관광", "메디컬투어", "K-메디컬"],
        relatedCategories: ["글로벌진출"],
      },
      {
        id: "overseas-expansion",
        name: "의료해외진출단",
        parent: "international-medical",
        level: "division",
        description: "의료기관 및 기업 해외진출 지원",
        mainTasks: [
          "의료기관 해외진출 지원",
          "의료기기·제약 수출 지원",
          "해외 인허가 컨설팅",
          "글로벌 네트워크 구축",
        ],
        keywords: ["해외진출", "수출", "글로벌", "FDA", "CE", "해외인허가"],
        relatedCategories: ["글로벌진출", "규제인허가"],
      },
      {
        id: "medical-management",
        name: "의료경영지원단",
        parent: "international-medical",
        level: "division",
        description: "의료기관 경영 컨설팅 및 지원",
        mainTasks: [
          "의료기관 경영 컨설팅",
          "의료 서비스 품질 향상",
          "의료기관 인증 지원",
        ],
        keywords: ["의료경영", "병원경영", "의료서비스", "인증"],
        relatedCategories: ["공중보건"],
      },
    ],
  },
];

// 해외지사
export const overseasOffices: Department[] = [
  {
    id: "usa-boston",
    name: "미국지사 (보스턴)",
    englishName: "KHIDI USA (Boston)",
    level: "overseas",
    description: "북미 시장 진출 지원 및 협력",
    mainTasks: [
      "FDA 인허가 지원",
      "미국 시장 진출 컨설팅",
      "현지 네트워크 구축",
      "투자 유치 지원",
    ],
    keywords: ["미국", "FDA", "보스턴", "북미"],
    relatedCategories: ["글로벌진출", "규제인허가"],
  },
  {
    id: "china-shanghai",
    name: "중국지사 (상해)",
    englishName: "KHIDI China (Shanghai)",
    level: "overseas",
    description: "중국 시장 진출 지원",
    mainTasks: [
      "NMPA 인허가 지원",
      "중국 시장 진출 컨설팅",
      "현지 파트너십 구축",
    ],
    keywords: ["중국", "NMPA", "상해", "중화권"],
    relatedCategories: ["글로벌진출"],
  },
  {
    id: "uae-abudhabi",
    name: "UAE지사 (아부다비)",
    englishName: "KHIDI UAE (Abu Dhabi)",
    level: "overseas",
    description: "중동 시장 진출 지원",
    mainTasks: [
      "중동 시장 진출 지원",
      "의료기관 진출 협력",
      "의료기기 인증 지원",
    ],
    keywords: ["UAE", "아부다비", "중동", "두바이"],
    relatedCategories: ["글로벌진출"],
  },
  {
    id: "kazakhstan-almaty",
    name: "카자흐스탄지사 (알마티)",
    englishName: "KHIDI Kazakhstan (Almaty)",
    level: "overseas",
    description: "중앙아시아 시장 진출 지원",
    mainTasks: [
      "CIS 지역 진출 지원",
      "의료 협력 사업",
      "현지 네트워크 구축",
    ],
    keywords: ["카자흐스탄", "알마티", "CIS", "중앙아시아"],
    relatedCategories: ["글로벌진출"],
  },
];

// 전체 부서 목록 (검색/필터용)
export const getAllDepartments = (): Department[] => {
  const allDepts: Department[] = [
    ...directOrganizations,
    ...planningDirectorUnit.departments,
    ...kHealthUnit.departments,
    ...bigDataUnit.departments,
    ...overseasOffices,
  ];

  headquarters.forEach((hq) => {
    allDepts.push(...hq.departments);
  });

  return allDepts;
};

// 부서 ID로 검색
export const getDepartmentById = (id: string): Department | undefined => {
  return getAllDepartments().find((dept) => dept.id === id);
};

// 키워드로 관련 부서 찾기
export const getDepartmentsByKeyword = (keyword: string): Department[] => {
  const lowerKeyword = keyword.toLowerCase();
  return getAllDepartments().filter(
    (dept) =>
      dept.keywords.some((kw) => kw.toLowerCase().includes(lowerKeyword)) ||
      dept.name.toLowerCase().includes(lowerKeyword) ||
      dept.description.toLowerCase().includes(lowerKeyword)
  );
};

// 카테고리로 관련 부서 찾기
export const getDepartmentsByCategory = (category: string): Department[] => {
  return getAllDepartments().filter((dept) =>
    dept.relatedCategories.includes(category)
  );
};
