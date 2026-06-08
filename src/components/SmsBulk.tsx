import React, { useState } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock, 
  Smartphone, 
  CheckCircle,
  HelpCircle,
  Play,
  Mail,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Customer, SmsLog } from '../types';

interface SmsBulkProps {
  customers: Customer[];
  smsLogs: SmsLog[];
  onAddSmsLog: (log: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => void;
}

export function SmsBulk({ customers, smsLogs, onAddSmsLog }: SmsBulkProps) {
  // Target categories selection
  const [selectedTargetType, setSelectedTargetType] = useState<string>('전체'); // '전체' | '매수' | '매도' | '임대' | '임차'
  
  // Choose presets templates
  const [customWordset, setCustomWordset] = useState('');
  const [messageCategory, setMessageCategory] = useState('직접작성');

  // Progress Bar transmission simulated state
  const [sendingProgress, setSendingProgress] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Ready presets
  const cardPresets = [
    {
      label: "새해 복 많이 받으십시오",
      category: "새해인사",
      text: "새해 복 많이 받으십시오.\n(주) 센추리21 부동산 중개법인 소속 공인중개사입니다. 지난 한 해 동안 보내주신 신뢰에 깊은 감사를 지니며, 가정에 만복이 깃드시길 경어 축원합니다."
    },
    {
      label: "올해 풍성한 추석 명절 기원",
      category: "추석인사",
      text: "한가위 보름달처럼 마음이 무르익는 명절 되시기 바랍니다.\n(주) 센추리21 중개법인이 귀하의 앞길에 풍요로운 번영과 대대적인 성공만을 늘 조력하겠습니다."
    },
    {
      label: "기념 성원 생신 안부 축전",
      category: "생일",
      text: "생신을 진심으로 기념하여 성원드립니다.\n항상 건강하시고 평화 가득한 특별한 축전의 하루가 되시길 기원하겠습니다. - 센추리21 소속 공인중개사 드림 -"
    },
    {
      label: "입주 / 체결 벌써 1주년 안내",
      category: "계약1주년",
      text: "안녕하십니까, (주) 센추리21 중개법인입니다. 분당 주요 입지에 새 자리를 안착하신 지 어언 1주년이 지나 안내드립니다. 임대차 보증 및 편의사항에 상호 케어가 필요하시면 언제든 대표 번호로 소통하십시오."
    }
  ];

  // Pick Preset click
  const handleSelectPreset = (p: typeof cardPresets[0]) => {
    setMessageCategory(p.category);
    setCustomWordset(p.text);
  };

  // Target count calculation
  const targetCustomers = customers.filter(c => selectedTargetType === '전체' || c.type === selectedTargetType);
  const targetCount = targetCustomers.length;

  // Run Bulk sending animation and append items to SMS database
  const handleTriggerBulkSending = () => {
    if (targetCount === 0 || !customWordset.trim()) return;
    setIsSending(true);
    setSendingProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setSendingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Push each customer sms log to the centralized storage
        targetCustomers.forEach((cust) => {
          onAddSmsLog({
            recipientName: cust.name,
            recipientPhone: cust.phone,
            category: messageCategory,
            message: customWordset,
          });
        });

        // Reset sending state
        setTimeout(() => {
          setIsSending(false);
          setSendingProgress(null);
          setCustomWordset('');
          setMessageCategory('직접작성');
        }, 1200);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-0.5">
        <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-orange-600" />
          AI 안부 및 만기 타겟 단체문자 센터
        </h2>
        <p className="text-xs text-stone-500">
          설날/추석 명절 안부, 생일 성원 축전, 입주 1주년 감사 알림을 CRM 타겟을 분과하여 완벽한 일괄 패킷 발송을 진행합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Composer and Presets selectors (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm">
          
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-850">
            <Mail className="h-4.5 w-4.5 text-orange-600" />
            단체 문자 큐레이션 작성기
          </div>

          {/* Group Type Target select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">발송 수신 대상 타겟군</label>
              <select
                value={selectedTargetType}
                onChange={(e) => setSelectedTargetType(e.target.value)}
                className="w-full border border-stone-250 p-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              >
                <option value="전체">전체 고객대장 수신 ({customers.length}명)</option>
                <option value="매수">매수 대기자군 ({customers.filter(c => c.type === '매수').length}명)</option>
                <option value="매도">매도 대기자군 ({customers.filter(c => c.type === '매도').length}명)</option>
                <option value="임대">임대 보유주군 ({customers.filter(c => c.type === '임대').length}명)</option>
                <option value="임차">임차 수요자군 ({customers.filter(c => c.type === '임차').length}명)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">발송 유형</label>
              <div className="py-2.5 px-3 bg-stone-50 rounded-xl text-stone-700 text-xs font-semibold">
                지정 위탁 대상: <span className="text-orange-600 font-bold">{targetCount}명</span>
              </div>
            </div>
          </div>

          {/* Selectable Presets list */}
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-stone-600">센추리21 공식 카드용 인사 문구 프리셋</span>
            <div className="grid grid-cols-2 gap-2">
              {cardPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white text-left text-[10.5px] font-bold text-stone-750 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/5 transition-all truncate"
                >
                  ✉ {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Edit text */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-stone-600">
              <span>발송 내용 편집 (바이트수 무제한 PRO 패키지)</span>
              <span className="font-mono text-stone-400">{customWordset.length} 자 기입됨</span>
            </div>
            <textarea
              value={customWordset}
              onChange={(e) => setCustomWordset(e.target.value)}
              placeholder="프리셋을 복사하거나 고객들을 감동시킬 따뜻한 중개법인 안부를 직접 수정하여 작성해 주세요."
              className="w-full h-36 border border-stone-250 p-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
            />
          </div>

          {/* Send Trigger / Progress Animation */}
          <div className="pt-2 border-t">
            {isSending ? (
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold text-orange-850">
                  <span className="flex items-center gap-1 animate-pulse">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-600" />
                    센추리21 전산 회선 패킷 전송 중...
                  </span>
                  <span className="font-mono">{sendingProgress}% 완료</span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300" 
                    style={{ width: `${sendingProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTriggerBulkSending}
                disabled={targetCount === 0 || !customWordset.trim()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                id="btn-sms-bulk-send"
              >
                <Send className="h-4 w-4" />
                선택 타겟군 (총 {targetCount}명) 일괄 발송 개시
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Sending Logs (5 cols) */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5 h-full max-h-[500px] overflow-y-auto space-y-4">
          
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-stone-400" />
              최근 단체 발송 이력 아카이브
            </span>
            <span className="text-[10px] text-stone-400 font-mono">SMS LOGS</span>
          </div>

          <div className="space-y-3">
            {smsLogs.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                발송 이력이 존재하지 않습니다.
              </div>
            ) : (
              [...smsLogs].reverse().map((log) => (
                <div 
                  key={log.id} 
                  className="bg-white rounded-xl border border-stone-150 p-3.5 space-y-2 text-left"
                  style={{ contentVisibility: 'auto' }}
                >
                  <div className="flex items-center justify-between text-[10.5px] font-bold">
                    <span className="text-stone-850">수신: {log.recipientName} ({log.recipientPhone})</span>
                    <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold uppercase">
                      {log.category}
                    </span>
                  </div>
                  
                  <p className="text-xs text-stone-600 font-sans leading-relaxed tracking-tight break-all font-light whitespace-pre-line">
                    {log.message}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-stone-450 pt-1.5 border-t border-stone-50">
                    <span>이전 완료일: {log.sentAt}</span>
                    <span className="text-stone-500 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-amber-500" />
                      전달 성사
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
