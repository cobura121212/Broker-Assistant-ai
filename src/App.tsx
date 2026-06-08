import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Smartphone, 
  Scale, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Sparkles, 
  Menu, 
  X, 
  Lock,
  Compass,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react';

// Import modular panels
import { Dashboard } from './components/Dashboard';
import { CustomerManagement } from './components/CustomerManagement';
import { PropertyManagement } from './components/PropertyManagement';
import { ScheduleManagement } from './components/ScheduleManagement';
import { CardOcr } from './components/CardOcr';
import { ContractOcr } from './components/ContractOcr';
import { SmsBulk } from './components/SmsBulk';
import { LegalAdviser } from './components/LegalAdviser';
import { Settings } from './components/Settings';

// Import Types
import { Customer, Property, Schedule, SmsLog, AppDatabase } from './types';
import { exportToExcel } from './utils/excelBackup';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Database states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize database on startup
  useEffect(() => {
    fetchDb();
  }, []); // Safe primitive dependency array

  const fetchDb = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch server state (useful as starting pre-seeds)
      let serverData: AppDatabase | null = null;
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          serverData = await res.json();
        }
      } catch (backendErr) {
        console.warn("백엔드 수신 불가 (안심 로컬스토리지 활용 가능):", backendErr);
      }

      // 2. Load from localStorage if present to ensure serverless state persistent
      const localRaw = localStorage.getItem('C21_CRM_DB');
      if (localRaw) {
        try {
          const localData: AppDatabase = JSON.parse(localRaw);
          setCustomers(localData.customers || []);
          setProperties(localData.properties || []);
          setSchedules(localData.schedules || []);
          setSmsLogs(localData.smsLogs || []);
          return;
        } catch (e) {
          console.error("로컬스토리지 복원 실패:", e);
        }
      }

      // 3. Roll back to server pre-seeds if no custom local storage exists
      if (serverData) {
        setCustomers(serverData.customers || []);
        setProperties(serverData.properties || []);
        setSchedules(serverData.schedules || []);
        setSmsLogs(serverData.smsLogs || []);
      }
    } catch (err) {
      console.error("대동기화 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch full DB state to Express API and local sandbox
  const saveDb = async (updatedDb: AppDatabase) => {
    try {
      // 1. Immediate offline backup
      localStorage.setItem('C21_CRM_DB', JSON.stringify(updatedDb));

      // 2. Upload to central API (stateful Cloud Run)
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDb)
      });
    } catch (err) {
      console.warn("백엔드 장부 저장 실패 (로컬 디바이스에 데이터 자동 보관됨):", err);
    }
  };

  // 1. Customer CRUD Dispatch
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'createdAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const customer: Customer = {
      ...newCust,
      id: `c_${Date.now()}`,
      createdAt: today
    };
    const updated = [...customers, customer];
    setCustomers(updated);
    saveDb({ customers: updated, properties, schedules, smsLogs });
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    const updated = customers.map((c) => c.id === updatedCust.id ? updatedCust : c);
    setCustomers(updated);
    saveDb({ customers: updated, properties, schedules, smsLogs });
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveDb({ customers: updated, properties, schedules, smsLogs });
  };

  // 2. Property CRUD Dispatch
  const handleAddProperty = (newProp: Omit<Property, 'id' | 'createdAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const property: Property = {
      ...newProp,
      id: `p_${Date.now()}`,
      createdAt: today
    };
    const updated = [...properties, property];
    setProperties(updated);
    saveDb({ customers, properties: updated, schedules, smsLogs });
  };

  const handleUpdateProperty = (updatedProp: Property) => {
    const updated = properties.map((p) => p.id === updatedProp.id ? updatedProp : p);
    setProperties(updated);
    saveDb({ customers, properties: updated, schedules, smsLogs });
  };

  const handleDeleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    saveDb({ customers, properties: updated, schedules, smsLogs });
  };

  // 3. Schedule CRUD Dispatch
  const handleAddSchedule = (newSch: Omit<Schedule, 'id'>) => {
    const schedule: Schedule = {
      ...newSch,
      id: `s_${Date.now()}`
    };
    const updated = [...schedules, schedule];
    setSchedules(updated);
    saveDb({ customers, properties, schedules: updated, smsLogs });
  };

  const handleUpdateSchedule = (updatedSch: Schedule) => {
    const updated = schedules.map((s) => s.id === updatedSch.id ? updatedSch : s);
    setSchedules(updated);
    saveDb({ customers, properties, schedules: updated, smsLogs });
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveDb({ customers, properties, schedules: updated, smsLogs });
  };

  // 4. SMS logs CRUD Dispatch
  const handleAddSmsLog = (newLog: Omit<SmsLog, 'id' | 'sentAt' | 'status'>) => {
    const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const log: SmsLog = {
      ...newLog,
      id: `sms_${Date.now()}`,
      sentAt: today,
      status: 'sent'
    };
    const updated = [...smsLogs, log];
    setSmsLogs(updated);
    saveDb({ customers, properties, schedules, smsLogs: updated });
  };

  // 5. Excel Restoration Dispatch
  const handleRestoreData = (restored: {
    customers: Customer[];
    properties: Property[];
    schedules: Schedule[];
    smsLogs: SmsLog[];
  }) => {
    setCustomers(restored.customers);
    setProperties(restored.properties);
    setSchedules(restored.schedules);
    setSmsLogs(restored.smsLogs);
    saveDb(restored);
  };

  // Main Excel Download caller
  const handleExportAll = () => {
    exportToExcel({ customers, properties, schedules, smsLogs });
  };

  // Sidebar Menu list
  const menus = [
    { id: 'dashboard', label: '종합 대시보드', icon: LayoutDashboard },
    { id: 'customers', label: '고객관리(CRM)', icon: Users },
    { id: 'properties', label: '매물 정보 대장', icon: Building },
    { id: 'schedules', label: '중개 계약 일정', icon: Calendar },
    { id: 'card-ocr', label: '명함 촬영 OCR', icon: CreditCard },
    { id: 'contract-ocr', label: '계약서 비전 OCR', icon: FileText },
    { id: 'sms', label: '안부 단체문자', icon: Smartphone },
    { id: 'legal', label: 'AI 법률비서', icon: Scale },
    { id: 'settings', label: '전산 설정 포털', icon: SettingsIcon },
  ];

  const currentTabLabel = menus.find((m) => m.id === activeTab)?.label || '중개비서 AI';

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col antialiased">
      
      {/* Upper Navigation Header (Smartphone top bar) styled with warm ivory & subtle borders */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(43,40,35,0.02)]">
        <div className="flex items-center gap-2.5 text-left">
          {/* Collapse trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-all"
            id="mobile-hamburger-trigger"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="hidden sm:block rounded-xl bg-orange-500 text-white p-2 shadow-xs">
            <Compass className="h-5.5 w-5.5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs md:text-sm font-extrabold font-serif-header text-stone-900 tracking-tight">센추리21 중개비서 AI</span>
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-[8px] md:text-[9.5px] px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                <Lock className="h-2 w-2" />
                AI PRO
              </span>
            </div>
            <p className="text-[9px] md:text-[10px] text-stone-400 font-medium">
              (주) 센추리21 부동산 중개법인 전용 스마트 업무망
            </p>
          </div>
        </div>

        {/* Global Broker Account Badge */}
        <div className="flex items-center gap-2 text-right">
          <div className="hidden md:block">
            <span className="text-[10px] font-bold text-stone-400 block tracking-tight">CENTURY 21®</span>
            <span className="text-xs font-bold text-stone-850">소속 공인중개사 님</span>
          </div>
          <div className="h-8.5 w-8.5 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 font-bold text-xs text-orange-700 shadow-xs">
            C21
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Sidebar Frame - Permanent on Desktop, Overlay drawer on smartphone */}
        <aside 
          className={`fixed inset-y-0 left-0 top-[57px] bg-stone-100/65 border-r border-stone-200/80 w-64 z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static overflow-y-auto shrink-0 flex flex-col justify-between ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Main options lists */}
          <nav className="p-4 space-y-1 text-left">
            {menus.map((m) => {
              const Icon = m.icon;
              const isActive = activeTab === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveTab(m.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-stone-600 hover:text-orange-500 hover:bg-orange-100/50'
                  }`}
                  id={`nav-tab-${m.id}`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {m.label}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? 'translate-x-1 duration-200' : ''}`} />
                </button>
              );
            })}
          </nav>

          {/* Professional copyright signatures */}
          <div className="p-4 border-t border-stone-200/60 text-left space-y-2">
            <div className="flex items-center gap-1.5 bg-stone-100 p-2 text-stone-500 rounded-lg border border-stone-200">
              <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
              <span className="text-[9px] font-semibold leading-tight">
                센추리21 본부 전용 자동화 솔루션 상시 활성화 중
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile menu dark background shade */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* Main layout contents area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-3.5">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
              <p className="text-xs font-bold text-stone-600">(주) 센추리21 공식 중개 전산 정보 연동 동기화 중...</p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              
              {/* Central components multiplexers */}
              {activeTab === 'dashboard' && (
                <Dashboard 
                  customers={customers}
                  properties={properties}
                  schedules={schedules}
                  smsLogs={smsLogs}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                  onExport={handleExportAll}
                  onImportClick={() => {
                    setActiveTab('settings');
                    window.scrollTo(0, 0);
                  }}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerManagement 
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}

              {activeTab === 'properties' && (
                <PropertyManagement 
                  properties={properties}
                  onAddProperty={handleAddProperty}
                  onUpdateProperty={handleUpdateProperty}
                  onDeleteProperty={handleDeleteProperty}
                />
              )}

              {activeTab === 'schedules' && (
                <ScheduleManagement 
                  schedules={schedules}
                  onAddSchedule={handleAddSchedule}
                  onUpdateSchedule={handleUpdateSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              )}

              {activeTab === 'card-ocr' && (
                <CardOcr 
                  onAddCustomer={handleAddCustomer}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                />
              )}

              {activeTab === 'contract-ocr' && (
                <ContractOcr 
                  onAddSchedule={handleAddSchedule}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                />
              )}

              {activeTab === 'sms' && (
                <SmsBulk 
                  customers={customers}
                  smsLogs={smsLogs}
                  onAddSmsLog={handleAddSmsLog}
                />
              )}

              {activeTab === 'legal' && (
                <LegalAdviser />
              )}

              {activeTab === 'settings' && (
                <Settings 
                  customersCount={customers.length}
                  propertiesCount={properties.length}
                  schedulesCount={schedules.length}
                  smsLogsCount={smsLogs.length}
                  onExport={handleExportAll}
                  onRestoreData={handleRestoreData}
                />
              )}

            </div>
          )}
        </main>
      </div>

    </div>
  );
}
