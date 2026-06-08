import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  Trash2, 
  AlertCircle, 
  CheckSquare, 
  Square,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Schedule } from '../types';

interface ScheduleManagementProps {
  schedules: Schedule[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export function ScheduleManagement({
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}: ScheduleManagementProps) {
  // Toggle additions drawer
  const [isAdding, setIsAdding] = useState(false);
  
  // Text inputs
  const [customerName, setCustomerName] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'계약일' | '중도금일' | '잔금일' | '만기일'>('계약일');
  const [notes, setNotes] = useState('');

  // Inline delete protective confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Submit Schedule
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !title || !date) return;
    onAddSchedule({
      customerName,
      title,
      date,
      type,
      completed: false,
      notes,
    });
    setCustomerName('');
    setTitle('');
    setDate('');
    setType('계약일');
    setNotes('');
    setIsAdding(false);
  };

  // Sort: pending first, then sort by proximity of date, completed at the end
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Calculate stats
  const pendingCount = schedules.filter(s => !s.completed).length;

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold font-serif-header text-stone-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            중개 중요 기한 캘린더
          </h2>
          <p className="text-xs text-stone-500">
            현재 마감 예정 대금 수납이나 계약일이 {pendingCount}건 지연되거나 완료 대기 중입니다.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all whitespace-nowrap"
          id="btn-add-schedule-trigger"
        >
          <Plus className="h-4 w-4" />
          중요 일정 수동추가
        </button>
      </div>

      {/* 1. Add Schedule Form overlay */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-amber-200 bg-amber-50/25 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b pb-1.5">
            <h3 className="text-xs font-bold text-stone-850">마일스톤 계약 약정 수기 기입</h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              닫기
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">연관 고객명 *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="예) 김철수"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">일정 제목/내용 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 정자한솔 가계약 약정 잔금일"
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">약정 지정일 *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">약정 성격</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
              >
                <option value="계약일">계약일</option>
                <option value="중도금일">중도금일</option>
                <option value="잔금일">잔금일</option>
                <option value="만기일">만기일</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">상세 대비 메모 (구비 서류 등)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예) 인감, 등본, 임시 수납 영수증 원본 매칭 지참 필수"
              className="w-full border border-stone-250 p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 text-stone-800 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 border border-stone-200 text-stone-600 bg-white rounded-lg hover:bg-stone-50 font-semibold"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm"
              id="btn-confirm-add-schedule"
            >
              일정 장부 추가
            </button>
          </div>
        </form>
      )}

      {/* 2. Timeline List Display */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-stone-100">
          {sortedSchedules.length === 0 ? (
            <div className="p-16 text-center text-stone-400 text-xs">
              현재 등록된 중개 약정 마일스톤이 존재하지 않습니다.
            </div>
          ) : (
            sortedSchedules.map((s) => {
              const isDeleting = deleteConfirmId === s.id;

              return (
                <div 
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 gap-3.5 transition-all relative ${
                    s.completed ? 'bg-stone-50/50' : 'bg-white hover:bg-stone-50/20'
                  }`}
                  style={{ contentVisibility: 'auto' }}
                >
                  
                  {/* Left Side: status checkbox + Date info */}
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => onUpdateSchedule({ ...s, completed: !s.completed })}
                      className="mt-1 text-orange-600 hover:text-orange-700 transition-all flex-shrink-0"
                      title={s.completed ? "미종결로 상태 복구" : "업무 종결 상태로 변환"}
                      id={`btn-complete-toggle-${s.id}`}
                    >
                      {s.completed ? (
                        <CheckSquare className="h-5 w-5 text-orange-500 fill-orange-50" />
                      ) : (
                        <Square className="h-5 w-5 text-stone-300" />
                      )}
                    </button>
                    <div className="space-y-1.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.completed 
                            ? 'bg-stone-100 text-stone-500' 
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {s.type}
                        </span>
                        <h4 className={`text-xs md:text-sm font-bold tracking-tight ${
                          s.completed ? 'line-through text-stone-400 font-light' : 'text-stone-900 font-semibold'
                        }`}>
                          {s.customerName} : {s.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-stone-300" />
                          기한 시한: {s.date}
                        </span>
                        {s.notes && (
                          <span className="text-stone-500 font-light">
                            설명: {s.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: delete triggers */}
                  <div className="flex items-center justify-end gap-2 pr-1">
                    {!isDeleting ? (
                      <button
                        onClick={() => setDeleteConfirmId(s.id)}
                        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                        title="기한 일정 삭제"
                        id={`btn-delete-schedule-trigger-${s.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <div 
                        className="absolute inset-x-0 inset-y-0 sm:inset-x-auto sm:right-4 bg-white/95 border border-stone-200 rounded-xl px-4 py-2 flex items-center justify-between gap-4 z-10 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] font-bold text-stone-800">
                          이 기한 일정을 캘린더에서 정말 삭제할까요?
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[10px] border border-stone-250 rounded bg-white text-stone-600 font-semibold"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteSchedule(s.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded"
                            id={`btn-delete-schedule-confirm-${s.id}`}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
