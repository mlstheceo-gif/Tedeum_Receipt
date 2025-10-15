"use client";

export default function DownloadExcelButton() {
  function onClick() {
    // API 라우트로 이동하여 파일 다운로드 트리거
    window.location.href = "/api/receipts/export";
  }
  return (
    <button className="border rounded px-3 py-2 text-sm" onClick={onClick}>
      엑셀 다운로드
    </button>
  );
}


