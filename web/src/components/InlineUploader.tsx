"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function InlineUploader() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleFilesSingle(file: File | null) {
    if (!file) return;
    try {
      setStatus("업로드 중...");
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/receipts/upload", { method: "POST", body: fd });
      if (!up.ok) throw new Error("업로드 실패");
      const data: { id: string } = await up.json();
      setStatus("분석 중...");
      const parse = await fetch("/api/receipts/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId: data.id }),
      });
      if (!parse.ok) throw new Error("분석 실패");
      setStatus("완료!");
      router.refresh(); // 새로고침 없이 서버 컴포넌트 재패치
      setStatus("");
    } catch (e) {
      setStatus((e as Error).message || "오류");
    }
  }

  async function handleFilesMulti(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      // 순차 업로드/분석 후 즉시 갱신
      await handleFilesSingle(file);
    }
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFilesSingle(e.target.files?.[0] ?? null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesMulti(e.target.files)}
      />
      <button
        className="bg-sky-600 text-white rounded px-3 py-2 text-sm"
        onClick={() => cameraInputRef.current?.click()}
      >
        카메라로 촬영
      </button>
      <button
        className="border border-sky-600 text-sky-700 rounded px-3 py-2 text-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        사진에서 선택
      </button>
      {status && <span className="text-sm text-gray-600 ml-2">{status}</span>}
    </div>
  );
}


