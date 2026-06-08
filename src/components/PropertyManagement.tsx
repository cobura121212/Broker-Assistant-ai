import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Coins, 
  Maximize, 
  Trash2, 
  Sparkles, 
  Copy, 
  ArrowRight, 
  Check, 
  Compass, 
  Eye, 
  Plus,
  Clock,
  ExternalLink,
  Map,
  X
} from 'lucide-react';
import { Property } from '../types';

interface PropertyManagementProps {
  properties: Property[];
  onAddProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
}

export function PropertyManagement({
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: PropertyManagementProps) {
  // Toggle addition state
  const [isAdding, setIsAdding] = useState(false);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [pyeong, setPyeong] = useState('');
  const [notes, setNotes] = useState('');

  // Selected property for Map display / Ad generator
  const [activePropertyId, setActivePropertyId] = useState<string | null>(properties[0]?.id || null);
  
  // AI copywriting generator loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPropertyId, setGenerationPropertyId] = useState<string | null>(null);

  // Copy-to-clipboard state tracking (channel: 'naver' | 'blog' | 'sms')
  const [copiedChannel, setCopiedChannel] = useState<{ [key: string]: boolean }>({});

  // Protect deletion inline overlay
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Submit property
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !price || !pyeong) return;
    onAddProperty({
      address,
      price,
      pyeong,
      notes,
      images: [],
    });
    setAddress('');
    setPrice('');
    setPyeong('');
    setNotes('');
    setIsAdding(false);
  };

  // Call Server-side AI writer
  const handleGenerateAds = async (p: Property) => {
    setIsGenerating(true);
    setGenerationPropertyId(p.id);
    try {
      const response = await fetch('/api/ai/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: p.address,
          price: p.price,
          pyeong: p.pyeong,
          notes: p.notes,
        }),
      });
      const data = await response.json();
      if (data.naver || data.blog || data.sms) {
        onUpdateProperty({
          ...p,
          marketingAds: {
            naver: data.naver || "",
            blog: data.blog || "",
            sms: data.sms || "",
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      setGenerationPropertyId(null);
    }
  };

  // Fast Clipboard copy helper
  const triggerCopy = (text: string, channelKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel((prev) => ({ ...prev, [channelKey]: true }));
    setTimeout(() => {
      setCopiedChannel((prev) => ({ ...prev, [channelKey]: false }));
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left List of properties (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold font-serif-header text-stone-900">대표 등록 매물대장</h2>
            <p className="text-xs text-stone-500">현재 중개 위탁받아 진행 중인 소유 부지 일람</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all"
            id="btn-add-property-trigger"
          >
            <Plus className="h-4 w-4" />
            매물 수임 등록
          </button>
        </div>

        {/* Create Property form overlay */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="border border-amber-200 bg-amber-50/25 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <h3 className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-orange-600" />
                위탁 세대 상세 기입
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">소재지 목적물 주소 *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="예) 경기도 성남시 분당구 구미동 무지개마을 402동 501호"
                  className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">매매가 또는 임대료 권장선 *</label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예) 11억 5천만원 또는 전세 4억"
                  className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">평형 및 자산 면적 *</label>
                <input
                  type="text"
                  required
                  value={pyeong}
                  onChange={(e) => setPyeong(e.target.value)}
                  placeholder="예) 31평 (전용 84㎡)"
                  className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">자산 전출입 가능 기일 및 특이사항</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예) 세탁기 냉장고 에어컨 옵션, 욕실 신규 욕조 시공 완료, 즉시 전차 상호 협의 가능"
                className="w-full h-20 border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 border border-stone-200 text-stone-600 bg-white rounded-lg hover:bg-stone-50 font-semibold"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm"
                id="btn-confirm-add-property"
              >
                대장 정식 등재
              </button>
            </div>
          </form>
        )}

        {/* Listing cards */}
        <div className="space-y-4">
          {properties.length === 0 ? (
            <div className="py-20 text-center text-stone-400 text-xs">
              위탁 수임한 매물이 없습니다. 상단에서 [매물 수임 등록]을 진행하십시오.
            </div>
          ) : (
            properties.map((p) => {
              const isActive = activePropertyId === p.id;
              const isDeleting = deleteConfirmId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => !isDeleting && setActivePropertyId(p.id)}
                  className={`relative overflow-hidden rounded-2xl border cursor-pointer p-4 md:p-5 transition-all text-left ${
                    isActive 
                      ? 'border-orange-400 ring-2 ring-orange-50 bg-white shadow-xs' 
                      : 'border-stone-200 hover:border-stone-250 bg-white shadow-xs hover:bg-stone-50/30'
                  }`}
                  style={{ contentVisibility: 'auto' }}
                >
                  
                  {/* Card Main portion */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 max-w-sm sm:max-w-md md:max-w-xl">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-4.5 w-4.5 text-orange-600 flex-shrink-0" />
                        <h3 className="text-xs font-bold text-stone-900 tracking-tight leading-snug">
                          {p.address}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600">
                        <span className="flex items-center gap-1 font-mono text-orange-950 font-bold bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                          <Coins className="h-3.5 w-3.5 text-orange-600" />
                          {p.price}
                        </span>
                        <span className="flex items-center gap-1 text-stone-500 font-medium">
                          <Maximize className="h-3.5 w-3.5 text-stone-400" />
                          평형: {p.pyeong}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-light truncate max-w-sm">
                        {p.notes || '기타 특약 및 특이사항 없음'}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 self-stretch">
                      
                      {/* Safety delete inline trigger */}
                      {!isDeleting ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(p.id);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all self-end"
                          id={`btn-delete-property-trigger-${p.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <div 
                          className="absolute inset-0 bg-stone-950/5/80 backdrop-blur-xs rounded-2xl flex items-center justify-center p-4 z-10 animate-scaleUp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-white border border-stone-200 rounded-xl p-3 max-w-xs text-center space-y-3.5 shadow-md">
                            <p className="text-[11px] font-bold text-stone-800">
                              위탁받은 해당 매물을 데이터베이스에서 가차 없이 지울까요?
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
                                  onDeleteProperty(p.id);
                                  setDeleteConfirmId(null);
                                  if (activePropertyId === p.id) {
                                    setActivePropertyId(null);
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded"
                                id={`btn-delete-property-confirm-${p.id}`}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Stamp */}
                  <div className="text-[9.5px] text-stone-400 mt-3 text-right">
                    위탁 의뢰일: {p.createdAt}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Details, Map View & Ad copies (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {activePropertyId ? (
          (() => {
            const selectedProp = properties.find((p) => p.id === activePropertyId);
            if (!selectedProp) return null;

            return (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6 shadow-sm">
                
                {/* Visual Section Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
                    <Compass className="h-4 w-4 text-orange-600" />
                    센추리21 지도 및 마케팅 센터
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight leading-normal">
                    {selectedProp.address}
                  </h3>
                </div>

                {/* Interactive Map Visualisation */}
                <div className="rounded-xl overflow-hidden border border-stone-150 p-2.5 bg-stone-50 space-y-2.5">
                  <div className="relative h-44 rounded-lg bg-orange-100/55 border border-orange-200/40 flex flex-col items-center justify-center text-center p-4">
                    {/* Compass Grid background */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <MapPin className="h-7 w-7 text-orange-600 mb-1.5 animate-bounce" />
                    <span className="text-[11px] font-bold text-stone-850 block px-2.5 truncate max-w-xs bg-white/80 py-1 rounded-full shadow-xs">
                      {selectedProp.address}
                    </span>
                    <span className="text-[9px] text-stone-400 mt-1 font-mono">가상 위치 확인 및 포털 길찾기 동기화 가능</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedProp.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      referrerPolicy="no-referrer"
                      className="py-2.5 rounded-lg border border-stone-200 text-center text-[11px] font-bold text-stone-700 bg-white hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/20 active:bg-orange-50 transition-all flex items-center justify-center gap-1"
                      id="btn-naver-map-external"
                    >
                      <Map className="h-3.5 w-3.5 text-orange-600" />
                      네이버 지도 열기
                    </a>
                    <a
                      href={`https://map.kakao.com/?q=${encodeURIComponent(selectedProp.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      referrerPolicy="no-referrer"
                      className="py-2.5 rounded-lg border border-stone-200 text-center text-[11px] font-bold text-stone-700 bg-white hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/20 active:bg-orange-50 transition-all flex items-center justify-center gap-1"
                      id="btn-kakao-map-external"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-orange-600" />
                      카카오맵 열기
                    </a>
                  </div>
                </div>

                {/* AI Ad copies */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">AI 부동산 채널 광고 제안</span>
                    <button
                      onClick={() => handleGenerateAds(selectedProp)}
                      disabled={isGenerating}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
                      id="btn-ai-ad-generate"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="h-3 w-3 animate-spin" />
                          광고 카피작성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          원터치 3종 카피
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Naver Property channel */}
                    <div className="p-3 bg-stone-50 border border-stone-250/50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-stone-600">품격 네이버 부동산 전송용</span>
                        {selectedProp.marketingAds?.naver && (
                          <button
                            onClick={() => triggerCopy(selectedProp.marketingAds!.naver, 'naver')}
                            className="text-stone-400 hover:text-orange-600 flex items-center gap-1 text-[9px] font-bold"
                          >
                            {copiedChannel['naver'] ? <Check className="h-3.5 w-3.5 text-orange-600" /> : <Copy className="h-3 w-3" />}
                            {copiedChannel['naver'] ? "복사완료" : "복사"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-stone-850 leading-relaxed font-semibold">
                        {selectedProp.marketingAds?.naver || '매물 세대 정보 기반으로 신선한 네이버 부동산 문장을 생성해 주세요.'}
                      </p>
                    </div>

                    {/* Blog posting */}
                    <div className="p-3 bg-stone-50 border border-stone-250/50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-stone-600">블로그 홍보용 포스트 본문</span>
                        {selectedProp.marketingAds?.blog && (
                          <button
                            onClick={() => triggerCopy(selectedProp.marketingAds!.blog, 'blog')}
                            className="text-stone-400 hover:text-orange-600 flex items-center gap-1 text-[9px] font-bold"
                          >
                            {copiedChannel['blog'] ? <Check className="h-3.5 w-3.5 text-orange-600" /> : <Copy className="h-3 w-3" />}
                            {copiedChannel['blog'] ? "복사완료" : "복사"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-stone-750 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-light">
                        {selectedProp.marketingAds?.blog || '상단 원터치 버튼을 누르면 품격 블로그 소개 전문이 완성됩니다.'}
                      </p>
                    </div>

                    {/* SMS notice */}
                    <div className="p-3 bg-stone-50 border border-stone-250/50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-stone-600">SMS 발송 광고용 문자 본문</span>
                        {selectedProp.marketingAds?.sms && (
                          <button
                            onClick={() => triggerCopy(selectedProp.marketingAds!.sms, 'sms')}
                            className="text-stone-400 hover:text-orange-600 flex items-center gap-1 text-[9px] font-bold"
                          >
                            {copiedChannel['sms'] ? <Check className="h-3.5 w-3.5 text-orange-600" /> : <Copy className="h-3 w-3" />}
                            {copiedChannel['sms'] ? "복사완료" : "복사"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-orange-950 leading-relaxed font-bold">
                        {selectedProp.marketingAds?.sms || 'SMS 문자 세트를 생성하면 복사해서 단체발송 탭에서 보낼 수 있습니다.'}
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-150 p-12 text-center text-stone-400 text-xs">
            지도를 보거나 광고 문구를 만들려면 매물을 선택해 주십시오.
          </div>
        )}
      </div>

    </div>
  );
}
