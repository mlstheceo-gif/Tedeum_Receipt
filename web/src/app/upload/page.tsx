"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/receipts/upload", { method: "POST", body: fd });
    if (!up.ok) { setMsg("업로드 실패"); return; }
    const data = await up.json();
    const parse = await fetch("/api/receipts/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiptId: data.id }) });
    if (!parse.ok) { setMsg("분석 실패"); return; }
    setMsg("완료!");
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">영수증 업로드</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="file" accept="image/*" capture="environment" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        <button className="bg-sky-600 text-white rounded px-4 py-2">업로드 및 분석</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}
