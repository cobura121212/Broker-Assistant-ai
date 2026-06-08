export interface Customer {
  id: string;
  name: string;
  phone: string;
  interestedArea: string;
  budget: string; // e.g., "12억", "5000/250"
  type: '매수' | '매도' | '임대' | '임차';
  status: '대기' | '미팅' | '진행' | '계약';
  notes: string;
  aiSummary?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  address: string;
  price: string;
  pyeong: string; // 평형 e.g., "34평 (전용 84㎡)"
  images: string[]; // Base64 or standard asset names
  notes: string;
  isMapVisible?: boolean;
  marketingAds?: {
    naver: string;
    blog: string;
    sms: string;
  };
  createdAt: string;
}

export interface Schedule {
  id: string;
  customerId?: string;
  customerName: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: '계약일' | '중도금일' | '잔금일' | '만기일';
  completed: boolean;
  notes?: string;
}

export interface SmsLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  category: string; // '새해인사' | '추석인사' | '생일' | '계약1주년' | '직접작성'
  message: string;
  sentAt: string;
  status: 'sent' | 'pending';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AppDatabase {
  customers: Customer[];
  properties: Property[];
  schedules: Schedule[];
  smsLogs: SmsLog[];
}
