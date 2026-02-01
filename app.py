# -*- coding: utf-8 -*-
"""
KHIDI AI 채용 비서 대시보드
한국보건산업진흥원 취업 준비생을 위한 인바스켓 분석 도구
"""

import streamlit as st
import sqlite3
import requests
from bs4 import BeautifulSoup
import pdfplumber
import google.generativeai as genai
from datetime import datetime, timedelta
import os
import tempfile
import hashlib
import json
import re
from typing import Optional, List, Dict, Tuple

# ============================================================
# 설정 상수
# ============================================================
DB_PATH = "khidi_data.db"
PDF_CACHE_DIR = "pdf_cache"

KHIDI_URLS = {
    "보건산업브리프": "https://www.khidi.or.kr/board?menuId=MENU00085",
    "글로벌보건산업동향": "https://www.khidi.or.kr/board?menuId=MENU00949",
    "뉴스레터": "https://www.khidi.or.kr/board?menuId=MENU00094",
}

CATEGORIES = ["전체", "R&D 정책", "글로벌 진출", "규제/법령", "채용 분석"]

# ============================================================
# 데이터베이스 함수
# ============================================================
def init_database():
    """SQLite 데이터베이스 초기화 및 테이블 생성"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 브리핑 게시글 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS briefings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            source TEXT,
            category TEXT,
            url TEXT UNIQUE,
            pdf_url TEXT,
            content TEXT,
            ai_analysis TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 채용 공고 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recruitments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER,
            position TEXT,
            department TEXT,
            requirements TEXT,
            skills TEXT,
            hired_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    # 더미 채용 데이터 삽입
    insert_dummy_recruitment_data()

def insert_dummy_recruitment_data():
    """2021~2025년 모의 채용 데이터 삽입"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 이미 데이터가 있는지 확인
    cursor.execute("SELECT COUNT(*) FROM recruitments")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    dummy_data = [
        # 2021년
        (2021, "보건산업 정책연구원", "정책연구본부", "석사 이상, 보건정책 전공", "정책분석, 통계분석, 보고서 작성", 3),
        (2021, "R&D 사업관리", "R&D사업본부", "학사 이상, 이공계열", "사업관리, 예산편성, 성과평가", 5),
        (2021, "행정지원", "경영지원본부", "학사 이상", "문서관리, 회계, 인사", 2),

        # 2022년
        (2022, "바이오헬스 사업관리", "바이오헬스산업본부", "학사 이상, 생명과학/의공학", "임상시험 관리, 인허가 지원", 4),
        (2022, "글로벌 진출 지원", "해외사업본부", "학사 이상, 영어 능통", "해외시장 조사, 수출 지원", 3),
        (2022, "데이터 분석가", "정책연구본부", "석사 이상, 통계/데이터사이언스", "빅데이터 분석, AI 모델링", 2),

        # 2023년
        (2023, "디지털헬스케어 PM", "디지털헬스본부", "학사 이상, IT/의료 융합", "디지털치료제, AI의료기기 관리", 6),
        (2023, "규제혁신 전문가", "규제혁신팀", "학사 이상, 법학/보건학", "규제샌드박스, 인허가 컨설팅", 2),
        (2023, "의료기기 사업관리", "의료기기본부", "학사 이상, 의공학/기계공학", "의료기기 인증, 품질관리", 4),

        # 2024년
        (2024, "바이오의약품 PM", "바이오의약품본부", "석사 이상, 약학/생명과학", "바이오시밀러, 세포치료제 관리", 5),
        (2024, "AI 헬스케어 전문가", "디지털헬스본부", "석사 이상, AI/ML 전공", "AI 진단, 디지털바이오마커", 3),
        (2024, "글로벌 임상 지원", "해외사업본부", "학사 이상, 임상 경험자", "글로벌 임상시험, FDA/EMA 대응", 2),
        (2024, "ESG 경영 담당", "경영지원본부", "학사 이상", "ESG 전략, 지속가능경영 보고서", 1),

        # 2025년
        (2025, "첨단바이오 사업관리", "첨단바이오본부", "석사 이상, 유전체학/합성생물학", "유전자치료, mRNA 플랫폼", 4),
        (2025, "디지털치료제 PM", "디지털헬스본부", "학사 이상, SW/의료 융합", "DTx 인허가, 임상 설계", 3),
        (2025, "보건안보 전문가", "보건안보팀", "석사 이상, 공중보건/감염병", "팬데믹 대응, 백신 수급", 2),
        (2025, "메디컬 라이터", "정책연구본부", "석사 이상, 의학/약학", "보건산업 백서, 정책보고서", 2),
    ]

    cursor.executemany("""
        INSERT INTO recruitments (year, position, department, requirements, skills, hired_count)
        VALUES (?, ?, ?, ?, ?, ?)
    """, dummy_data)

    conn.commit()
    conn.close()

def save_briefing(title: str, source: str, category: str, url: str,
                  pdf_url: str = None, content: str = None, ai_analysis: str = None):
    """브리핑 데이터 저장"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT OR REPLACE INTO briefings
            (title, source, category, url, pdf_url, content, ai_analysis, crawled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, source, category, url, pdf_url, content, ai_analysis, datetime.now()))
        conn.commit()
    except Exception as e:
        st.error(f"DB 저장 오류: {e}")
    finally:
        conn.close()

def get_briefings(category: str = "전체", limit: int = 20) -> List[Dict]:
    """브리핑 데이터 조회"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if category == "전체":
        cursor.execute("""
            SELECT * FROM briefings
            ORDER BY crawled_at DESC LIMIT ?
        """, (limit,))
    else:
        cursor.execute("""
            SELECT * FROM briefings
            WHERE category = ?
            ORDER BY crawled_at DESC LIMIT ?
        """, (category, limit))

    columns = [desc[0] for desc in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

def get_recruitment_data() -> List[Dict]:
    """채용 데이터 조회"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recruitments ORDER BY year DESC, position")
    columns = [desc[0] for desc in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

# ============================================================
# 크롤러 함수
# ============================================================
def crawl_khidi_board(board_name: str, board_url: str, max_items: int = 5) -> List[Dict]:
    """KHIDI 게시판 크롤링"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        response = requests.get(board_url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        articles = []

        # KHIDI 게시판 구조에 맞게 파싱 (일반적인 게시판 구조)
        rows = soup.select('table tbody tr, .board-list li, .list-item')

        for row in rows[:max_items]:
            try:
                # 제목 추출
                title_elem = row.select_one('a, .title, .subject')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get('href', '')

                if link and not link.startswith('http'):
                    link = f"https://www.khidi.or.kr{link}"

                # 날짜 추출
                date_elem = row.select_one('.date, .regdate, td:last-child')
                date_str = date_elem.get_text(strip=True) if date_elem else ""

                articles.append({
                    "title": title,
                    "url": link,
                    "date": date_str,
                    "source": board_name
                })
            except Exception as e:
                continue

        return articles

    except Exception as e:
        st.warning(f"{board_name} 크롤링 실패: {e}")
        return []

def get_article_detail(url: str) -> Tuple[str, Optional[str]]:
    """게시글 상세 내용 및 PDF URL 추출"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # 본문 내용 추출
        content_elem = soup.select_one('.board-view-content, .content, .view-content, article')
        content = content_elem.get_text(strip=True) if content_elem else ""

        # PDF 링크 추출
        pdf_url = None
        for link in soup.select('a[href*=".pdf"], a[href*="download"]'):
            href = link.get('href', '')
            if '.pdf' in href.lower() or 'download' in href.lower():
                if not href.startswith('http'):
                    href = f"https://www.khidi.or.kr{href}"
                pdf_url = href
                break

        return content, pdf_url

    except Exception as e:
        return "", None

def download_and_extract_pdf(pdf_url: str) -> str:
    """PDF 다운로드 및 텍스트 추출"""
    if not pdf_url:
        return ""

    # 캐시 디렉토리 생성
    os.makedirs(PDF_CACHE_DIR, exist_ok=True)

    # URL 해시로 캐시 파일명 생성
    url_hash = hashlib.md5(pdf_url.encode()).hexdigest()
    cache_path = os.path.join(PDF_CACHE_DIR, f"{url_hash}.txt")

    # 캐시 확인
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return f.read()

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(pdf_url, headers=headers, timeout=30)

        if response.status_code != 200:
            return ""

        # 임시 파일에 PDF 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name

        # pdfplumber로 텍스트 추출
        text_content = []
        try:
            with pdfplumber.open(tmp_path) as pdf:
                for page in pdf.pages[:20]:  # 최대 20페이지만 처리
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
        finally:
            os.unlink(tmp_path)  # 임시 파일 삭제

        full_text = "\n".join(text_content)

        # 캐시에 저장
        with open(cache_path, 'w', encoding='utf-8') as f:
            f.write(full_text)

        return full_text

    except Exception as e:
        st.warning(f"PDF 처리 실패: {e}")
        return ""

# ============================================================
# AI 분석 함수 (Gemini API)
# ============================================================
def configure_gemini(api_key: str):
    """Gemini API 설정"""
    genai.configure(api_key=api_key)

def generate_inbasket_analysis(content: str, title: str, api_key: str) -> str:
    """인바스켓 형식의 AI 분석 생성"""
    if not api_key:
        return "⚠️ Gemini API 키가 설정되지 않았습니다."

    if not content or len(content) < 100:
        return "⚠️ 분석할 내용이 충분하지 않습니다."

    try:
        configure_gemini(api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # 콘텐츠가 너무 길면 앞부분만 사용
        if len(content) > 15000:
            content = content[:15000] + "\n...(이하 생략)"

        prompt = f"""
당신은 한국보건산업진흥원(KHIDI) R&D 사업지원부문 3년 차 주임입니다.
아래 보건산업 관련 자료를 읽고, 입사 시험인 '인바스켓(In-Basket)' 답안 형식으로 분석 보고서를 작성하세요.

[자료 제목]: {title}

[자료 내용]:
{content}

---

다음 형식으로 작성하세요:

## 📋 현황 및 배경
(산업 수치, 정책 기조, 시장 동향을 2-3문장으로 요약)

## ⚠️ 핵심 문제점
(규제 장벽, 인력 부족, 기술 격차 등 주요 갈등 요소를 불릿 포인트로 3개 내외 도출)

## 💡 대응 방안
### 단기 (6개월 이내)
(KHIDI 실무자 관점에서 즉시 실행 가능한 방안 2개)

### 중기 (1-2년)
(정책 제안 또는 사업 기획 관점의 방안 2개)

## 📈 기대 효과
### 정량적 성과
(수치로 표현 가능한 예상 성과)

### 정성적 성과
(질적 개선 효과)

---
답변은 한국어로 작성하고, 실제 KHIDI 직원이 작성한 것처럼 전문적이고 구체적으로 작성하세요.
"""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"⚠️ AI 분석 생성 실패: {e}"

def predict_future_jobs(api_key: str) -> str:
    """2026년 채용 유망 직무 예측"""
    if not api_key:
        return "⚠️ Gemini API 키가 설정되지 않았습니다."

    try:
        configure_gemini(api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = """
당신은 한국보건산업진흥원(KHIDI) 인사담당 전문가입니다.
2025년 보건산업 백서, 디지털헬스케어 정책 동향, 바이오헬스 산업 전략을 기반으로
2026년 KHIDI에서 신규 채용이 예상되는 유망 직무를 예측해주세요.

다음 형식으로 작성하세요:

## 🔮 2026년 KHIDI 유망 채용 직무 예측

### 1순위: [직무명]
- **예상 부서**:
- **필요 역량**:
- **채용 근거**: (어떤 정책/산업 트렌드 때문인지)

### 2순위: [직무명]
- **예상 부서**:
- **필요 역량**:
- **채용 근거**:

### 3순위: [직무명]
- **예상 부서**:
- **필요 역량**:
- **채용 근거**:

### 📚 취업 준비 TIP
(해당 직무 준비를 위한 구체적인 조언 3가지)

한국어로 작성하고, 실제 보건산업 트렌드를 반영하여 현실적으로 작성하세요.
"""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"⚠️ 예측 생성 실패: {e}"

def categorize_content(title: str, content: str) -> str:
    """콘텐츠 카테고리 자동 분류"""
    text = (title + " " + content).lower()

    if any(kw in text for kw in ['r&d', '연구개발', '기술개발', '연구비', '과제']):
        return "R&D 정책"
    elif any(kw in text for kw in ['글로벌', '해외', '수출', '진출', 'fda', 'ema', '국제']):
        return "글로벌 진출"
    elif any(kw in text for kw in ['규제', '법령', '인허가', '승인', '제도', '법률']):
        return "규제/법령"
    elif any(kw in text for kw in ['채용', '인재', '일자리', '취업', '고용']):
        return "채용 분석"
    else:
        return "R&D 정책"  # 기본값

# ============================================================
# 샘플 데이터 생성 (크롤링 실패 시 대체용)
# ============================================================
def get_sample_briefings() -> List[Dict]:
    """샘플 브리핑 데이터"""
    return [
        {
            "id": 1,
            "title": "2025년 바이오헬스 산업 글로벌 경쟁력 강화 전략",
            "source": "보건산업브리프",
            "category": "R&D 정책",
            "url": "https://www.khidi.or.kr/sample1",
            "content": """
            2025년 바이오헬스 산업은 글로벌 시장 규모 3조 달러를 돌파할 전망이다.
            한국은 바이오시밀러 분야에서 세계 2위의 시장 점유율을 기록하고 있으며,
            세포·유전자치료제 분야에서도 급성장하고 있다.

            주요 정책 방향:
            1. 바이오의약품 R&D 투자 확대 (연간 2조원 규모)
            2. 규제 샌드박스를 통한 신속 인허가 지원
            3. 글로벌 임상 네트워크 구축
            4. 바이오 인력 양성 프로그램 확대

            산업계 현황:
            - 국내 바이오기업 수: 1,200개 이상
            - 바이오헬스 수출액: 200억 달러 (전년 대비 15% 증가)
            - R&D 투자 비중: 매출 대비 평균 12%
            """,
            "ai_analysis": None,
            "crawled_at": datetime.now().isoformat()
        },
        {
            "id": 2,
            "title": "디지털치료제(DTx) 산업 동향 및 정책 과제",
            "source": "글로벌보건산업동향",
            "category": "R&D 정책",
            "url": "https://www.khidi.or.kr/sample2",
            "content": """
            디지털치료제(Digital Therapeutics)는 소프트웨어를 기반으로 질병을 예방,
            관리, 치료하는 새로운 의료 패러다임이다.

            글로벌 시장 현황:
            - 2025년 시장 규모: 89억 달러
            - 연평균 성장률: 25.4%
            - 주요 적용 분야: 정신건강, 당뇨관리, 호흡기질환

            국내 현황 및 과제:
            1. 국내 DTx 개발 기업: 50개 이상
            2. 임상시험 진행 중인 제품: 30개 이상
            3. 건강보험 급여 적용 논의 진행 중

            정책 제언:
            - DTx 전용 인허가 트랙 마련
            - 의료데이터 활용 규제 완화
            - 수가 체계 및 급여 기준 수립
            """,
            "ai_analysis": None,
            "crawled_at": datetime.now().isoformat()
        },
        {
            "id": 3,
            "title": "미국 FDA 의료기기 인허가 동향 분석",
            "source": "글로벌보건산업동향",
            "category": "글로벌 진출",
            "url": "https://www.khidi.or.kr/sample3",
            "content": """
            미국 FDA의 의료기기 인허가 정책 변화와 국내 기업의 대응 전략을 분석한다.

            FDA 주요 정책 변화:
            1. AI/ML 기반 의료기기 가이드라인 강화
            2. 사이버보안 요구사항 의무화
            3. Real-World Evidence 활용 확대
            4. 510(k) 심사 현대화 프로그램

            국내 기업 FDA 인허가 현황:
            - 2024년 FDA 승인 획득: 45건
            - 주요 승인 분야: 진단기기, AI 의료기기, 수술로봇

            진출 전략 제언:
            - 초기 단계부터 FDA 규제 고려한 개발
            - Pre-submission 미팅 적극 활용
            - 현지 RA 전문인력 확보
            """,
            "ai_analysis": None,
            "crawled_at": datetime.now().isoformat()
        },
        {
            "id": 4,
            "title": "의료기기 규제 샌드박스 운영 성과 및 개선 방향",
            "source": "보건산업브리프",
            "category": "규제/법령",
            "url": "https://www.khidi.or.kr/sample4",
            "content": """
            의료기기 규제 샌드박스는 혁신 의료기기의 신속한 시장 진입을 지원하는 제도이다.

            운영 성과 (2020-2024):
            - 신청 건수: 320건
            - 승인 건수: 180건 (승인률 56%)
            - 사업화 성공: 45건

            주요 승인 사례:
            1. AI 기반 의료영상 분석 소프트웨어
            2. 웨어러블 건강 모니터링 기기
            3. 원격의료 플랫폼

            개선 과제:
            - 심사 기간 단축 (현재 평균 6개월 → 3개월 목표)
            - 임시허가 후 정식허가 전환율 제고
            - 사후관리 체계 강화
            """,
            "ai_analysis": None,
            "crawled_at": datetime.now().isoformat()
        },
        {
            "id": 5,
            "title": "보건산업 인력 수급 전망 및 양성 전략",
            "source": "뉴스레터",
            "category": "채용 분석",
            "url": "https://www.khidi.or.kr/sample5",
            "content": """
            보건산업 분야의 인력 수급 현황과 미래 전망을 분석한다.

            현재 인력 현황:
            - 보건산업 종사자: 약 85만 명
            - 연평균 증가율: 4.2%
            - 인력 부족 분야: AI 헬스케어, 바이오 데이터, RA 전문가

            2026년 수요 전망:
            1. 디지털 헬스케어 전문가: 5,000명 추가 필요
            2. 바이오 데이터 사이언티스트: 2,000명 추가 필요
            3. 글로벌 RA 전문가: 1,500명 추가 필요

            인력 양성 전략:
            - 산학협력 프로그램 확대
            - 재직자 역량 강화 교육
            - 해외 우수 인력 유치
            """,
            "ai_analysis": None,
            "crawled_at": datetime.now().isoformat()
        }
    ]

# ============================================================
# Streamlit UI
# ============================================================
def main():
    st.set_page_config(
        page_title="KHIDI AI 채용 비서",
        page_icon="🏥",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # 커스텀 CSS
    st.markdown("""
    <style>
        .main-header {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1a365d;
            margin-bottom: 0.5rem;
        }
        .sub-header {
            font-size: 1rem;
            color: #4a5568;
            margin-bottom: 2rem;
        }
        .briefing-card {
            background-color: #f8fafc;
            border-left: 4px solid #3182ce;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-radius: 0 8px 8px 0;
        }
        .category-tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color: #e2e8f0;
            border-radius: 9999px;
            font-size: 0.75rem;
            color: #4a5568;
            margin-right: 0.5rem;
        }
        .analysis-box {
            background-color: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1rem;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }
        .stTabs [data-baseweb="tab"] {
            padding: 10px 20px;
            background-color: #f1f5f9;
            border-radius: 8px 8px 0 0;
        }
        .stTabs [aria-selected="true"] {
            background-color: #3182ce;
            color: white;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
        }
    </style>
    """, unsafe_allow_html=True)

    # 데이터베이스 초기화
    init_database()

    # ========== 사이드바 ==========
    with st.sidebar:
        st.image("https://www.khidi.or.kr/resources/images/common/logo.png", width=180)
        st.markdown("---")

        st.markdown("### ⚙️ 설정")

        # API 키 입력
        api_key = st.text_input(
            "Gemini API 키",
            type="password",
            help="Google AI Studio에서 발급받은 API 키를 입력하세요."
        )

        if api_key:
            st.success("✅ API 키가 설정되었습니다.")

        st.markdown("---")

        # 데이터 새로고침
        st.markdown("### 🔄 데이터 관리")

        if st.button("📥 최신 브리핑 수집", use_container_width=True):
            with st.spinner("KHIDI 웹사이트에서 데이터를 수집 중..."):
                collected = 0
                for board_name, board_url in KHIDI_URLS.items():
                    articles = crawl_khidi_board(board_name, board_url)
                    for article in articles:
                        content, pdf_url = get_article_detail(article['url'])

                        if pdf_url:
                            pdf_content = download_and_extract_pdf(pdf_url)
                            if pdf_content:
                                content = pdf_content

                        category = categorize_content(article['title'], content)

                        save_briefing(
                            title=article['title'],
                            source=board_name,
                            category=category,
                            url=article['url'],
                            pdf_url=pdf_url,
                            content=content[:5000] if content else None
                        )
                        collected += 1

                if collected > 0:
                    st.success(f"✅ {collected}개의 브리핑을 수집했습니다.")
                else:
                    st.info("새로운 브리핑이 없거나 크롤링에 실패했습니다. 샘플 데이터를 사용합니다.")

        if st.button("🗑️ 캐시 초기화", use_container_width=True):
            if os.path.exists(DB_PATH):
                os.remove(DB_PATH)
            if os.path.exists(PDF_CACHE_DIR):
                import shutil
                shutil.rmtree(PDF_CACHE_DIR)
            init_database()
            st.success("캐시가 초기화되었습니다.")
            st.rerun()

        st.markdown("---")
        st.markdown("### 📌 안내")
        st.info("""
        **KHIDI AI 채용 비서**는 한국보건산업진흥원
        취업 준비생을 위한 인바스켓 분석 도구입니다.

        - 최신 보건산업 동향을 자동 수집
        - AI가 인바스켓 답안 형식으로 분석
        - 채용 트렌드 및 유망 직무 예측
        """)

    # ========== 메인 콘텐츠 ==========
    st.markdown('<p class="main-header">🏥 KHIDI AI 채용 비서</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">한국보건산업진흥원 인바스켓 분석 대시보드</p>', unsafe_allow_html=True)

    # 오늘 날짜
    today = datetime.now().strftime("%Y년 %m월 %d일")
    st.markdown(f"**📅 {today}** 기준 브리핑")

    # 카테고리 탭
    tabs = st.tabs(CATEGORIES)

    for idx, tab in enumerate(tabs):
        category = CATEGORIES[idx]

        with tab:
            if category == "채용 분석":
                render_recruitment_tab(api_key)
            else:
                render_briefing_tab(category, api_key)

def render_briefing_tab(category: str, api_key: str):
    """브리핑 탭 렌더링"""

    # DB에서 데이터 조회
    briefings = get_briefings(category)

    # 데이터가 없으면 샘플 데이터 사용
    if not briefings:
        briefings = get_sample_briefings()
        if category != "전체":
            briefings = [b for b in briefings if b['category'] == category]

    if not briefings:
        st.info(f"'{category}' 카테고리에 해당하는 브리핑이 없습니다.")
        return

    for briefing in briefings:
        with st.container():
            st.markdown(f"""
            <div class="briefing-card">
                <span class="category-tag">{briefing.get('category', 'N/A')}</span>
                <span class="category-tag">{briefing.get('source', 'N/A')}</span>
                <h3 style="margin-top: 0.5rem; margin-bottom: 0.5rem;">{briefing['title']}</h3>
            </div>
            """, unsafe_allow_html=True)

            col1, col2 = st.columns([3, 1])

            with col1:
                # 원문 내용 표시
                content = briefing.get('content', '')
                if content:
                    with st.expander("📄 원문 보기", expanded=False):
                        st.markdown(content[:2000] + ("..." if len(content) > 2000 else ""))

            with col2:
                # AI 분석 버튼
                if st.button(f"🤖 AI 분석", key=f"analyze_{briefing.get('id', briefing['title'][:10])}"):
                    if not api_key:
                        st.warning("사이드바에서 Gemini API 키를 입력해주세요.")
                    else:
                        with st.spinner("AI가 인바스켓 형식으로 분석 중..."):
                            analysis = generate_inbasket_analysis(
                                content=briefing.get('content', briefing['title']),
                                title=briefing['title'],
                                api_key=api_key
                            )
                            st.session_state[f"analysis_{briefing['title']}"] = analysis

            # 저장된 분석 결과 표시
            if f"analysis_{briefing['title']}" in st.session_state:
                st.markdown("---")
                st.markdown("### 🎯 인바스켓 분석 결과")
                st.markdown(st.session_state[f"analysis_{briefing['title']}"])

            st.markdown("---")

def render_recruitment_tab(api_key: str):
    """채용 분석 탭 렌더링"""

    st.markdown("## 📊 KHIDI 채용 분석 아카이브")

    # 채용 데이터 조회
    recruitment_data = get_recruitment_data()

    # 연도별 통계
    col1, col2, col3, col4 = st.columns(4)

    years = [2022, 2023, 2024, 2025]
    for i, year in enumerate(years):
        year_data = [r for r in recruitment_data if r['year'] == year]
        total_hired = sum(r['hired_count'] for r in year_data)

        with [col1, col2, col3, col4][i]:
            st.metric(
                label=f"{year}년",
                value=f"{total_hired}명",
                delta=f"{len(year_data)}개 직무"
            )

    st.markdown("---")

    # 연도별 채용 상세
    st.markdown("### 📋 연도별 채용 현황 (2021-2025)")

    year_filter = st.selectbox("연도 선택", ["전체"] + list(range(2025, 2020, -1)))

    if year_filter == "전체":
        filtered_data = recruitment_data
    else:
        filtered_data = [r for r in recruitment_data if r['year'] == year_filter]

    if filtered_data:
        for data in filtered_data:
            with st.expander(f"**{data['year']}년 | {data['position']}** ({data['department']})"):
                st.markdown(f"""
                - **채용 인원**: {data['hired_count']}명
                - **자격 요건**: {data['requirements']}
                - **필요 역량**: {data['skills']}
                """)

    st.markdown("---")

    # 2026년 유망 직무 예측
    st.markdown("### 🔮 2026년 유망 채용 직무 예측")

    if st.button("🚀 AI 예측 생성", use_container_width=True):
        if not api_key:
            st.warning("사이드바에서 Gemini API 키를 입력해주세요.")
        else:
            with st.spinner("AI가 2026년 채용 트렌드를 분석 중..."):
                prediction = predict_future_jobs(api_key)
                st.session_state["job_prediction"] = prediction

    if "job_prediction" in st.session_state:
        st.markdown(st.session_state["job_prediction"])
    else:
        st.info("""
        **예측 기반 키워드**: 2025 보건산업 백서, 디지털헬스케어 육성전략,
        바이오헬스 산업 혁신전략, 의료기기 산업 발전 방안

        'AI 예측 생성' 버튼을 클릭하여 2026년 유망 직무를 확인하세요.
        """)

    st.markdown("---")

    # 직무별 트렌드 시각화
    st.markdown("### 📈 직무별 채용 트렌드")

    # 간단한 차트 데이터
    import pandas as pd

    trend_data = {
        "연도": [2021, 2022, 2023, 2024, 2025],
        "R&D 사업관리": [5, 4, 4, 5, 4],
        "디지털헬스": [0, 2, 6, 3, 3],
        "글로벌진출": [0, 3, 0, 2, 0],
        "정책연구": [3, 2, 0, 0, 2],
    }

    df = pd.DataFrame(trend_data)
    df_melted = df.melt(id_vars=["연도"], var_name="직무", value_name="채용인원")

    st.bar_chart(df.set_index("연도"))

if __name__ == "__main__":
    main()
