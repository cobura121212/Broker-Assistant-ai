import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Clock, 
  Building, 
  Coins, 
  Compass, 
  RefreshCw 
} from 'lucide-react';
import { Schedule } from '../types';

interface ContractOcrProps {
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  onNavigate: (tab: string) => void;
}

export function ContractOcr({ onAddSchedule, onNavigate }: ContractOcrProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted details
  const [address, setAddress] = useState('');
  const [deposit, setDeposit] = useState('');
  const [intermediatePayment, setIntermediatePayment] = useState('');
  const [balancePayment, setBalancePayment] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  
  // Future scheduled auto entries
  const [extractedSchedules, setExtractedSchedules] = useState<Omit<Schedule, 'id'>[]>([]);
  const [isSavesSuccessful, setIsSavesSuccessful] = useState(false);

  // Ready-to-use synthetic lease layouts for testing
  const demoContracts = [
    {
      title: "정자 한솔마을 3단지 304동 1205호 임대차 계약서 공문",
      address: "경기도 성남시 분당구 정자동 한솔마을 3단지 304동 1205호",
      deposit: "보증금 6억 원",
      intermediatePayment: "중도금 1억 원 (약정일: 2026-06-20)",
      balancePayment: "잔금 5억 원 (약정일: 2026-07-28)",
      contractPeriod: "24개월 임대차 (계약만기: 2028-07-28)",
      schedules: [
        {
          customerName: "정자한솔 임차인",
          title: "한솔마을 304동 중도 기일 납입",
          date: "2026-06-20",
          type: "중도금일" as const,
          completed: false,
          notes: "외환 신탁계좌 직접 송금 확인 요함"
        },
        {
          customerName: "정자한솔 임차인",
          title: "한솔마을 304동 잔금 최종 송금 및 만기",
          date: "2026-07-28",
          type: "잔금일" as const,
          completed: false,
          notes: "입주증 발급 및 관리실 키인수 세팅"
        }
      ],
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300"
    },
    {
      title: "판교 테크노타워 상가 1층 103호 매매 계약 합의록",
      address: "경기도 성남시 분당구 삼평동 판교 에이치스퀘어 상가 1층 103호",
      deposit: "매매 총액 15억 원",
      intermediatePayment: "계약금 1억 5천만 원 (송금 완료)",
      balancePayment: "잔금 13억 5천만 원 (지급일: 2026-07-15)",
      contractPeriod: "상가 분양 취득 (준공 입점일: 2026-07-15)",
      schedules: [
        {
          customerName: "판교 상가 매수인",
          title: "에이치스퀘어 103호 매매 잔금 정산일",
          date: "2026-07-15",
          type: "잔금일" as const,
          completed: false,
          notes: "소유권 이전 등기 서류 법무사 대리 진행 조율"
        }
      ],
      image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300"
    }
  ];

  // Drag logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result as string;
      setImageBase64(base64);
      triggerContractOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  // Triger Server API and save schedules
  const triggerContractOcr = async (base64Str: string) => {
    setIsProcessing(true);
    setIsSavesSuccessful(false);
    try {
      const response = await fetch('/api/ai/contract-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Str }),
      });
      const data = await response.json();
      
      setAddress(data.address || '');
      setDeposit(data.deposit || '');
      setIntermediatePayment(data.intermediatePayment || '');
      setBalancePayment(data.balancePayment || '');
      setContractPeriod(data.contractPeriod || '');
      
      // Auto build structures
      if (data.schedules && Array.isArray(data.schedules)) {
        const build = data.schedules.map((s: any) => ({
          customerName: "계약당사자",
          title: s.title || `${data.address?.substring(0, 10)}... 대금수납`,
          date: s.date || new Date().toISOString().split('T')[0],
          type: s.type || '잔금일',
          completed: false,
          notes: `${data.deposit} 관련 납부 확인`
        }));
        setExtractedSchedules(build);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectDemo = (demo: typeof demoContracts[0]) => {
    setIsProcessing(true);
    setIsSavesSuccessful(false);
    setTimeout(() => {
      setImageBase64(demo.image);
      setImageName(demo.title);
      setAddress(demo.address);
      setDeposit(demo.deposit);
      setIntermediatePayment(demo.intermediatePayment);
      setBalancePayment(demo.balancePayment);
      setContractPeriod(demo.contractPeriod);
      setExtractedSchedules(demo.schedules);
      setIsProcessing(false);
    }, 1200);
  };

  // Add all detected schedules to main calendar database
  const handleSaveToCalendar = () => {
    if (extractedSchedules.length === 0) return;
    extractedSchedules.forEach((sch) => {
      onAddSchedule(sch);
    });
    setIsSavesSuccessful(true);
    setTimeout(() => {
      onNavigate('schedules');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-0.5">
        <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600" />
          공인계약서 및 영수증 비전 OCR 판독기
        </h2>
        <p className="text-xs text-stone-500">
          계약 체결한 전월세/매매 계약 조항 합의 파일을 안전하게 업로드하십시오. AI가 주소 정보와 특약 잔금일을 역산해 공정하게 캘린더에 기입해 줍니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left zones */}
        <div className="lg:col-span-6 space-y-6">
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center space-y-4 ${
              dragActive 
                ? 'border-orange-500 bg-orange-50/20' 
                : 'border-stone-250 hover:border-stone-300 bg-white shadow-2xs'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div className="rounded-2xl bg-orange-50 p-4 text-orange-600">
              <Upload className="h-6 w-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-800 animate-pulse">
                계약서 스마트폰 사진 또는 PDF 사본을 드래그하여 드롭하세요
              </p>
              <p className="text-[10px] text-stone-400">
                개인정보 보안을 지키며 클라우드 Vision을 통해 세부 계약금 조목을 읽어냅니다.
              </p>
            </div>

            {imageName && (
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-750 rounded-lg text-[10px] font-semibold font-mono truncate max-w-xs">
                {imageName}
              </span>
            )}
          </div>

          {/* Quick Demo Templates Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <Compass className="h-4.5 w-4.5 text-orange-600" />
              업무 체험용 실물 계약서 가념 샘플
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoContracts.map((demo, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectDemo(demo)}
                  className="rounded-xl border border-stone-200 bg-white p-3.5 hover:border-orange-300 hover:bg-orange-50/5 cursor-pointer text-left transition-all space-y-2 group shadow-2xs"
                >
                  <span className="text-[10px] font-bold text-orange-600 font-mono block">SAMPLE CONTRACT {idx+1}</span>
                  <h4 className="text-xs font-bold text-stone-800 leading-snug group-hover:text-orange-600 truncate">
                    {demo.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono truncate">{demo.deposit}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Parsed Layout (5 cols) */}
        <div className="lg:col-span-6">
          {isProcessing ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs space-y-3 shadow-md flex flex-col items-center justify-center h-full min-h-80">
              <RefreshCw className="h-7 w-7 text-orange-500 animate-spin" />
              <p className="font-bold text-stone-800">Gemini 3.5 Flash Contract Parser 구동 중...</p>
              <p className="text-[10px] text-stone-400">보증금 융자 금액 및 잔금 지정 기일을 추출 정합성 검증 중입니다.</p>
            </div>
          ) : address ? (
            <div className="bg-white rounded-2xl border border-orange-200 p-5 md:p-6 space-y-5 shadow-sm animate-scaleUp">
              
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                  <Sparkles className="h-4.5 w-4.5" />
                  계약 조항 정밀 디코딩 완료
                </span>
                <span className="text-[10px] text-stone-400 font-mono">PARSING SUCCESS</span>
              </div>

              {/* Extraction specifics */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2">
                  <Building className="h-4.5 w-4.5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold">임차목적지 주소</span>
                    <p className="font-semibold text-stone-850 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Coins className="h-4.5 w-4.5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold">보증금 / 권리 관계가</span>
                    <p className="font-bold font-mono text-orange-950 text-sm mt-0.5">{deposit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold">중도금 결제 기일</span>
                    <p className="font-medium text-stone-700 mt-0.5">{intermediatePayment || '해당 없음'}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold">잔금 완납 기한</span>
                    <p className="font-medium text-stone-700 mt-0.5">{balancePayment}</p>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-stone-400 font-bold">계약 만기 수명 주일</span>
                  <p className="font-semibold text-stone-750 mt-0.5">{contractPeriod}</p>
                </div>

                {/* Auto calendar appointments previews */}
                {extractedSchedules.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-250/55 rounded-xl p-3.5 space-y-2.5">
                    <span className="text-[10px] font-bold text-orange-700 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      캘린더 연동 자동 일정 생성 대상 ({extractedSchedules.length}건)
                    </span>
                    <div className="space-y-2">
                      {extractedSchedules.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-sans pb-1.5 border-b border-amber-200/40 last:border-0 last:pb-0">
                          <div>
                            <span className="font-bold text-stone-800">{s.title}</span>
                            <span className="block text-[9px] text-stone-400">{s.type}</span>
                          </div>
                          <span className="font-mono font-bold text-orange-950 bg-white px-2 py-0.5 rounded-lg border">
                            {s.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm to schedule */}
              <div className="pt-3 border-t">
                {isSavesSuccessful ? (
                  <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-orange-100 text-orange-850 text-xs font-bold w-full animate-fadeIn animate-pulse">
                    <Check className="h-4.5 w-4.5 text-orange-600" />
                    약정 기한 일정 스케줄 완벽 주입!
                  </div>
                ) : (
                  <button
                    onClick={handleSaveToCalendar}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    id="btn-import-ocr-schedule"
                  >
                    <Calendar className="h-4 w-4" />
                    스케줄표에 자동 일정 등록
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-stone-150 p-12 text-center text-stone-400 text-xs flex flex-col items-center justify-center h-full min-h-85">
              <Compass className="h-8 w-8 text-stone-300 mb-2" />
              좌측 계약서 사본을 투입하거나<br />체험용 가상 샘플을 누르면 AI가 정밀 분석을 실행합니다.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
