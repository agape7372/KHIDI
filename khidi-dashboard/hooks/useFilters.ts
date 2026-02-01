"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Article, FilterState } from "@/lib/types";

const initialFilterState: FilterState = {
  type: [],
  category: [],
  layer: [],
  region: [],
  source: [],
  search: "",
};

interface UseFiltersOptions {
  initialCategory?: string[];
  initialSearch?: string;
}

export function useFilters(articles: Article[], options?: UseFiltersOptions) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilterState,
    category: options?.initialCategory || [],
    search: options?.initialSearch || "",
  }));

  // URL 파라미터 변경 시 필터 업데이트
  useEffect(() => {
    if (options?.initialCategory || options?.initialSearch) {
      setFilters((prev) => ({
        ...prev,
        category: options?.initialCategory || prev.category,
        search: options?.initialSearch || prev.search,
      }));
    }
  }, [options?.initialCategory, options?.initialSearch]);

  // 필터링된 아티클
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 타입 필터
      if (filters.type.length > 0 && !filters.type.includes(article.tags.type)) {
        return false;
      }

      // 카테고리 필터
      if (
        filters.category.length > 0 &&
        !filters.category.includes(article.tags.category)
      ) {
        return false;
      }

      // 레이어 필터
      if (
        filters.layer.length > 0 &&
        !filters.layer.includes(article.tags.layer)
      ) {
        return false;
      }

      // 지역 필터
      if (
        filters.region.length > 0 &&
        !filters.region.includes(article.tags.region)
      ) {
        return false;
      }

      // 소스 필터
      if (
        filters.source.length > 0 &&
        !filters.source.includes(article.tags.source)
      ) {
        return false;
      }

      // 검색어 필터
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = article.title.toLowerCase().includes(searchLower);
        const summaryMatch = article.summary.toLowerCase().includes(searchLower);
        if (!titleMatch && !summaryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [articles, filters]);

  // 각 옵션별 카운트 계산
  const counts = useMemo(() => {
    const typeCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    const layerCount: Record<string, number> = {};
    const regionCount: Record<string, number> = {};
    const sourceCount: Record<string, number> = {};

    articles.forEach((article) => {
      // Type counts
      typeCount[article.tags.type] = (typeCount[article.tags.type] || 0) + 1;

      // Category counts
      categoryCount[article.tags.category] =
        (categoryCount[article.tags.category] || 0) + 1;

      // Layer counts
      layerCount[article.tags.layer] =
        (layerCount[article.tags.layer] || 0) + 1;

      // Region counts
      regionCount[article.tags.region] =
        (regionCount[article.tags.region] || 0) + 1;

      // Source counts
      sourceCount[article.tags.source] =
        (sourceCount[article.tags.source] || 0) + 1;
    });

    return {
      type: typeCount,
      category: categoryCount,
      layer: layerCount,
      region: regionCount,
      source: sourceCount,
    };
  }, [articles]);

  // 필터 업데이트 함수들
  const setTypeFilter = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, type: values }));
  }, []);

  const setCategoryFilter = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, category: values }));
  }, []);

  const setLayerFilter = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, layer: values }));
  }, []);

  const setRegionFilter = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, region: values }));
  }, []);

  const setSourceFilter = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, source: values }));
  }, []);

  const setSearchFilter = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.type.length > 0 ||
      filters.category.length > 0 ||
      filters.layer.length > 0 ||
      filters.region.length > 0 ||
      filters.source.length > 0 ||
      filters.search.length > 0
    );
  }, [filters]);

  return {
    filters,
    filteredArticles,
    counts,
    setTypeFilter,
    setCategoryFilter,
    setLayerFilter,
    setRegionFilter,
    setSourceFilter,
    setSearchFilter,
    resetFilters,
    hasActiveFilters,
  };
}
