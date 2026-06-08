import React from 'react';
import { 
  Building, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight, 
  AlertTriangle, 
  Download, 
  Upload, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';
import { Customer, Property, Schedule, SmsLog } from '../types';

interface DashboardProps {
  customers: Customer[];
  properties: Property[];
  schedules: Schedule[];
  smsLogs: SmsLog[];
  onNavigate: (tab: string) => void;
  onExport: () => void;
  onImportClick: () => void;
}

export function Dashboard({
  customers,
  properties,
  schedules,
  smsLogs,
  onNavigate,
  onExport,
  onImportClick,
}: DashboardProps) {
  // 1. Calculate stats
  const totalCustomers = customers.length;
  const totalProperties = properties.length;
  const totalSchedules = schedules.filter((s) => !s.completed).length;
  const totalCompletedSchedules = schedules.filter((s) => s.completed).length;

  // 2. Identify D-day warnings
  const getDDay = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dDayNotices = schedules
    .filter((s) => !s.completed)
    .map((s) => {
      const days = getDDay(s.date);
      return { ...s, days };
    })
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);

  // 3. Custom SVG data modeling for CRM progress stages
  // Waiting, Meeting, Progressing, Contracted
  const stageCounts = {
    대기: customers.filter((c) => c.status === '대기').length,
    미팅: customers.filter((c) => c.status === '미팅').length,
    진행: customers.filter((c) => c.status === '진행').length,
    계약: customers.filter((c) => c.status === '계약').length,
  };

  const stageMax = Math.max(...Object.values(stageCounts), 1);

  return (
    <div className="space-y-6">
      {/* 1. Century 21 Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 p-6 md:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-amber-300/20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-100 animate-pulse" />
              CENTURY 21® Premium Solution
            </div>
            <h1 className="text-2xl md:text-3.5xl font-bold font-serif-header tracking-tight">
              (주) 센추리21 부동산 중개법인
            </h1>
            <p className="text-sm md:text-base text-amber-50 max-w-xl font-light leading-relaxed">
              스마트 중개비서 AI 플랫폼에 오신 것을 환영합니다. 매물 조율, OCR 계약 해독, 단체 안부 및 분쟁 법령 가이드를 원스톱 관리하세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-orange-900 px-4 py-2.5 text-sm font-bold hover:bg-amber-100 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
              id="btn-quick-export"
            >
              <Download className="h-4 w-4 text-orange-600" />
              통합 엑셀 백업
            </button>
            <button
              onClick={onImportClick}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-950/20 border border-white/30 text-white px-4 py-2.5 text-sm font-bold hover:bg-white/10 transition-all active:scale-[0.99]"
              id="btn-quick-import"
            >
              <Upload className="h-4 w-4 text-amber-200" />
              백업 복원
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Bento Container */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div id="stat-card-customer" className="rounded-2xl border border-stone-200/80 bg-white p-5 transition-all hover:shadow-md hover:border-orange-200/50 space-y-3 shadow-[0_2px_4px_rgba(43,40,35,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">관리 대상 고객</span>
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 shadow-inner">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black font-serif-header text-stone-900">{totalCustomers}명</h3>
            <p className="text-[10px] text-stone-400 font-medium mt-1">누적 CRM 가입 장부</p>
          </div>
        </div>

        <div id="stat-card-property" className="rounded-2xl border border-stone-200/80 bg-white p-5 transition-all hover:shadow-md hover:border-orange-200/50 space-y-3 shadow-[0_2px_4px_rgba(43,40,35,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">보유 등재 매물</span>
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 shadow-inner">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black font-serif-header text-stone-900">{totalProperties}개</h3>
            <p className="text-[10px] text-stone-400 font-medium mt-1">포털 및 인지 광고 연결</p>
          </div>
        </div>

        <div id="stat-card-schedule" className="rounded-2xl border border-stone-200/80 bg-white p-5 transition-all hover:shadow-md hover:border-orange-200/50 space-y-3 shadow-[0_2px_4px_rgba(43,40,35,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">예정 잔여 일정</span>
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 shadow-inner">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black font-serif-header text-stone-900">{totalSchedules}건</h3>
            <p className="text-[10px] text-stone-400 font-medium mt-1">체결, 잔금 송금 등 기한</p>
          </div>
        </div>

        <div id="stat-card-sms" className="rounded-2xl border border-stone-200/80 bg-white p-5 transition-all hover:shadow-md hover:border-orange-200/50 space-y-3 shadow-[0_2px_4px_rgba(43,40,35,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">누적 완료 일정</span>
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 shadow-inner">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black font-serif-header text-stone-900">{totalCompletedSchedules}건</h3>
            <p className="text-[10px] text-stone-400 font-medium mt-1">중개 수수료 정산 및 종결</p>
          </div>
        </div>
      </div>

      {/* 3. D-Day Notification Center & SVG Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time D-day panel (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-orange-600" />
                D-Day 스마트 기한 알림보드
              </h3>
              <p className="text-xs text-stone-500">임점 계약일, 잔금입금일, 만료일이 도래하는 리스트입니다.</p>
            </div>
            <button 
              onClick={() => onNavigate('schedules')}
              className="text-stone-500 hover:text-orange-600 transition-all text-xs font-medium inline-flex items-center gap-1"
            >
              전체 보기 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {dDayNotices.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                예정 중인 급박한 마일스톤 계약이나 대금 지급 일정이 없습니다.
              </div>
            ) : (
              dDayNotices.map((s) => {
                const days = s.days;
                const isUrgent = days <= 5 && days >= 0;
                const isPast = days < 0;

                return (
                  <div 
                    key={s.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isUrgent 
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900' 
                        : isPast 
                          ? 'bg-stone-50 border-stone-200 text-stone-500' 
                          : 'bg-white border-stone-100 hover:border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        isUrgent ? 'bg-orange-600' : isPast ? 'bg-stone-400' : 'bg-amber-400'
                      }`}></div>
                      <div>
                        <div className="text-xs font-bold font-sans">
                          {s.customerName} - <span className="font-medium text-stone-600">{s.title}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-2">
                          <span>기한: {s.date}</span>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-stone-100 font-medium text-[9px]">
                            {s.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        isUrgent 
                          ? 'text-orange-700 font-mono bg-orange-100 px-2 py-1 rounded-lg' 
                          : isPast 
                            ? 'text-stone-500 font-mono' 
                            : 'text-amber-700 font-mono bg-amber-100/55 px-2 py-1 rounded-lg'
                      }`}>
                        {days === 0 ? 'D-Day' : days < 0 ? `기한경과(${Math.abs(days)}일)` : `D-${days}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Beautiful custom inline SVG statistics chart (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-serif-header text-stone-900">CRM 진행 단계</h3>
            <p className="text-xs text-stone-500">고객들의 계약 관문 및 단계별 지형 분포도</p>
          </div>

          {/* Clean Custom SVG bar chart */}
          <div className="py-2">
            <div className="space-y-4">
              {Object.keys(stageCounts).map((stage) => {
                const count = stageCounts[stage as keyof typeof stageCounts];
                const pct = (count / stageMax) * 100;
                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-stone-700">{stage} 단계</span>
                      <span className="text-orange-500 font-mono font-bold">{count}명</span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-300 to-orange-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>최근 갱신일: 방금 전</span>
            <span className="font-bold text-orange-500 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => onNavigate('customers')}>
              고객대장 보러가기 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Guide Shortcuts */}
      <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 mt-0.5 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-serif-header text-stone-800">서류 및 계약 보관 간편 자동화 비결</h4>
            <p className="text-[10.5px] text-stone-500 mt-1 leading-relaxed max-w-xl font-light">
              계약서 명함 관리 탭에서 [계약서 OCR 판독기]나 [명함 수집 OCR] 기능을 이용해 보십시오. 원클릭 촬영만으로 계약일/잔금 정보 파싱과 CRM 연동이 즉시 해결됩니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('card-ocr')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-orange-650 hover:bg-stone-50 active:bg-stone-100 transition-all shadow-sm cursor-pointer"
          >
            명함 촬영하기
          </button>
          <button 
            onClick={() => onNavigate('contract-ocr')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-orange-500 text-white hover:bg-orange-650 transition-all shadow-sm cursor-pointer"
          >
            계약서 분석하기
          </button>
        </div>
      </div>
    </div>
  );
}
