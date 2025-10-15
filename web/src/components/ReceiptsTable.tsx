"use client";
import { useEffect, useState } from "react";

type Item = { id: string; merchant: string; amountKRW: number; account: string; imagePath: string; receiptDate?: string | Date | null };

const accounts = ["FOOD","TRANSPORT","GROCERIES","UTILITIES","ENTERTAINMENT","HEALTHCARE","EDUCATION","OTHER"] as const;

function toPublicUrl(p: string) { 
  // Vercel에서는 API를 통해 이미지 서빙
  return `/api/image?path=${encodeURIComponent(p)}`;
}
function fmtDate(d?: string | Date | null) {
  if (!d) return ""; // date input에는 빈 문자열 허용
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toYmd(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0,10);
}

export default function ReceiptsTable({ initialReceipts }: { initialReceipts: Item[] }) {
  const [rows, setRows] = useState<Item[]>(initialReceipts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reparsingId, setReparsingId] = useState<string | null>(null);
  const [tableMode, setTableMode] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compact, setCompact] = useState<boolean>(true);
  const [showImages, setShowImages] = useState<boolean>(true);

  async function save(row: Item) {
    setSavingId(row.id);
    const res = await fetch(`/api/receipts/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: row.merchant,
        amountKRW: Number(row.amountKRW) || 0,
        account: row.account,
        receiptDate: toYmd(row.receiptDate),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRows(prev => prev.map(r => r.id === row.id ? updated : r));
    }
    setSavingId(null);
  }

  async function reparse(id: string) {
    try {
      setReparsingId(id);
      const res = await fetch('/api/receipts/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId: id })
      });
      if (res.ok) {
        const updated = await res.json();
        setRows(prev => prev.map(r => r.id === id ? {
          ...r,
          merchant: updated.merchant ?? r.merchant,
          amountKRW: updated.amountKRW ?? r.amountKRW,
          account: updated.account ?? r.account,
          receiptDate: updated.receiptDate ?? r.receiptDate,
          imagePath: updated.imagePath ?? r.imagePath,
        } : r));
      }
    } finally {
      setReparsingId(null);
    }
  }

  return (
    <div>
      {/* props가 갱신되면 테이블 상태도 동기화하여 업로드/분석 후 자동 반영 */}
      <SyncRows initialReceipts={initialReceipts} setRows={setRows} />
      <div className="mb-2 flex items-center gap-2 text-sm">
        <button className="border border-slate-200 rounded-md px-3 h-8 shadow-sm hover:bg-slate-50" onClick={()=>setTableMode(v=>!v)}>
          {tableMode ? "일반 모드" : "테이블 모드"}
        </button>
        <button className="border border-slate-200 rounded-md px-3 h-8 shadow-sm hover:bg-slate-50" onClick={()=>setCompact(v=>!v)}>
          {compact ? "보통 높이" : "컴팩트"}
        </button>
        <button className="border border-slate-200 rounded-md px-3 h-8 shadow-sm hover:bg-slate-50" onClick={()=>setShowImages(v=>!v)}>
          {showImages ? "이미지 숨김" : "이미지 표시"}
        </button>
      </div>
      <div className="border border-slate-200 rounded-md">
        <table className="w-full text-xs table-auto">
        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
          <tr>
              <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">재분석</th>
              <th className="px-2 sm:px-3 py-2 text-left whitespace-nowrap">날짜</th>
              <th className="px-2 sm:px-3 py-2 text-left whitespace-nowrap">구매처</th>
              <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">금액</th>
              <th className="px-2 sm:px-3 py-2 text-left whitespace-nowrap">계정</th>
              <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">저장</th>
              <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">행 편집</th>
              {showImages && <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">이미지</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50/60">
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle text-center whitespace-nowrap`}>
                <button
                  className="inline-flex items-center justify-center border border-slate-200 rounded-md px-2 h-8 shadow-sm hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
                  disabled={reparsingId===r.id}
                  onClick={()=>reparse(r.id)}
                >{reparsingId===r.id? '재분석중…' : '재분석'}</button>
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle text-slate-800 whitespace-nowrap`}>
                <input
                  className="w-32 h-8 border border-slate-200 rounded-md px-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  type="date"
                  value={fmtDate(r.receiptDate)}
                  onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x, receiptDate: e.target.value}:x))}
                  />
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle whitespace-nowrap`}>
                <input
                  className="w-44 sm:w-56 h-8 border border-slate-200 rounded-md px-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={r.merchant}
                  onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x, merchant: e.target.value}:x))} />
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle whitespace-nowrap`}>
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <input
                    className="w-36 sm:w-48 h-8 border border-slate-200 rounded-md px-2 text-right shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    type="number" min={0} step={1} value={r.amountKRW}
                    onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x, amountKRW: Number(e.target.value)||0}:x))} />
                  <span className="text-slate-400">원</span>
                </div>
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle whitespace-nowrap`}>
                <div className="flex items-center whitespace-nowrap">
                  <select
                    className="w-36 sm:w-48 h-8 border border-slate-200 rounded-md px-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={r.account}
                    onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x, account: e.target.value}:x))}>
                    {accounts.map(a=> <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle text-center whitespace-nowrap`}>
                <button className="inline-flex items-center justify-center bg-sky-600 text-white rounded-md px-2 h-8 disabled:opacity-50 shadow-sm"
                  disabled={savingId===r.id}
                  onClick={()=>save(r)}>
                  {savingId===r.id? "저장중..." : "저장"}
                </button>
              </td>
              <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} space-x-2 align-middle text-center whitespace-nowrap`}>
                <button className="text-red-600 text-sm hover:underline" onClick={async()=>{
                  await fetch(`/api/receipts/${r.id}`, { method: "DELETE" });
                  setRows(prev=>prev.filter(x=>x.id!==r.id));
                }}>삭제</button>
                <button className="text-sm hover:underline" onClick={()=>{
                  setRows(prev=>{
                    const idx = prev.findIndex(x=>x.id===r.id);
                    if (idx<=0) return prev;
                    const copy = [...prev];
                    [copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]];
                    return copy;
                  });
                }}>위로</button>
                <button className="text-sm hover:underline" onClick={()=>{
                  setRows(prev=>{
                    const idx = prev.findIndex(x=>x.id===r.id);
                    if (idx<0 || idx>=prev.length-1) return prev;
                    const copy = [...prev];
                    [copy[idx+1], copy[idx]] = [copy[idx], copy[idx+1]];
                    return copy;
                  });
                }}>아래로</button>
              </td>
              {showImages && (
                <td className={`px-2 sm:px-3 ${compact? 'py-1.5':'py-2'} align-middle text-center whitespace-nowrap`}>
                  <button onClick={()=>setPreviewUrl(toPublicUrl(r.imagePath))} className="inline-block">
                    <img src={toPublicUrl(r.imagePath)} alt="영수증" className="h-14 w-auto rounded-md border border-slate-200 shadow-sm" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={()=>setPreviewUrl(null)}>
          <div className="bg-white p-3 rounded max-w-[90vw] max-h-[90vh]" onClick={(e)=>e.stopPropagation()}>
            <img src={previewUrl} alt="미리보기" className="max-h-[80vh] w-auto" />
            <div className="text-right mt-2">
              <button className="border rounded px-3 py-1 text-sm" onClick={()=>setPreviewUrl(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SyncRows({ initialReceipts, setRows }: { initialReceipts: Item[]; setRows: (v: Item[]) => void }) {
  useEffect(() => {
    setRows(initialReceipts);
  }, [initialReceipts, setRows]);
  return null;
}


