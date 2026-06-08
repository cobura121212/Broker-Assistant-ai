import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  Send, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  HelpCircle as QuestionIcon,
  BookMarked,
  ArrowRight,
  Info,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { ChatMessage } from '../types';

interface LegalAdviserProps {
  // We can track temporary session chat messages in react component state
}

export function LegalAdviser({}: LegalAdviserProps) {
  // Preconfigured broker expert guidelines (FAQ)
  const faqList = [
    {
      id: "faq1",
      title: "계약 해지 시 중개보수 분쟁 (수수료 청구 성사 여부)",
      content: "공인중개사법 제32조에 따라, 공인중개사의 고의나 과실 없이 거래당사자 간의 이행 지체나 단순 파기로 계약이 해지된 경우에도 공인중개사는 중개보수 청구권을 상실하지 않습니다. 실무 약정서에 '계약 성립 시 복비를 지급하며, 계약 파기 시에도 반환하지 않는다'는 합의 동의를 명시하는 것이 분쟁 예방에 가장 유리합니다."
    },
    {
      id: "faq2",
      title: "상가임대차 구속 수칙 (3기 차임 연체와 강제 해지)",
      content: "상가건물 임대차보호법 제10조의8에 의거, 임차인의 차임연체액이 '3기의 차임액' 즉 연속 3달이 아니더라도 누적 미납 월세가 3개월 치에 달하는 순간 임대인은 즉시 임대차 계약 해지를 통고하고 명도 청구를 개시할 수 있습니다. 권리금 회수 기회 보호 조항 또한 박탈됩니다."
    },
    {
      id: "faq3",
      title: "임대차 5% 상한제 및 갱신청구 조율 수칙",
      content: "주택임대차보호법상 임차인은 임대차 계약 전과 전의 사이 기간 내 1회에 한해 계약갱신요구권을 행사할 수 있으며, 이 경우 차임과 보증금은 기존 5% 상한을 초과하여 늘릴 수 없습니다. 단, 임차인과 사전에 구두 서신 합의로 5%를 초과 증액 신규 합의를 도출해 계약을 다시 체결한 경우는 갱신권이 보존된 상태로 해석합니다."
    },
    {
      id: "faq4",
      title: "가계약금만 불송금 후 임차인 파기 시 배액배상 표준",
      content: "대법원 2014다231378 판례에 의거, 단순 가계약이라 할지라도 목적물, 매매대금, 중도금 지급 기한 등 본계약의 중요 핵심 사항이 합의된 상태에서 파기하는 경우, 해약금의 기준은 실 수납한 가계약금이 아니라 '당초 본계약 합의서 상 약정한 총 위약금/해약금'을 기준으로 반환 및 청구 배액 배상을 원칙으로 판시하고 있습니다."
    },
    {
      id: "faq5",
      title: "선순위 근저당 융자 존재 담보물 안전 보장 임시 특약 가이드",
      content: "보증금 회수 불능 위험(깡통전세 위험)을 예방하기 위해 약정서에 다음과 같은 명문 수식을 반드시 주입하십시오: '임대인은 잔금 수령과 동시에 선순위 근저당 말소 등기 접수를 이행하며 이에 동의하는 영수 증빙을 첨부해야 함. 위반 시 본 임대차 계약은 즉시 해제되며 임대인은 보증금 전액 배출 및 위약 책임을 지님.'"
    }
  ];

  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // Chat message system
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init1",
      sender: "ai",
      text: "안녕하십니까, (주) 센추리21 부동산 중개법인 가이드 전문 '실무 법령 자문 비서 AI'입니다. 실무 현장에서 돌발하는 임대차 분쟁, 특약 기입 문구 배율, 또는 대법원 중요 판결문 준거 수칙 등 무엇이든 하단에 질문해 주시면 정확히 조언해 드리겠습니다.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll support
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle QnA ask API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAnswering) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnswering(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch('/api/ai/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.text || "알 수 없는 전산 오류로 답변을 정리하지 못했습니다. 다시 시도해 주십시오.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "프록시 네트워크 응답 오작동으로 답변을 도출하는 데 멈춤이 발생했습니다. API 키 구성을 확인하시길 조언합니다.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left side: Legal QnA standard FAQ Accoridon (6 cols) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-600" />
            부동산 실무 법령 FAQ 가이드북
          </h2>
          <p className="text-xs text-stone-500">
            임장 현장이나 계약석 체결 중 개업공인중개사 보호를 위해 자주 돌발하는 고비 사안 해결 요약입니다.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqList.map((faq) => {
            const isOpen = activeFaqId === faq.id;
            return (
              <div 
                key={faq.id}
                className="rounded-xl border border-stone-150 bg-white overflow-hidden transition-all shadow-2xs"
                style={{ contentVisibility: 'auto' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-stone-850 hover:bg-stone-50/40 transition-all select-none"
                >
                  <span className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-orange-600" />
                    {faq.title}
                  </span>
                  <ChevronDown className={`h-4.5 w-4.5 text-stone-400 transition-all ${isOpen ? 'transform rotate-180 text-orange-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4.5 text-xs text-stone-650 leading-relaxed font-light whitespace-pre-line border-t border-stone-50 pt-3 bg-stone-50/50">
                    {faq.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real Estate Tip warning box */}
        <div className="bg-amber-50/35 border border-amber-200/50 rounded-xl p-4 flex gap-3 text-left">
          <Info className="h-4.5 w-4.5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-stone-500 leading-normal">
            <strong>현업 공인중개사 유의사항:</strong> 위 분쟁 예방 해설은 일반적인 법리 가이드라인입니다. 개별 특약 위배, 세부 사정 및 당사자 간의 녹취 여부에 따라 법정 최종 판결은 가변할 수 있으므로, 지엽적 세부 공방은 관할 주택분쟁 조정위원회 연계를 적극 추천해 드립니다.
          </div>
        </div>
      </div>

      {/* Right side: Interactive Gemini legal advice (6 cols) */}
      <div className="lg:col-span-6 flex flex-col h-[520px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Chat box header */}
        <div className="bg-stone-50 border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="h-4.5 w-4.5 text-orange-600 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-stone-900 block">센추리21 법률 자문 챗봇</span>
              <span className="text-[9px] text-stone-400">Gemini 3.5 Flash 법률 비서 자문관</span>
            </div>
          </div>
          <span className="text-[9.5px] text-stone-500 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border">
            PRO 실시간 법령망
          </span>
        </div>

        {/* Scrollable messages context */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-scaleUp`}
                style={{ contentVisibility: 'auto' }}
              >
                <div className={`max-w-md space-y-1 ${isUser ? 'order-1 text-right' : 'order-2 text-left'}`}>
                  <span className="text-[9px] text-stone-400 block px-1 capitalize">
                    {isUser ? '소속 공인중개사' : '센추리21 법률비서'}
                  </span>
                  
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed inline-block text-left whitespace-pre-line ${
                    isUser 
                      ? 'bg-orange-500 text-white font-medium rounded-tr-none' 
                      : 'bg-white border border-stone-200 text-stone-850 rounded-tl-none font-semibold shadow-2xs'
                  }`}>
                    {m.text}
                  </div>
                  
                  <span className="text-[8px] text-stone-400 block px-1 tracking-tighter">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isAnswering && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-stone-200 p-3 rounded-2xl text-xs rounded-tl-none text-stone-500 flex items-center gap-1.5 font-bold shadow-2xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-600" />
                센추리21 변호사 회선 조회 정리 중...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area Form */}
        <form onSubmit={handleSendMessage} className="border-t p-3 bg-white flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAnswering}
            placeholder="예) 가계약금을 넣은 상태에서 집주인이 파기하면 배액배상을 받을 수 있나요?"
            className="flex-1 border border-stone-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-100 bg-stone-50/30 text-stone-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAnswering || !inputText.trim()}
            className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-xs"
            id="btn-ai-legal-send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
