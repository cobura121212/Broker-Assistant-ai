import * as XLSX from 'xlsx';
import { Customer, Property, Schedule, SmsLog } from '../types';

export function exportToExcel(data: {
  customers: Customer[];
  properties: Property[];
  schedules: Schedule[];
  smsLogs: SmsLog[];
}) {
  // 1. Create a dynamic workbook
  const wb = XLSX.utils.book_new();

  // 2. Prepare sheets data mapping
  const customersSheetData = data.customers.map((c) => ({
    "등록 ID": c.id,
    "고개명": c.name,
    "연락처": c.phone,
    "관심 지역": c.interestedArea,
    "예산 규모": c.budget,
    "임대/매매 조건": c.type,
    "진행 단계": c.status,
    "상담 메모": c.notes,
    "AI 상담 요약": c.aiSummary || "",
    "등록 기일": c.createdAt,
  }));

  const propertiesSheetData = data.properties.map((p) => ({
    "매물 ID": p.id,
    "소재지 주소": p.address,
    "희망 가격": p.price,
    "평형 및 면적": p.pyeong,
    "특이사항 메모": p.notes,
    "네이버 광고 문안": p.marketingAds?.naver || "",
    "블로그 광고 본문": p.marketingAds?.blog || "",
    "SMS 문자 광고": p.marketingAds?.sms || "",
    "등재 기일": p.createdAt,
  }));

  const schedulesSheetData = data.schedules.map((s) => ({
    "일정 ID": s.id,
    "고객 ID": s.customerId || "",
    "연관 고객명": s.customerName,
    "중요 일정명": s.title,
    "체결 기한일": s.date,
    "구분 단계": s.type,
    "처리 완료": s.completed ? "완료" : "미완료",
    "상세 설명": s.notes || "",
  }));

  const smsLogsSheetData = data.smsLogs.map((l) => ({
    "발송 ID": l.id,
    "수신 고개명": l.recipientName,
    "수신 전화번호": l.recipientPhone,
    "감사 기획유형": l.category,
    "발송 메시지 본문": l.message,
    "발송 일시": l.sentAt,
    "최종 전송상태": l.status === "sent" ? "발송성공" : "대기",
  }));

  // 3. Convert mapped data arrays to XLSX worksheets
  const wsCustomers = XLSX.utils.json_to_sheet(customersSheetData);
  const wsProperties = XLSX.utils.json_to_sheet(propertiesSheetData);
  const wsSchedules = XLSX.utils.json_to_sheet(schedulesSheetData);
  const wsSmsLogs = XLSX.utils.json_to_sheet(smsLogsSheetData);

  // 4. Append individual worksheets to workbook
  XLSX.utils.book_append_sheet(wb, wsCustomers, "고객관리 CRM");
  XLSX.utils.book_append_sheet(wb, wsProperties, "등록 매물대장");
  XLSX.utils.book_append_sheet(wb, wsSchedules, "중개 일정 캘린더");
  XLSX.utils.book_append_sheet(wb, wsSmsLogs, "단체 SMS 발송기록");

  // 5. Generate and download Excel bundle
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `센추리21_중개비서AI_전산백업_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromExcel(file: File): Promise<{
  customers: Customer[];
  properties: Property[];
  schedules: Schedule[];
  smsLogs: SmsLog[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const result: {
          customers: Customer[];
          properties: Property[];
          schedules: Schedule[];
          smsLogs: SmsLog[];
        } = {
          customers: [],
          properties: [],
          schedules: [],
          smsLogs: [],
        };

        // Parse CRM Sheet
        const customerSheet = workbook.Sheets["고객관리 CRM"];
        if (customerSheet) {
          const rawRows: any[] = XLSX.utils.sheet_to_json(customerSheet);
          result.customers = rawRows.map((r, index) => ({
            id: r["등록 ID"] || `c_imported_${index}`,
            name: r["고개명"] || "이름없음",
            phone: r["연락처"] || "",
            interestedArea: r["관심 지역"] || "",
            budget: r["예산 규모"] || "",
            type: (r["임대/매매 조건"] || "매수") as any,
            status: (r["진행 단계"] || "대기") as any,
            notes: r["상담 메모"] || "",
            aiSummary: r["AI 상담 요약"] || "",
            createdAt: r["등록 기일"] || new Date().toISOString().split('T')[0],
          }));
        }

        // Parse Properties Sheet
        const propertySheet = workbook.Sheets["등록 매물대장"];
        if (propertySheet) {
          const rawRows: any[] = XLSX.utils.sheet_to_json(propertySheet);
          result.properties = rawRows.map((r, index) => ({
            id: r["매물 ID"] || `p_imported_${index}`,
            address: r["소재지 주소"] || "주소 미지정",
            price: r["희망 가격"] || "",
            pyeong: r["평형 및 면적"] || "",
            images: [],
            notes: r["특이사항 메모"] || "",
            marketingAds: {
              naver: r["네이버 광고 문안"] || "",
              blog: r["블로그 광고 본문"] || "",
              sms: r["SMS 문자 광고"] || ""
            },
            createdAt: r["등재 기일"] || new Date().toISOString().split('T')[0],
          }));
        }

        // Parse Calendar Sheet
        const scheduleSheet = workbook.Sheets["중개 일정 캘린더"];
        if (scheduleSheet) {
          const rawRows: any[] = XLSX.utils.sheet_to_json(scheduleSheet);
          result.schedules = rawRows.map((r, index) => ({
            id: r["일정 ID"] || `s_imported_${index}`,
            customerId: r["고객 ID"] || undefined,
            customerName: r["연관 고객명"] || "미지정",
            title: r["중요 일정명"] || "새 중개일정",
            date: r["체결 기한일"] || new Date().toISOString().split('T')[0],
            type: (r["구분 단계"] || "계약일") as any,
            completed: r["처리 완료"] === "완료",
            notes: r["상상세 설명"] || "",
          }));
        }

        // Parse SMS logs Sheet
        const smsSheet = workbook.Sheets["단체 SMS 발송기록"];
        if (smsSheet) {
          const rawRows: any[] = XLSX.utils.sheet_to_json(smsSheet);
          result.smsLogs = rawRows.map((r, index) => ({
            id: r["발송 ID"] || `sms_imported_${index}`,
            recipientName: r["수신 고개명"] || "",
            recipientPhone: r["수신 전화번호"] || "",
            category: r["감사 기획유형"] || "직접작성",
            message: r["발송 메시지 본문"] || "",
            sentAt: r["발송 일시"] || new Date().toISOString(),
            status: r["최종 전송상태"] === "발송성공" ? "sent" : "pending"
          }));
        }

        resolve(result);
      } catch (err) {
        reject(new Error("엑셀 파싱 오류가 발생했습니다. 시트 규격을 확인하세요."));
      }
    };
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsArrayBuffer(file);
  });
}
