import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  Phone, 
  Building2, 
  Wallet, 
  FileEdit, 
  MessageSquare,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerManagement({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerManagementProps) {
  // Tabs & Searching
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('전체');
  const [filterStatus, setFilterStatus] = useState<string>('전체');

  // Input states
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interestedArea, setInterestedArea] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState<'매수' | '매도' | '임대' | '임차'>('매수');
  const [status, setStatus] = useState<'대기' | '미팅' | '진행' | '계약'>('대기');
  const [notes, setNotes] = useState('');

  // AI audio transcript / counsel summarization dialog
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Deletion protective confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Selected customer for expanded view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Quick Action Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddCustomer({
      name,
      phone,
      interestedArea,
      budget,
      type,
      status,
      notes,
    });
    // Reset
    setName('');
    setPhone('');
    setInterestedArea('');
    setBudget('');
    setType('매수');
    setStatus('대기');
    setNotes('');
    setIsAdding(false);
  };

  // Run AI Summary API
  const handleAiSummary = async (customerId: string, clientNotes: string) => {
    setIsSummarizing(true);
    try {
      const response = await fetch('/api/ai/counsel-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: clientNotes }),
      });
      const data = await response.json();
      if (data.summary) {
        const found = customers.find((c) => c.id === customerId);
        if (found) {
          onUpdateCustomer({
            ...found,
            aiSummary: data.summary,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
      setSummarizingId(null);
      setTranscriptText('');
    }
  };

  // Filter customers logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.interestedArea.toLowerCase().includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === '전체' || c.type === filterType;
    const matchesStatus = filterStatus === '전체' || c.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="이름, 연락처, 관심지역, 상담내역 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-250 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-sm bg-white text-stone-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="전체">조건: 전체 유형</option>
            <option value="매수">매수</option>
            <option value="매도">매도</option>
            <option value="임대">임대</option>
            <option value="임차">임차</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="전체">단계: 전체 단계</option>
            <option value="대기">대기</option>
            <option value="미팅">미팅</option>
            <option value="진행">진행</option>
            <option value="계약">계약</option>
          </select>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all whitespace-nowrap"
            id="btn-add-customer-trigger"
          >
            <Plus className="h-4 w-4" />
            고객 신규 등록
          </button>
        </div>
      </div>

      {/* 1. Add Customer Drawer Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-amber-200 bg-amber-50/20 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
            <h3 className="text-sm font-bold font-serif-header text-stone-850 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-orange-600" />
              신규 잠재 고객 DB 등록
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              닫기
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">고객 성함 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 김철수"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">연락처 번호 *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예) 010-1234-5678"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">관심지역/단지</label>
              <input
                type="text"
                value={interestedArea}
                onChange={(e) => setInterestedArea(e.target.value)}
                placeholder="예) 분당 정자동 한솔3단지"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">가용한 예산</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="예) 12억 원 선 또는 5000/250"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">중개 유형</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              >
                <option value="매수">매수 (구매 희망)</option>
                <option value="매도 (매각 희망)">매도 (매매 내놓음)</option>
                <option value="임대">임대 (전월세 내놓음)</option>
                <option value="임차">임차 (전월세 얻음)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">진행 상황인식</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              >
                <option value="대기">대기</option>
                <option value="미팅">미팅</option>
                <option value="진행">진행</option>
                <option value="계약">계약 완료</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">내부 거래 상담 상세 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="임대차 만기 관련 내용, 가족 구성원 통근 환경, 필수 실내 희망옵션 등 기술..."
              className="w-full h-20 border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-stone-200 text-xs font-semibold rounded-lg text-stone-650 bg-white hover:bg-stone-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
              id="btn-confirm-add-customer"
            >
              고객대장 등록
            </button>
          </div>
        </form>
      )}

      {/* 2. Customer Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center text-stone-400 text-xs">
            조회된 조건을 가진 고객이 대장에 존재하지 않습니다.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isExpanded = selectedCustomerId === c.id;
            const isDeleting = deleteConfirmId === c.id;

            return (
              <div 
                key={c.id}
                className={`relative rounded-2xl border transition-all ${
                  isExpanded 
                    ? 'border-orange-300 ring-2 ring-orange-100 p-5 bg-white' 
                    : 'border-stone-200 hover:border-stone-300 p-4 bg-white shadow-sm'
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                
                {/* Regular card top portion */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{c.name} 고객님</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        c.type === '매수' 
                          ? 'bg-orange-100 text-orange-850' 
                          : c.type === '매도' 
                            ? 'bg-stone-100 text-stone-800' 
                            : 'bg-amber-100 text-amber-900'
                      }`}>
                        {c.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        c.status === '계약' 
                          ? 'bg-amber-150 text-stone-900 border border-amber-300' 
                          : 'bg-stone-50 text-stone-600 border border-stone-250'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-stone-400 font-mono" />
                      {c.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start">
                    <button
                      onClick={() => {
                        setSummarizingId(c.id);
                        setTranscriptText(c.notes);
                      }}
                      className="p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100/80 transition-all"
                      title="AI 통화 기록 요약 실행"
                      id={`btn-ai-summary-${c.id}`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>
                    {!isDeleting ? (
                      <button
                        onClick={() => setDeleteConfirmId(c.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
                        title="고객 정보 삭제"
                        id={`btn-delete-trigger-${c.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="absolute inset-0 bg-stone-950/5/80 backdrop-blur-xs rounded-2xl flex items-center justify-center p-4 z-10 animate-scaleUp">
                        <div className="bg-white border border-stone-200 rounded-xl p-3 max-w-xs text-center space-y-3.5 shadow-md">
                          <p className="text-[11px] font-bold text-stone-800">
                            동의 하에 김철수 대장에서 고객을 영구 제거할까요?
                          </p>
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 text-[10px] border border-stone-250 rounded bg-white text-stone-600 font-semibold"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCustomer(c.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2.5 py-1 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded"
                              id={`btn-delete-confirm-${c.id}`}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specifics layout */}
                <div className="mt-3.5 pt-3.5 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-1 py-1">
                    <Building2 className="h-3.5 w-3.5 text-stone-400" />
                    <div>
                      <span className="block text-[9px] text-stone-400 font-bold">희망 지역</span>
                      <span className="font-semibold text-stone-750">{c.interestedArea || '미지정'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 py-1">
                    <Wallet className="h-3.5 w-3.5 text-stone-400" />
                    <div>
                      <span className="block text-[9px] text-stone-400 font-bold">예상 예산</span>
                      <span className="font-mono font-bold text-orange-950">{c.budget || '미입력'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded state contents */}
                <div className="mt-4 space-y-3.5">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-1 mb-1.5 text-[10px] font-bold text-stone-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      상담 통화전사 원문
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line font-light">
                      {c.notes || '상담 기록이 들어있지 않습니다.'}
                    </p>
                  </div>

                  {/* AI Quick summaries */}
                  {c.aiSummary && (
                    <div className="p-3 bg-amber-50/50 border border-amber-250/60 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                        <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                        AI 자동 상담 비서 요약본
                      </div>
                      <p className="text-xs text-orange-950 leading-relaxed font-semibold">
                        {c.aiSummary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Collapsed state click summary helper */}
                <div className="text-[10px] text-stone-400 mt-3 text-right">
                  등록 장부일: {c.createdAt}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Dialog overlay for custom call transcription summary */}
      {summarizingId && (
        <div className="fixed inset-0 bg-stone-900/5/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-orange-600 animate-pulse" />
                AI 자동정리 (상담요약 엔진 구동)
              </h3>
              <button 
                onClick={() => {
                  setSummarizingId(null);
                  setTranscriptText('');
                }}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                취소
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-stone-500">
                고객과 통화 후 녹음된 음성을 기계 전사한 텍스트 또는 수기 상담 일지를 아래 붙여넣거나 직접 작성하십시오. Gemini 3.5 AI가 신속히 구조 정리합니다.
              </p>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="예) 분당 정자동 쪽 아파트 전세 찾는데, 애기 학교 보낼 한솔초등학교 가까운 남향이고 예산은 전세 5억으로 보고 있으며 즉시 협의해서 들어갈만한 집 구해줘"
                className="w-full h-32 border border-stone-250 p-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSummarizingId(null);
                  setTranscriptText('');
                }}
                className="px-4 py-2 border border-stone-250 text-xs font-semibold rounded-lg text-stone-600 hover:bg-stone-50 bg-white"
              >
                닫기
              </button>
              <button
                onClick={() => handleAiSummary(summarizingId, transcriptText)}
                disabled={isSummarizing || !transcriptText.trim()}
                className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                id="btn-ai-summary-execute"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    압축 요약 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    3초 요약 완료
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
