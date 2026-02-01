import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Edge Runtime 사용 (Vercel 서버 IP 차단 우회)
export const runtime = "edge";

// KHIDI 게시판 URL
const KHIDI_BOARDS = {
  "보건산업브리프": "https://www.khidi.or.kr/board?menuId=MENU00085",
  "글로벌보건산업동향": "https://www.khidi.or.kr/board?menuId=MENU00949",
  "뉴스레터": "https://www.khidi.or.kr/board?menuId=MENU00094",
};

interface CrawledArticle {
  id: string;
  title: string;
  date: string;
  url: string;
  source: string;
  content?: string;
  pdfUrl?: string;
}

// 게시판 크롤링
async function crawlBoard(boardName: string, boardUrl: string): Promise<CrawledArticle[]> {
  try {
    const response = await fetch(boardUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${boardName}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: CrawledArticle[] = [];

    // KHIDI 게시판: table 구조 (번호, 분류, 제목, 등록일, 조회수, 첨부)
    $("table tbody tr").each((index, element) => {
      if (index >= 10) return; // 최대 10개만

      const $row = $(element);
      const $cells = $row.find("td");

      // 최소 4개 이상의 셀이 있어야 유효한 행
      if ($cells.length < 4) return;

      // 제목은 보통 3번째 셀(index 2)에 있음
      const $titleCell = $cells.eq(2);
      const $titleLink = $titleCell.find("a").first();
      const title = $titleLink.text().trim();

      if (!title || title.length < 2) return;

      let link = $titleLink.attr("href") || "";
      if (link && !link.startsWith("http")) {
        link = `https://www.khidi.or.kr${link}`;
      }

      // 날짜는 4번째 셀(index 3)
      const dateText = $cells.eq(3).text().trim();
      const dateMatch = dateText.match(/\d{4}[-./]\d{2}[-./]\d{2}/) ||
                       dateText.match(/\d{2}[-./]\d{2}[-./]\d{2}/);
      const date = dateMatch ? dateMatch[0].replace(/-/g, ".") : new Date().toISOString().slice(0, 10).replace(/-/g, ".");

      articles.push({
        id: `${boardName}-${index}-${Date.now()}`,
        title,
        date,
        url: link,
        source: boardName,
      });
    });

    return articles;
  } catch (error) {
    console.error(`Error crawling ${boardName}:`, error);
    return [];
  }
}

// 게시글 상세 내용 크롤링
async function crawlArticleDetail(url: string): Promise<{ content: string; pdfUrl?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return { content: "" };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 본문 내용 추출
    const contentSelectors = [
      ".board-view-content",
      ".view-content",
      ".bbs-view-content",
      ".content",
      "article",
      ".post-content",
    ];

    let content = "";
    for (const selector of contentSelectors) {
      const $content = $(selector);
      if ($content.length) {
        content = $content.text().trim();
        break;
      }
    }

    // PDF 링크 추출
    let pdfUrl: string | undefined;
    $('a[href*=".pdf"], a[href*="download"], a[href*="fileDown"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        pdfUrl = href.startsWith("http") ? href : `https://www.khidi.or.kr${href}`;
        return false; // 첫 번째만
      }
    });

    return { content: content.slice(0, 5000), pdfUrl };
  } catch (error) {
    console.error("Error crawling article detail:", error);
    return { content: "" };
  }
}

// 카테고리 자동 분류
function categorizeArticle(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();

  if (/r&d|연구개발|기술개발|연구비|과제/.test(text)) return "R&D정책";
  if (/글로벌|해외|수출|진출|fda|ema|국제/.test(text)) return "글로벌진출";
  if (/규제|법령|인허가|승인|제도|법률/.test(text)) return "규제인허가";
  if (/채용|인재|일자리|취업|고용/.test(text)) return "채용분석";
  if (/디지털|ai|인공지능|빅데이터|dtx/.test(text)) return "디지털헬스케어";
  if (/의료기기|기기|진단/.test(text)) return "의료기기";
  if (/바이오|제약|의약품|백신/.test(text)) return "바이오헬스";

  return "산업동향";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const withDetail = searchParams.get("detail") === "true";

  try {
    const allArticles: CrawledArticle[] = [];

    // 모든 게시판 크롤링
    for (const [boardName, boardUrl] of Object.entries(KHIDI_BOARDS)) {
      const articles = await crawlBoard(boardName, boardUrl);
      allArticles.push(...articles);
    }

    // 상세 내용 크롤링 (옵션)
    if (withDetail && allArticles.length > 0) {
      for (const article of allArticles.slice(0, 5)) { // 처음 5개만
        const detail = await crawlArticleDetail(article.url);
        article.content = detail.content;
        article.pdfUrl = detail.pdfUrl;
      }
    }

    // 결과를 Article 형식으로 변환
    const formattedArticles = allArticles.map((article, index) => {
      const category = categorizeArticle(article.title, article.content || "");
      return {
        id: article.id,
        source: article.source === "보건산업브리프" ? "KHIDI" :
                article.source === "글로벌보건산업동향" ? "KHIDI" : "KHIDI",
        date: article.date,
        title: article.title,
        summary: article.content?.slice(0, 200) || "내용을 불러오는 중...",
        link: article.url,
        isNew: index < 3,
        category, // 최상위 레벨에도 카테고리 추가
        content: article.content, // 전체 내용 추가
        pdfUrl: article.pdfUrl,
        tags: {
          type: "브리핑",
          category,
          layer: article.source,
          region: "국내",
          source: "KHIDI",
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedArticles.length,
      articles: formattedArticles,
      crawledAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { success: false, error: "크롤링 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
