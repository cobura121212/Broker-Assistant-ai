import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Upload, 
  Sparkles, 
  UserCheck, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  FileText,
  User,
  Building,
  Phone,
  Mail,
  Compass
} from 'lucide-react';
import { Customer } from '../types';

interface CardOcrProps {
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onNavigate: (tab: string) => void;
}

export function CardOcr({ onAddCustomer, onNavigate }: CardOcrProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed OCR outcomes
  const [parsedName, setParsedName] = useState('');
  const [parsedCompany, setParsedCompany] = useState('');
  const [parsedPhone, setParsedPhone] = useState('');
  const [parsedEmail, setParsedEmail] = useState('');
  const [interestedArea, setInterestedArea] = useState('');
  const [notes, setNotes] = useState('');
  
  // Save confirmation label
  const [isImported, setIsImported] = useState(false);

  // Gorgeous pre-rendered mock card profiles for opening preview
  const demoCards = [
    {
      name: "백두산 대표이사",
      company: "(주) 한라디엔씨 시행사",
      phone: "010-4567-8901",
      email: "mountain@halla-dnc.com",
      interestedArea: "분당 정자동 상가 부지",
      notes: "판교 인근 빌딩 신축 시행 목적의 부지 매입 희망.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" // placeholder represent
    },
    {
      name: "이지민 실장",
      company: "라온 디자인 아키텍츠",
      phone: "010-8912-3456",
      email: "designer_lee@laon.co.kr",
      interestedArea: "분당 구미동 타운하우스",
      notes: "프라이빗 정원 딸린 세대 리모델링 매칭 파트너십 구축 필요.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
    }
  ];

  // Drag handers
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
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setImageBase64(base64);
      triggerOcrRequest(base64);
    };
    reader.readAsDataURL(file);
  };

  // Run the API
  const triggerOcrRequest = async (base64String: string) => {
    setIsProcessing(true);
    setIsImported(false);
    try {
      const response = await fetch('/api/ai/card-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64String }),
      });
      const data = await response.json();
      
      // Auto-populate parsed controls
      setParsedName(data.name || '');
      setParsedCompany(data.company || '');
      setParsedPhone(data.phone || '');
      setParsedEmail(data.email || '');
      setInterestedArea(data.interestedArea || '');
      setNotes(`상호: ${data.company || '명함 상호 미지정'}\n이메일: ${data.email || ''}\n명함 자동 스캔 OCR 등록 고객.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Select Mock Demo cards directly
  const handleSelectDemo = (demo: typeof demoCards[0]) => {
    setIsProcessing(true);
    setIsImported(false);
    // Draw synthetic loading state for real real-estate look
    setTimeout(() => {
      setImageBase64(demo.image);
      setImageName(`체험_명함_${demo.name.replace(' ', '_')}.png`);
      setParsedName(demo.name);
      setParsedCompany(demo.company);
      setParsedPhone(demo.phone);
      setParsedEmail(demo.email);
      setInterestedArea(demo.interestedArea);
      setNotes(`상호: ${demo.company}\n이메일: ${demo.email}\n특이사항: ${demo.notes}`);
      setIsProcessing(false);
    }, 1200);
  };

  // Import directly to Database
  const handleSaveToCrm = () => {
    if (!parsedName || !parsedPhone) return;
    onAddCustomer({
      name: parsedName,
      phone: parsedPhone,
      interestedArea,
      budget: '미정 (명함 스캔)',
      type: '매수',
      status: '대기',
      notes,
    });
    setIsImported(true);
    
    // Clear image
    setTimeout(() => {
      onNavigate('customers');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-0.5">
        <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-orange-600" />
          모바일 명함 수집 OCR 판독기
        </h2>
        <p className="text-xs text-stone-500">
          종이 명함 사진을 찍어 올리면, AI 비전이 텍스트 정보를 추출해 성함 및 직함을 찾아 고객 데이터베이스에 즉시 편입해 줍니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Drag Zone and Mock selection (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Upload Frame */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center space-y-4 ${
              dragActive 
                ? 'border-orange-500 bg-orange-50/20' 
                : 'border-stone-250 hover:border-stone-300 bg-white'
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
              <Upload className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-800">
                명함 이미지 파일을 드래그하여 놓거나 직접 선택하십시오
              </p>
              <p className="text-[10px] text-stone-400">
                지원 규격 : JPG, PNG, WEBP (스마트폰 즉시 촬영 지원)
              </p>
            </div>

            {imageName && (
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-[10px] font-semibold font-mono">
                {imageName}
              </span>
            )}
          </div>

          {/* Quick Demo Samples Selectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <Compass className="h-4.5 w-4.5 text-orange-600" />
              업무 체험용 명함 가상 샘플
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoCards.map((demo, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectDemo(demo)}
                  className="rounded-xl border border-stone-200 bg-white p-3 hover:border-orange-300 hover:bg-orange-50/5 cursor-pointer text-left transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-850 group-hover:text-orange-600">{demo.name}</span>
                    <span className="text-[9px] text-stone-400 font-mono">샘플 {idx + 1}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">{demo.company}</p>
                  <p className="text-[9px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded truncate inline-block max-w-full">
                    {demo.interestedArea}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Parsed and Confirmation section (5 cols) */}
        <div className="lg:col-span-6">
          {isProcessing ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs space-y-3 shadow-sm flex flex-col items-center justify-center h-full min-h-80">
              <RefreshCw className="h-7 w-7 text-orange-500 animate-spin" />
              <p className="font-bold text-stone-800">Gemini AI가 명함 이미지 분석 중...</p>
              <p className="text-[10px] text-stone-400">주소록 매칭 및 이름 추출 구조화를 수행하고 있습니다.</p>
            </div>
          ) : parsedName ? (
            <div className="bg-white rounded-2xl border border-orange-200/60 p-5 md:p-6 space-y-5 shadow-sm animate-scaleUp">
              
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                  <Sparkles className="h-4.5 w-4.5" />
                  판독 & CRM 자동 이관 대기
                </span>
                <span className="text-[10px] text-stone-400 font-mono">OCR SUCCESS</span>
              </div>

              {/* Editable results form */}
              <div className="space-y-3.5">
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    <User className="h-3.5 w-3.5" />
                    성명 및 직함
                  </label>
                  <input
                    type="text"
                    value={parsedName}
                    onChange={(e) => setParsedName(e.target.value)}
                    className="w-full border border-stone-250 p-2 text-xs rounded-lg text-stone-800 bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    <Building className="h-3.5 w-3.5" />
                    상호명 / 신탁 회사명
                  </label>
                  <input
                    type="text"
                    value={parsedCompany}
                    onChange={(e) => setParsedCompany(e.target.value)}
                    className="w-full border border-stone-250 p-2 text-xs rounded-lg text-stone-800 bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    <Phone className="h-3.5 w-3.5" />
                    개인 연락처
                  </label>
                  <input
                    type="text"
                    value={parsedPhone}
                    onChange={(e) => setParsedPhone(e.target.value)}
                    className="w-full border border-stone-250 p-2 text-xs rounded-lg text-stone-800 bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    <Mail className="h-3.5 w-3.5" />
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    value={parsedEmail}
                    onChange={(e) => setParsedEmail(e.target.value)}
                    className="w-full border border-stone-250 p-2 text-xs rounded-lg text-stone-800 bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    관심 투자 성향 및 구역
                  </label>
                  <input
                    type="text"
                    value={interestedArea}
                    onChange={(e) => setInterestedArea(e.target.value)}
                    className="w-full border border-stone-250 p-2 text-xs rounded-lg text-stone-800 bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Confirm save button */}
              <div className="pt-3 border-t">
                {isImported ? (
                  <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-orange-100 text-orange-850 text-xs font-bold w-full animate-fadeIn">
                    <UserCheck className="h-4.5 w-4.5 text-orange-600" />
                    고객대장 CRM 원장 등록 완료!
                  </div>
                ) : (
                  <button
                    onClick={handleSaveToCrm}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    id="btn-import-ocr-crm"
                  >
                    <UserCheck className="h-4 w-4" />
                    즉시 CRM 고객에 편입 등록
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-stone-150 p-12 text-center text-stone-400 text-xs flex flex-col items-center justify-center h-full min-h-85">
              <HelpCircle className="h-8 w-8 text-stone-300 mb-2" />
              우측 명함 사진을 업로드하거나<br />체험용 가상 샘플을 택하면 정보 해독을 준비합니다.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
