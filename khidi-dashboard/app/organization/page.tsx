"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import HamburgerMenu from "@/components/HamburgerMenu";
import Sidebar from "@/components/Sidebar";
import {
  directOrganizations,
  planningDirectorUnit,
  kHealthUnit,
  bigDataUnit,
  headquarters,
  overseasOffices,
  Department,
  HeadquarterGroup,
  getAllDepartments,
} from "@/lib/organizationData";
import { ThemeType, Theme, getTheme, themes } from "@/lib/themes";

// 부서 카드 컴포넌트
function DepartmentCard({
  dept,
  onSelect,
  isSelected,
  theme,
}: {
  dept: Department;
  onSelect: (dept: Department) => void;
  isSelected: boolean;
  theme: Theme;
}) {
  return (
    <button
      onClick={() => onSelect(dept)}
      className="w-full text-left p-4 rounded-xl border-l-4 transition-all group border-y border-r"
      style={{
        borderLeftColor: isSelected ? theme.colors.primary : theme.colors.border,
        backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.cardBg,
        borderTopColor: isSelected ? theme.colors.primary : theme.colors.border,
        borderRightColor: isSelected ? theme.colors.primary : theme.colors.border,
        borderBottomColor: isSelected ? theme.colors.primary : theme.colors.border,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h4 className="font-bold transition-colors" style={{ color: theme.colors.textPrimary }}>
          {dept.name}
        </h4>
        {dept.contact && (
          <span
            className="shrink-0 px-2 py-0.5 text-[11px] font-bold rounded-full"
            style={{ backgroundColor: theme.colors.amber.text, color: '#FFFFFF' }}
          >
            채용관심
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>{dept.description}</p>
    </button>
  );
}

// 본부 그룹 컴포넌트
function HeadquarterSection({
  group,
  selectedDept,
  onSelectDept,
  theme,
}: {
  group: HeadquarterGroup;
  selectedDept: Department | null;
  onSelectDept: (dept: Department) => void;
  theme: Theme;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: theme.colors.cardBg,
        border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
        boxShadow: theme.shadows?.card || '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 transition-all"
        style={{ backgroundColor: theme.colors.sidebarBg }}
      >
        <div className="text-left">
          <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{group.name}</h3>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>{group.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 text-sm font-medium rounded-full"
            style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}
          >
            {group.departments.length}개
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: theme.colors.textMuted }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isExpanded && (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border-t"
          style={{ backgroundColor: theme.colors.pageBg, borderColor: theme.colors.border }}
        >
          {group.departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              onSelect={onSelectDept}
              isSelected={selectedDept?.id === dept.id}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 부서 상세 패널
function DepartmentDetail({ dept, theme }: { dept: Department; theme: Theme }) {
  return (
    <div
      className="rounded-xl sticky top-24 overflow-hidden"
      style={{
        backgroundColor: theme.colors.cardBg,
        border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
        boxShadow: theme.shadows?.card || '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* 헤더 */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: theme.colors.sidebarBg, borderColor: theme.colors.border }}
      >
        <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{dept.name}</h3>
        {dept.englishName && (
          <p className="text-xs mt-0.5" style={{ color: theme.colors.textMuted }}>{dept.englishName}</p>
        )}
      </div>

      <div className="p-4 space-y-5">
        <p className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>{dept.description}</p>

        {/* 주요 업무 */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>
            주요 업무
          </h4>
          <ul className="space-y-1.5">
            {dept.mainTasks.map((task, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                <span className="mt-0.5" style={{ color: theme.colors.primary }}>›</span>
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* 키워드 */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>
            키워드
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dept.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded-md"
                style={{ backgroundColor: theme.colors.sidebarBg, color: theme.colors.textSecondary }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 관련 카테고리 */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>
            관련 분야
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dept.relatedCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/ai-newsfeed?category=${encodeURIComponent(cat)}`}
                className="px-2 py-0.5 text-xs rounded-md transition-colors"
                style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 연락처 */}
        {dept.contact && (
          <div
            className="p-3 rounded-lg border"
            style={{ backgroundColor: theme.colors.amber.bg, borderColor: theme.colors.amber.border }}
          >
            <p className="text-xs" style={{ color: theme.colors.amber.text }}>
              <span className="font-medium">연락처</span> {dept.contact}
            </p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div
        className="p-4 border-t"
        style={{ backgroundColor: theme.colors.sidebarBg, borderColor: theme.colors.border }}
      >
        <Link
          href={`/ai-newsfeed?search=${encodeURIComponent(dept.keywords[0] || dept.name)}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={{
            backgroundColor: theme.colors.buttonBg,
            color: theme.colors.buttonText,
            boxShadow: theme.shadows?.button || 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            if (theme.shadows?.hover) {
              e.currentTarget.style.boxShadow = theme.shadows.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = theme.shadows?.button || 'none';
          }}
        >
          관련 브리핑 보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// 전체 목록 뷰 컴포넌트
function DepartmentListView({
  selectedDept,
  onSelectDept,
  theme,
}: {
  selectedDept: Department | null;
  onSelectDept: (dept: Department) => void;
  theme: Theme;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const allDepts = getAllDepartments();

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allDepts.forEach((dept) => {
      dept.relatedCategories.forEach((cat) => cats.add(cat));
    });
    return ["all", ...Array.from(cats).sort()];
  }, [allDepts]);

  // 필터링된 부서 목록
  const filteredDepts = useMemo(() => {
    return allDepts.filter((dept) => {
      const matchesSearch =
        searchTerm === "" ||
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.keywords.some((kw) =>
          kw.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory =
        filterCategory === "all" ||
        dept.relatedCategories.includes(filterCategory);
      return matchesSearch && matchesCategory;
    });
  }, [allDepts, searchTerm, filterCategory]);

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: theme.colors.textMuted }}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="부서명, 키워드로 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.pageBg,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.cardBg,
              color: theme.colors.textPrimary,
            }}
          >
            <option value="all">전체 분야</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
          총 {filteredDepts.length}개 부서
        </div>
      </div>

      {/* 부서 목록 */}
      <div className="grid gap-3">
        {filteredDepts.map((dept) => (
          <button
            key={dept.id}
            onClick={() => onSelectDept(dept)}
            className="w-full text-left p-4 rounded-xl border transition-all"
            style={{
              borderColor: selectedDept?.id === dept.id ? theme.colors.primary : theme.colors.border,
              backgroundColor: selectedDept?.id === dept.id ? theme.colors.primaryLight : theme.colors.cardBg,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold" style={{ color: theme.colors.textPrimary }}>{dept.name}</h4>
                  {dept.contact && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                      style={{ backgroundColor: theme.colors.amber.text, color: '#FFFFFF' }}
                    >
                      채용관심
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2" style={{ color: theme.colors.textMuted }}>{dept.description}</p>
                <div className="flex flex-wrap gap-1">
                  {dept.relatedCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <svg
                className="w-5 h-5 shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: theme.colors.textMuted }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OrganizationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "list">("chart");
  const [currentTheme] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return 'default';
    const saved = localStorage.getItem('briefing_theme') as ThemeType;
    return saved && themes[saved] ? saved : 'default';
  });

  const theme = getTheme(currentTheme);

  // 전체 부서 수
  const totalDepts = getAllDepartments().length;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.pageBg,
        backgroundImage: theme.patterns?.page,
        backgroundSize: theme.patterns?.page?.includes('linear-gradient') ? 'auto' : '24px 24px',
      }}
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-30"
        style={{ backgroundColor: theme.colors.headerBg, borderColor: theme.colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
            {theme.decorations?.noteHeader && <span className="mr-2">{theme.icon}</span>}
            KHIDI AI 채용 비서
          </Link>
          <HamburgerMenu onClick={() => setIsSidebarOpen(true)} theme={theme} />
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: theme.colors.textMuted }}>
            <Link href="/" className="hover:opacity-80" style={{ color: theme.colors.primary }}>홈</Link>
            <span>/</span>
            <span style={{ color: theme.colors.textPrimary }}>조직 분석</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
            KHIDI 조직 분석
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            한국보건산업진흥원 조직 구조와 각 부서별 주요 업무를 확인하세요.
            <span className="ml-2" style={{ color: theme.colors.primary }}>총 {totalDepts}개 부서</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("chart")}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "chart" ? theme.colors.buttonBg : theme.colors.cardBg,
              color: activeTab === "chart" ? theme.colors.buttonText : theme.colors.textSecondary,
              border: activeTab === "chart" ? 'none' : `1px solid ${theme.colors.border}`,
            }}
          >
            조직도 보기
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "list" ? theme.colors.buttonBg : theme.colors.cardBg,
              color: activeTab === "list" ? theme.colors.buttonText : theme.colors.textSecondary,
              border: activeTab === "list" ? 'none' : `1px solid ${theme.colors.border}`,
            }}
          >
            전체 목록
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 조직도 / 목록 */}
          <div className="flex-1 space-y-4">
            {activeTab === "list" ? (
              <DepartmentListView
                selectedDept={selectedDept}
                onSelectDept={setSelectedDept}
                theme={theme}
              />
            ) : (
              <>
            {/* 원장 직속 */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBg,
                border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
                boxShadow: theme.shadows?.card || '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div className="p-5" style={{ backgroundColor: theme.colors.buttonBg }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg" style={{ color: theme.colors.buttonText }}>원장 직속</h2>
                    <p className="text-sm mt-0.5" style={{ color: `${theme.colors.buttonText}CC` }}>최고 책임자 직속 조직</p>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{ backgroundColor: theme.colors.cardBg, color: theme.colors.buttonBg }}
                  >
                    {directOrganizations.length}개
                  </span>
                </div>
              </div>
              <div
                className="grid sm:grid-cols-2 gap-3 p-4 border-t"
                style={{ backgroundColor: theme.colors.pageBg, borderColor: theme.colors.border }}
              >
                {directOrganizations.map((dept) => (
                  <DepartmentCard
                    key={dept.id}
                    dept={dept}
                    onSelect={setSelectedDept}
                    isSelected={selectedDept?.id === dept.id}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            {/* 기획이사 */}
            <HeadquarterSection
              group={planningDirectorUnit}
              selectedDept={selectedDept}
              onSelectDept={setSelectedDept}
              theme={theme}
            />

            {/* K-헬스미래추진단 */}
            <HeadquarterSection
              group={kHealthUnit}
              selectedDept={selectedDept}
              onSelectDept={setSelectedDept}
              theme={theme}
            />

            {/* 빅데이터사업단 */}
            <HeadquarterSection
              group={bigDataUnit}
              selectedDept={selectedDept}
              onSelectDept={setSelectedDept}
              theme={theme}
            />

            {/* 5개 본부 */}
            {headquarters.map((hq) => (
              <HeadquarterSection
                key={hq.id}
                group={hq}
                selectedDept={selectedDept}
                onSelectDept={setSelectedDept}
                theme={theme}
              />
            ))}

            {/* 해외지사 */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBg,
                border: `1px ${theme.decorations?.borderStyle || 'solid'} ${theme.colors.border}`,
                boxShadow: theme.shadows?.card || '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div className="p-5" style={{ backgroundColor: theme.colors.green.text }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">해외지사</h3>
                    <p className="text-sm mt-0.5" style={{ color: '#FFFFFFCC' }}>글로벌 네트워크</p>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{ backgroundColor: theme.colors.cardBg, color: theme.colors.green.text }}
                  >
                    4개소
                  </span>
                </div>
              </div>
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4"
                style={{ backgroundColor: theme.colors.pageBg }}
              >
                {overseasOffices.map((dept) => (
                  <DepartmentCard
                    key={dept.id}
                    dept={dept}
                    onSelect={setSelectedDept}
                    isSelected={selectedDept?.id === dept.id}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
            </>
            )}
          </div>

          {/* 상세 패널 */}
          <div className="w-full lg:w-80 xl:w-96">
            {selectedDept ? (
              <DepartmentDetail dept={selectedDept} theme={theme} />
            ) : (
              <div
                className="rounded-xl border p-6 text-center sticky top-24"
                style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: theme.colors.sidebarBg }}
                >
                  <span className="text-2xl">👆</span>
                </div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: theme.colors.textPrimary }}>부서를 선택하세요</h3>
                <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                  부서 클릭 시 상세 정보 확인
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
