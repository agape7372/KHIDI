"use client";

import { useState, useEffect, useCallback } from "react";
import { Article } from "@/lib/types";

const STORAGE_KEY = "khidi_article_stack";
const LAST_CRAWLED_KEY = "khidi_last_crawled";

interface StoredData {
  articles: Article[];
  lastCrawled: string;
}

// 날짜순 정렬 함수 (훅 외부에 정의하여 의존성 문제 해결)
function sortArticlesByDate(items: Article[]): Article[] {
  return [...items].sort((a, b) => {
    // 날짜 형식: "2026.01.21" 또는 "2026-01-21"
    const dateA = a.date.replace(/\./g, "-");
    const dateB = b.date.replace(/\./g, "-");
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function useArticleStack(initialArticles: Article[] = []) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [lastCrawled, setLastCrawled] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedLastCrawled = localStorage.getItem(LAST_CRAWLED_KEY);

      if (stored) {
        const parsed: StoredData = JSON.parse(stored);
        if (parsed.articles && parsed.articles.length > 0) {
          // 날짜순 정렬 (최신순)
          const sorted = sortArticlesByDate(parsed.articles);
          setArticles(sorted);
        }
      }

      if (storedLastCrawled) {
        setLastCrawled(storedLastCrawled);
      }
    } catch (error) {
      console.error("Error loading article stack:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 날짜순 정렬 함수 (외부 함수를 래핑)
  const sortByDate = useCallback((items: Article[]): Article[] => {
    return sortArticlesByDate(items);
  }, []);

  // 새 기사 추가 (중복 제거 후 스택에 쌓기)
  const addArticles = useCallback((newArticles: Article[]) => {
    setArticles((prev) => {
      // 기존 기사 ID Set
      const existingIds = new Set(prev.map((a) => a.id));
      // 제목 기반 중복 제거 (ID가 다르더라도 같은 기사일 수 있음)
      const existingTitles = new Set(prev.map((a) => a.title.trim().toLowerCase()));

      // 중복되지 않은 새 기사만 필터링
      const uniqueNewArticles = newArticles.filter((article) => {
        const titleKey = article.title.trim().toLowerCase();
        return !existingIds.has(article.id) && !existingTitles.has(titleKey);
      });

      // 새 기사를 기존 기사와 병합
      const merged = [...prev, ...uniqueNewArticles];

      // 날짜순 정렬
      const sorted = sortArticlesByDate(merged);

      // localStorage에 저장
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ articles: sorted })
        );
      } catch (error) {
        console.error("Error saving article stack:", error);
      }

      return sorted;
    });

    // 마지막 크롤링 시간 업데이트
    const now = new Date().toLocaleString("ko-KR");
    setLastCrawled(now);
    try {
      localStorage.setItem(LAST_CRAWLED_KEY, now);
    } catch (error) {
      console.error("Error saving last crawled time:", error);
    }
  }, []);

  // 전체 기사 교체 (초기화용)
  const setAllArticles = useCallback((newArticles: Article[]) => {
    const sorted = sortArticlesByDate(newArticles);
    setArticles(sorted);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ articles: sorted })
      );
    } catch (error) {
      console.error("Error saving article stack:", error);
    }
  }, []);

  // 스택 초기화
  const clearStack = useCallback(() => {
    setArticles([]);
    setLastCrawled(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_CRAWLED_KEY);
    } catch (error) {
      console.error("Error clearing article stack:", error);
    }
  }, []);

  // 특정 기사 삭제
  const removeArticle = useCallback((articleId: string) => {
    setArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== articleId);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ articles: filtered })
        );
      } catch (error) {
        console.error("Error saving article stack:", error);
      }
      return filtered;
    });
  }, []);

  // 통계 정보
  const stats = {
    totalCount: articles.length,
    lastCrawled,
    hasData: articles.length > 0,
    isLoaded,
  };

  return {
    articles,
    addArticles,
    setAllArticles,
    clearStack,
    removeArticle,
    sortByDate,
    stats,
  };
}
