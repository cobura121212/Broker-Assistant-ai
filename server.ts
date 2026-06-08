import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up bodies with elevated limits for OCR snap uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper: Ensure the initial db contains realistic real estate data
function getInitialDb() {
  const today = new Date().toISOString().split('T')[0];
  // Calculate relative dates for schedules
  const dateIn3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateIn30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateIn15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    customers: [
      {
        id: "c1",
        name: "김철수",
        phone: "010-1234-5678",
        interestedArea: "분당 정자동",
        budget: "12억 선",
        type: "매수",
        status: "대기",
        notes: "분당 정자동 한솔마을 or 까치마을 아파트 매매 희망. 7월 말 이주 예정이며 남향이 최우선 조건.",
        aiSummary: "분당 정자동 아파트 매수 희망, 예산 12억 원 선, 남향 로얄동, 7월 말 입주 일정 조율 중",
        createdAt: today
      },
      {
        id: "c2",
        name: "이영희",
        phone: "010-8765-4321",
        interestedArea: "판교역 인근 상가",
        budget: "보증금 5,000 / 월 350만",
        type: "임차",
        status: "미팅",
        notes: "디저트 브런치 까페 소형 점포 희망. 유동인구 많고 테라스 데크 활용 가능한 부지를 원함.",
        aiSummary: "판교 상가 임차 희망, 보증금 5,000 / 월 350만 원선, 디저트 가맹점 용도, 유동 테라스 필수",
        createdAt: today
      },
      {
        id: "c3",
        name: "박민수",
        phone: "010-5555-4444",
        interestedArea: "성남시 분당구 구미동",
        budget: "10억 수준",
        type: "임대",
        status: "진행",
        notes: "본인 소유 대단지 전세 물건 등록 의뢰. 화장실 주방 올수리 마쳤음. 신혼부부 선호.",
        aiSummary: "분당 구미동 소유 아파트 임대 의뢰, 예산 10억 선, 친환경 가구 및 욕실 리모델링 완료",
        createdAt: today
      }
    ],
    properties: [
      {
        id: "p1",
        address: "경기도 성남시 분당구 정자동 112 정자한솔마을 3단지 304동 1205호",
        price: "11억 8,000만 원",
        pyeong: "32평 (전용 84㎡)",
        images: [],
        notes: "화장실 포함 풀인테리어 상태 최상. 남향 배치로 종일 일조권 탁월, 탄천 조망 가능. 즉시 입주 협의 가능.",
        marketingAds: {
          naver: "[정자한솔 3단지] 탄천 인접 특수 인테리어 세대! 남향 배치 완벽한 채광, 단지 내 초등학교 최인접 학세권 매물.",
          blog: "★분당 정자동 한솔마을 32평 최고급 매물 안내★\n안녕하세요. (주) 센추리21 부동산 중개법인입니다. 오늘 소개해 드리는 매물은 정자동 한솔마을 3단지의 최상급 남향 매물입니다. 방 3개, 욕실 2개의 32평 정형 판상형 구조로, 정남향이라 겨울에도 훈훈하고 탁 트인 탄천변이 근접합니다. 화장실을 포함해 고급 실크벽지 및 한샘 부엌 구조로 풀수리되었습니다. 자세한 동호수 문의 및 임장은 빠르게 예약해 주세요!",
          sms: "[센추리21] 정자동 한솔3단지 32평 매매 11.8억. 탄천 조망 최고급 인테리어 완비, 즉시 입주 가을 이사 적극 추천. 상세 확인은 언제든 연락 바랍니다."
        },
        createdAt: today
      },
      {
        id: "p2",
        address: "경기도 성남시 분당구 삼평동 618 판교역 벤처타운 상가 1층 103호",
        price: "보증금 5,000 / 월 320만 원",
        pyeong: "15평 (전용 49㎡)",
        images: [],
        notes: "판교역 도보 5분 거리. 전면 데크 확장 완비되어 테라스형 카페, 요식업종 입점 적극 권장. 권리금 없음.",
        marketingAds: {
          naver: "[판교역 1층 최고자리] 전면 보행자통로 광장 연접 데크 서비스 면적 양호, 요식업, 디저트, 카페 권리금 무권리 입점 찬스!",
          blog: "[센추리21 공식추천] 판교 벤처 오피스 타운 초핵심 1층 상가 임대\n상가 중개 전문 (주) 센추리21 부동산 중개법인입니다. 판교역 중심 상권 보행자 전용 도로와 마주한 1층 15평 무권리 상가입니다. 직장인 점심/저녁 동선 초입에 입지하여 항시 유동인구가 집중되는 골든 블럭입니다. 테라스 데크 기본 시공 완료되어 추가 공간 활용도가 높습니다. 추천 업종 : 베이커리 카페, 에스프레소 바, 수제 맥주 전문점.",
          sms: "[센추리21] 판교 1층 테라스 상가 무권리 임대 보5,000/월320만. 15평(데크 별도), 즉시 양수 가능. 성공 창업을 보장합니다."
        },
        createdAt: today
      }
    ],
    schedules: [
      {
        id: "s1",
        customerId: "c1",
        customerName: "김철수",
        title: "한솔마을 3단지 정식 계약 체결일",
        date: dateIn3Days,
        type: "계약일",
        completed: false,
        notes: "준비물: 인감도장, 신분증, 주민등록등본. 센추리 세미나실 예약 오전 11:00"
      },
      {
        id: "s2",
        customerId: "c2",
        customerName: "이영희",
        title: "판교 점포 가계약서 중도금 송금 기일",
        date: dateIn15Days,
        type: "중도금일",
        completed: false,
        notes: "임대차 약정 신탁 계좌 정합성 확인 필수"
      },
      {
        id: "s3",
        customerName: "박민수",
        title: "구미동 전세 보증금 최종 만기 기일",
        date: dateIn30Days,
        type: "만기일",
        completed: false,
        notes: "기존 임차인 보증금 반환 일정 연계 크로스 체크"
      }
    ],
    smsLogs: [
      {
        id: "sms1",
        recipientName: "김철수",
        recipientPhone: "010-1234-5678",
        category: "계약1주년",
        message: "안녕하십니까, (주) 센추리21 부동산 중개법인 소속 공인중개사입니다. 분당 정자동 새 보금자리에 입주하신 지 어느덧 1주년이 되셨습니다. 불편함 없이 행복한 생활 되시길 진심으로 성원합니다.",
        sentAt: today + " 10:00:00",
        status: "sent"
      }
    ]
  };
}

// Ensure database load & write handles correctly
function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    const data = getInitialDb();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write initial DB file to disk (might be on stateless/read-only filesystem):", e);
    }
    return data;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    const data = getInitialDb();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write fallback DB file to disk:", e);
    }
    return data;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write DB file to disk (might be on stateless/read-only filesystem):", err);
  }
}

// GET DB
app.get("/api/db", (req, res) => {
  res.json(getDb());
});

// POST DB (Save full state)
app.post("/api/db", (req, res) => {
  try {
    writeDb(req.body);
    res.json({ success: true, message: "DB 저장 성공" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Return null or handle gracefully rather than hard-crashing on load
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. CRM Counsel Notes Auto Summary
app.post("/api/ai/counsel-summary", async (req, res) => {
  const { notes } = req.body;
  if (!notes) {
    return res.status(400).json({ error: "상담 내용을 입력해주세요." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      summary: `[데모 모드 요약] ${notes.substring(0, 40)}... (API 키 미설정 상태)`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `공인중개사가 고객과 통화한 전사 텍스트 또는 수기 상담 내용입니다. 이를 공인중개사가 고객 조건 장부에 신속히 대조 및 입력할 수 있도록 깔끔하게 '한 줄 요약'해 주세요. 반드시 25자 이내의 명료하고 핵심적인 한국어 경어식 어조로 출력해 주세요.
상담내용:
"${notes}"`,
    });
    res.json({ summary: response.text?.trim() || "상담 요약이 진행되지 않았습니다." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Property Ads copywriting (3 segments: naver, blog, sms)
app.post("/api/ai/copywriting", async (req, res) => {
  const { address, price, pyeong, notes } = req.body;
  
  const ai = getGeminiClient();
  const title = `[센추리21 공식 전산] ${address} - ${pyeong}`;

  if (!ai) {
    // Elegant fallbacks
    return res.json({
      naver: `[네이버용 광고] 무권리/역세권 최적 매칭! ${address} 인접 조망 우수. 세부 문의 (주) 센추리21`,
      blog: `★(주) 센추리21 추천매물★\n\n위치: ${address}\n평수/가격: ${pyeong} / ${price}\n특징: ${notes || "채광 양호, 교통편 우수"}\n\n저희 센추리21 중개법인은 오직 완벽하게 확인된 신뢰하는 매물만을 알선해드립니다. 신속히 임장 예약해 주십시오.`,
      sms: `[센추리21] ${pyeong} 매매/임대 ${price}. 즉시 입주, 최고 주거권 보장. 예약제 임장 개시.`
    });
  }

  try {
    const prompt = `당신은 '(주) 센추리21 부동산 중개법인' 소속 공인중개사의 업무를 보좌하는 카피라이팅 전문가입니다. 
다음 공급 매물 정보를 토대로 네이버 부동산용 간단 소개, 공식 블로그 상세 소개, 가망고객용 발송용 SMS 광고 문안까지 총 3가지 채널 문구를 품격 있는 어조로 생성해 주세요.
반드시 아래 JSON 스키마를 준수하여 출력해야 하며, 다른 텍스트는 섞지 마십시오.

매물정보:
- 주소: ${address}
- 희망가: ${price}
- 평형/면적: ${pyeong}
- 특이사항/설명: ${notes}

출력 문장에 '센추리21 부동산 중개법인'을 신뢰성 있게 명시해 주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            naver: { type: Type.STRING, description: "네이버 부동산 소개글 (70자 내외)" },
            blog: { type: Type.STRING, description: "블로그 홍보용 깊이 있는 포스트글 (300자 내외)" },
            sms: { type: Type.STRING, description: "고객에게 전송할 핵심 문자 광고글 (100자 내외)" }
          },
          required: ["naver", "blog", "sms"]
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch {
      res.json({
        naver: response.text?.substring(0, 100) || "",
        blog: response.text || "",
        sms: response.text?.substring(0, 80) || ""
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Card OCR to Register Customer (Extract name, company, phone, email)
app.post("/api/ai/card-ocr", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "명함 이미지가 전송되지 않았습니다." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Demonstration mock-up response
    return res.json({
      name: "홍길동",
      company: "센추리21 파트너스 기술팀",
      phone: "010-9999-8888",
      email: "partner@century21.co.kr",
      interestedArea: "서울 전역 주거 투자",
      notes: "명함 OCR 데모 파싱 결과 (API 키 부재로 가상 데이터 노출)"
    });
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
      }
    };
    const textPart = {
      text: `이 명함 이미지에서 성함(name), 회사/상호(company), 연락처(phone), 이메일 주소(email)를 추출해 깔끔한 JSON 형식으로 바인딩해 주세요.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            company: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING }
          },
          required: ["name", "phone"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Contract OCR & Date Auto-extraction
app.post("/api/ai/contract-ocr", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "계약서 이미지가 제공되지 않았습니다." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallbackDateIn5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fallbackDateIn20Days = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return res.json({
      address: "서울 특별시 강남구 삼성동 144-24 센추리 하우스",
      deposit: "보증금 1억 원",
      intermediatePayment: "3,000만 원 (일정: 2026-06-25)",
      balancePayment: "7,000만 원 (기한: 2026-07-15)",
      contractPeriod: "24개월 (만기: 2028-06-15)",
      schedules: [
        { title: "삼성동 센추리 하우스 잔금 납부일", date: fallbackDateIn20Days, type: "잔금일" },
        { title: "삼성동 센추리 하우스 중도 보충일", date: fallbackDateIn5Days, type: "중도금일" }
      ]
    });
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
      }
    };
    const textPart = {
      text: `이 부동산 임대차/매매 계약서 이미지에서 다음 세부 정보를 명확히 판독하여 JSON 형식으로 추출해 주십시오.
1. 소재지 주소 (address)
2. 보증금/매매가 (deposit)
3. 중도금 납부일 및 액수 설명 (intermediatePayment)
4. 잔금 지급일 (balancePayment - YYYY-MM-DD 기입 요구)
5. 만기일/계약기간 설명 (contractPeriod - YYYY-MM-DD 만기 요구)

동시에 일정 관리를 위해 잔금일 및 중도금일을 자동으로 캘린더에 기입할 수 있도록 schedules 배열을 반환해 주십시오.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            address: { type: Type.STRING },
            deposit: { type: Type.STRING },
            intermediatePayment: { type: Type.STRING },
            balancePayment: { type: Type.STRING },
            contractPeriod: { type: Type.STRING },
            schedules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  date: { type: Type.STRING, description: "YYYY-MM-DD 형식의 날짜" },
                  type: { type: Type.STRING, description: "'계약일', '중도금일', '잔금일', '만기일' 중 필수 매핑" }
                },
                required: ["title", "date", "type"]
              }
            }
          },
          required: ["address", "deposit"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Legal Adviser Interactive chat (System persona set: (주) 센추리21 부동산 Expert assistant)
app.post("/api/ai/legal", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "대화형 메시지 배열을 포맷 전송해주세요." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      text: "개업공인중개사 직무 법령 안내 데모 답변입니다: 주택임대차보호법 제6조의3(계약갱신 요구 등)에 따라, 임차인은 임대차기간이 끝나기 6개월 전부터 2개월 전까지의 기간에 계약갱신 요구권을 행사할 수 있으며, 임대인은 정당한 사유(직계존비속 실거주 등) 없이 거절하지 못합니다. 상가임대차의 경우 차임연체액이 3기의 차임액에 달하는 때 계약 해지가 성립됩니다. 상세한 AI 분석을 위해서는 Secrets panel에 GEMINI_API_KEY를 구성해 주십시오."
    });
  }

  try {
    // Standard system instruction setting
    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "ai" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages.map((m: any) => `${m.sender === "ai" ? "AI 법률 비서" : "공인중개사"}: ${m.text}`).join("\n"),
      config: {
        systemInstruction: `당신은 대한민국 대표 신뢰 브랜드인 '(주) 센추리21 부동산 중개법인' 소속 공인중개사의 신속하고 안전한 실무 처리를 적극적으로 영양 보급하는 부동산 법률 전문 상담 비서입니다.
주요 기밀 사안: 주택/상가 건물 임대차보호법, 부동산거래신고법, 분쟁 조정 사례, 권리금 가액 산정 및 대법원 최신 미출판 판결 규정 선례 등에 입각하여 정확하고 보수적으로 조언합니다.
어조: 개업 공인중개사를 극진히 대우하듯, 매우 신뢰감 있고 기품 넘치며 공손한 한국어 한자어 및 전문 용어를 섞은 존칭 어휘로 일관되게 답해 주십시오.`,
        temperature: 0.2
      }
    });

    res.json({ text: response.text || "죄송합니다. 법률 자문을 도출하지 못했습니다." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite & Static Assets serving
async function startServer() {
  if (process.env.NETLIFY) {
    console.log("NETLIFY build/run detected. Skipping server.listen() in server.ts");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

export { app };
