import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ParsedReceipt = {
  amountKRW: number | string;
  merchant: string;
  accountCategory: string; // enum 후보 텍스트
  date?: string; // YYYY-MM-DD 혹은 자유 형식
};

// Next/OpenAI SDK의 메시지 content 파트를 로컬 타입으로 정의해 any 사용을 피합니다.
type ImageUrlPart = { type: "image_url"; image_url: { url: string } };
type TextPart = { type: "text"; text: string };
type MessageContent = Array<TextPart | ImageUrlPart>;

type JsonResponseFormat = { type: "json_object" };

export async function parseReceiptFromImageDataUrl(imageDataUrl: string): Promise<ParsedReceipt> {
  const basePrompt = `영수증 이미지에서 다음 정보를 추출해 순수 JSON으로 반환하세요.\n규칙:\n- amountKRW: 최종 결제금액을 정수 KRW(쉼표/원 제거).\n- merchant: 상호명.\n- accountCategory: FOOD|TRANSPORT|GROCERIES|UTILITIES|ENTERTAINMENT|HEALTHCARE|EDUCATION|OTHER.\n- date: YYYY-MM-DD 형식. 보이면 yyyy-mm-dd 로 통일.\n최종 JSON 스키마:\n{\n  "amountKRW": number,\n  "merchant": string,\n  "accountCategory": string,\n  "date": string\n}`;

  async function callOnce(prompt: string) {
    const content: MessageContent = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ];
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a receipt parser. Return strict JSON only." },
        { role: "user", content },
      ],
      temperature: 0,
      response_format: { type: "json_object" } as JsonResponseFormat,
      max_tokens: 300,
    });
    const text = res.choices[0]?.message?.content?.trim() ?? "{}";
    return text;
  }

  // 재시도 로직: 기본 프롬프트 → 보강 프롬프트 → 매우 엄격 프롬프트
  const prompts = [
    basePrompt,
    basePrompt + "\n항상 JSON만 출력하고 키는 반드시 스키마와 일치할 것.",
    basePrompt + "\n아래 예시 형식을 그대로 따르세요: {\"amountKRW\": 12345, \"merchant\": \"가게명\", \"accountCategory\": \"FOOD\", \"date\": \"2025-01-01\"}",
  ];

  let lastError: unknown = null;
  for (const p of prompts) {
    try {
      const text = await callOnce(p);
      const obj = JSON.parse(text) as ParsedReceipt;
      // 후처리 보정
      const normalized: ParsedReceipt = {
        amountKRW: typeof obj.amountKRW === "string" ? Number((obj.amountKRW as string).replace(/[^0-9]/g, "")) : (obj.amountKRW ?? 0),
        merchant: (obj.merchant ?? "").toString().slice(0, 120),
        accountCategory: (obj.accountCategory ?? "OTHER").toString().toUpperCase(),
        date: normalizeDate(obj.date),
      };
      if (!Number.isFinite(normalized.amountKRW as number)) normalized.amountKRW = 0;
      return normalized;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError ?? new Error("Parse failed");
}

function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;
  // 다양한 날짜 표현을 YYYY-MM-DD로 정규화
  const onlyDigits = input.replace(/[^0-9]/g, "");
  if (onlyDigits.length >= 8) {
    const y = onlyDigits.slice(0, 4);
    const m = onlyDigits.slice(4, 6);
    const d = onlyDigits.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  // 실패 시 Date 파싱 시도
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return undefined;
}
