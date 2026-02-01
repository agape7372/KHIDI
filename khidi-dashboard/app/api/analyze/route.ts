import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 모델명
const GEMINI_MODEL = "gemini-2.5-flash";

// 채용정보 분석 프롬프트
function getJobPostingPrompt(title: string, content: string): string {
  return `당신은 한국보건산업진흥원(KHIDI) 채용에 지원하려는 취업준비생을 돕는 취업 컨설턴트입니다.
아래 채용공고를 분석하여 지원 준비에 필요한 핵심 정보를 정리해주세요.

[채용공고 제목]: ${title}

[채용공고 내용]:
${content.slice(0, 10000)}

---

## 📋 채용 개요
| 항목 | 내용 |
|------|------|
| 채용 직무 | (직무명) |
| 채용 인원 | (명) |
| 고용 형태 | (정규직/계약직/인턴 등) |
| 근무 지역 | (지역) |
| 접수 기간 | (기간) |

## ✅ 지원 자격
### 필수 요건
- (학력, 전공, 경력 등)

### 우대 사항
- (자격증, 경험, 역량 등)

## 📝 전형 절차
1. (1단계)
2. (2단계)
3. (3단계)

## 💼 주요 업무
- (담당하게 될 업무 내용)

## 🎯 합격 준비 전략

### 서류 전형 TIP
- (자기소개서/이력서 작성 팁)

### 면접 준비 TIP
- (예상 질문 및 준비 방법)

### 이 직무에서 원하는 인재상
- (채용공고에서 파악되는 핵심 역량)

---
한국어로 작성하고, 채용공고에 명시된 내용을 기반으로 정확하게 작성하세요.
공고에 없는 정보는 "공고 확인 필요"로 표시하세요.`;
}

// 인바스켓(브리핑) 분석 프롬프트
function getInBasketPrompt(title: string, content: string): string {
  return `당신은 한국보건산업진흥원(KHIDI) 입사 시험 '인바스켓(In-Basket)'을 준비하는 수험생입니다.
아래 보건산업 관련 자료를 꼼꼼히 읽고, 실제 시험에서 고득점을 받을 수 있는 답안을 작성하세요.

[자료 제목]: ${title}

[자료 내용]:
${content.slice(0, 10000)}

---

## 파트1: 브리핑 분석

### 📋 현황 및 배경
자료에서 핵심 수치와 현황을 2-3문장으로 요약하세요.

### ⚠️ 핵심 문제점
자료를 바탕으로 도출할 수 있는 문제점 3가지를 불릿(-) 형식으로 작성하세요.

### 💡 대응 방안
#### 단기
- 즉시 실행 가능한 방안 2개
#### 중기
- 체계 구축을 위한 방안 2개

### 📈 기대 효과
#### 정량적 성과
- 수치로 표현 가능한 예상 성과
#### 정성적 성과
- 질적 개선 효과

---

## 파트2: 기획안 답안

### ◎ 사업 개요
- 사업명: [자료 주제를 바탕으로 사업명 작성]

### ◎ 추진 배경
- [자료에서 도출한 현황과 필요성 3가지를 불릿으로 작성]

### ◎ 추진 목적
- [정량적 목표 1개]
- [정성적 목표 1개]

### ◎ 문제점
- [자료에서 도출한 문제점 3가지를 불릿으로 작성]

### ◎ 해결방안
- 단기: [즉시 실행 가능한 방안]
- 중기: [제도/체계 정비 방안]
- 장기: [지속가능한 시스템 구축 방안]

### ◎ 사업 내용
- [세부 추진 과제 3가지를 불릿으로 작성]

---
답변은 한국어로 작성하고, 실제 KHIDI 직원이 작성한 것처럼 전문적이고 구체적으로 작성하세요.
불릿 포인트는 반드시 "-"로 시작하세요.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, apiKey: clientApiKey, category, layer } = body;

    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API 키가 필요합니다. 설정에서 API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!content || content.length < 50) {
      return NextResponse.json(
        { success: false, error: `분석할 내용이 충분하지 않습니다. (현재: ${content?.length || 0}자, 최소: 50자)` },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: 8192,
      },
    });

    // 채용정보인 경우 별도 프롬프트 사용
    const isJobPosting = layer === "채용정보" || category === "채용분석";
    const prompt = isJobPosting
      ? getJobPostingPrompt(title, content)
      : getInBasketPrompt(title, content);

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      return NextResponse.json(
        { success: false, error: "AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    const analysis = response.text();

    if (!analysis || analysis.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "AI가 빈 응답을 반환했습니다. 다른 내용으로 시도해주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      analyzedAt: new Date().toISOString(),
      type: isJobPosting ? "job" : "briefing",
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("api key") || msg.includes("api_key") || msg.includes("unauthorized")) {
        return NextResponse.json(
          { success: false, error: "API 키가 유효하지 않습니다. 설정에서 키를 확인해주세요." },
          { status: 401 }
        );
      }

      if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource exhausted")) {
        return NextResponse.json(
          { success: false, error: "API 사용량 한도에 도달했습니다. 1분 후 다시 시도해주세요." },
          { status: 429 }
        );
      }

      if (msg.includes("not found") || msg.includes("404")) {
        return NextResponse.json(
          { success: false, error: "AI 모델을 찾을 수 없습니다. 관리자에게 문의해주세요." },
          { status: 404 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { success: false, error: `AI 분석 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// 2026년 유망 직무 예측 API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientApiKey = searchParams.get("apiKey");

  const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Gemini API 키가 필요합니다. 설정에서 API 키를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: 4096,
      },
    });

    const prompt = `당신은 한국보건산업진흥원(KHIDI) 인사담당 전문가입니다.
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

한국어로 작성하고, 실제 보건산업 트렌드를 반영하여 현실적으로 작성하세요.`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      return NextResponse.json(
        { success: false, error: "AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    const prediction = response.text();

    if (!prediction || prediction.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "AI가 빈 응답을 반환했습니다. 다시 시도해주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Prediction error:", error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("quota") || msg.includes("rate limit")) {
        return NextResponse.json(
          { success: false, error: "API 사용량 한도에 도달했습니다. 1분 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { success: false, error: `예측 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
