import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  FileSpreadsheet, 
  ShieldAlert, 
  Coins, 
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { importFromExcel } from '../utils/excelBackup';
import { Customer, Property, Schedule, SmsLog } from '../types';

interface SettingsProps {
  customersCount: number;
  propertiesCount: number;
  schedulesCount: number;
  smsLogsCount: number;
  onExport: () => void;
  onRestoreData: (restored: {
    customers: Customer[];
    properties: Property[];
    schedules: Schedule[];
    smsLogs: SmsLog[];
  }) => void;
}

export function Settings({
  customersCount,
  propertiesCount,
  schedulesCount,
  smsLogsCount,
  onExport,
  onRestoreData,
}: SettingsProps) {
  // Upload restorers State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorationSuccess, setRestorationSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse restoring action
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsRestoring(true);
      setRestorationSuccess(null);
      try {
        const restored = await importFromExcel(file);
        // Dispatch up
        onRestoreData(restored);
        setRestorationSuccess(`고객 ${restored.customers.length}명, 매물 ${restored.properties.length}개, 일정 ${restored.schedules.length}건, SMS 기록 ${restored.smsLogs.length}건이 성공적으로 역복원되었습니다!`);
      } catch (err: any) {
        alert(err.message || "엑셀 복원 실패");
      } finally {
        setIsRestoring(false);
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      <div className="space-y-0.5">
        <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-orange-600" />
          중개비서 AI 전산 설정 센터
        </h2>
        <p className="text-xs text-stone-500">
          센추리21 부동산 전산망 라이센스 관리, 수동 엑셀 통합 대장 파일 백업과 복원 기능을 일괄 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Premium Status Permanently Locked (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-orange-600 animate-pulse" />
              전산 전입 라이센스 상태
            </span>
            <span className="text-[10px] text-stone-400 font-mono">ACTIVE LICENSE</span>
          </div>

          {/* Locked Premium Banner Card */}
          <div className="bg-gradient-to-br from-orange-400/10 to-amber-500/10 border border-orange-300/40 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Lock className="h-28 w-28" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">PREMIUM PRO LICENSE</span>
                <h3 className="text-base font-bold text-orange-950 font-sans">센추리21 AI PRO 무제한 전산망</h3>
              </div>
              <div className="p-2.5 bg-orange-500 rounded-xl text-white">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="h-px bg-orange-200/40"></div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Lock className="h-4 w-4 text-orange-600" />
                영구 보안 잠금 활성화 상태
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                본사 일괄 전단 정비 및 플랫폼 활성화 정책에 맞춰 본 소속 공인중개사 전용 계정에는 <strong className="text-orange-950">월 19,900원의 AI PRO 무제한 요금제가 상시 활성화(인감 락인)</strong>로 영구 보장 적용 완료되었습니다. 수동 이탈이나 등급 하향을 이탈 방지하기 위해 라이센스 변경 토클은 비활성화되었습니다.
              </p>
            </div>
          </div>

          {/* Pricing simulation matrix (Lock and Disable status) */}
          <div className="space-y-2 text-xs text-stone-500">
            <span className="block font-bold text-stone-700">중개 요금 과금제 정보</span>
            
            <div className="grid grid-cols-2 gap-3 opacity-75">
              <div className="p-3 border rounded-xl bg-stone-50 space-y-1 text-left relative">
                <div className="absolute top-2 right-2 text-[8px] bg-stone-200 text-stone-550 px-1 py-0.5 rounded font-mono font-bold">LIMITED</div>
                <div className="text-[11px] font-bold text-stone-400">무료 체험 버전</div>
                <p className="text-[9px] leading-tight text-stone-400">고객 100명 한정, 매물 50개 제한, AI 상담 및 계약서 자동 판독 무효</p>
              </div>

              <div className="p-3 border border-orange-200 bg-orange-100/10 rounded-xl space-y-1 text-left relative">
                <div className="absolute top-2 right-2 text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</div>
                <div className="text-[11px] font-bold text-orange-700">AI PRO 패키지</div>
                <p className="text-[9px] leading-tight text-orange-950 font-semibold">고객/매물 무제한, 3초 AI 상담 요약, 계약서 비전 추출, 예약 SMS 전송</p>
              </div>
            </div>

            <button
              disabled={true}
              type="button"
              className="w-full py-2.5 border border-stone-200 bg-stone-100 text-stone-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="h-3.5 w-3.5" />
              본사 일괄 전산 정책에 다른 변경 잠금
            </button>
          </div>

        </div>

        {/* Right Side: Excel Backup Portal (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4.5 w-4.5 text-orange-600 font-bold" />
              엑셀(.xlsx) 백업 및 원장 복원 포털
            </span>
            <span className="text-[10px] text-stone-400 font-mono">INTEGRATION EXCEL BUNDLE</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              로컬 장부에 기록된 소중한 중개 자료를 엑셀 파일 하나로 영구 추출할 수 있습니다. 수동으로 데이터를 수정해 다시 업로드하면 주소록 대장이 즉시 정합성 가공 연동 복원됩니다.
            </p>

            {/* Current bundle indices counts check */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-stone-50 rounded-xl text-center">
                <span className="block text-[8px] text-stone-400 font-bold">가입고객</span>
                <span className="text-xs font-bold text-stone-800">{customersCount}건</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl text-center">
                <span className="block text-[8px] text-stone-400 font-bold">매물대장</span>
                <span className="text-xs font-bold text-stone-800">{propertiesCount}건</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl text-center">
                <span className="block text-[8px] text-stone-400 font-bold">캘린더</span>
                <span className="text-xs font-bold text-stone-800">{schedulesCount}건</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl text-center">
                <span className="block text-[8px] text-stone-400 font-bold">SMS 로그</span>
                <span className="text-xs font-bold text-stone-800">{smsLogsCount}건</span>
              </div>
            </div>

            {/* Downloader Trigger button */}
            <button
              onClick={onExport}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              id="settings-backup-excel-trigger"
            >
              <Download className="h-4.5 w-4.5" />
              현시점 중개대장 엑셀 통합본 백업받기
            </button>

            <div className="h-px bg-stone-100"></div>

            {/* Upload portal segment */}
            <div className="space-y-3">
              <span className="block text-[11px] font-bold text-stone-700">전산 대장 파일로 원장 대조 복원</span>
              
              <div 
                onClick={() => !isRestoring && fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center cursor-pointer hover:bg-stone-50/50 transition-all flex flex-col items-center justify-center space-y-2.5"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleExcelUpload} 
                  accept=".xlsx" 
                  className="hidden" 
                />
                
                {isRestoring ? (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
                    <span className="text-xs font-bold text-stone-700">정합성 해독 파싱 분석 중...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-stone-400" />
                    <div className="space-y-1">
                      <p className="text-[10.5px] font-bold text-stone-800">과거 백업받은 엑셀 파일(.xlsx) 선택</p>
                      <p className="text-[9px] text-stone-400">대고객 CRM 및 매물대장 시트 규격에 맞춰 병합 정렬합니다.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Recovery Success Banner and Alerts */}
              {restorationSuccess && (
                <div className="p-3 bg-amber-50/50 border border-amber-250 rounded-xl flex items-start gap-2 text-left animate-fadeIn">
                  <Check className="h-4.5 w-4.5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-orange-950 font-bold whitespace-normal leading-normal">
                    {restorationSuccess}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
