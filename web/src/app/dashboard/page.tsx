import { prisma } from "@/lib/db";
import InlineUploader from "@/components/InlineUploader";
import ReceiptsTable from "@/components/ReceiptsTable";
import DownloadExcelButton from "@/components/DownloadExcelButton";

export default async function DashboardPage() {
  // 로그인 없이 모든 영수증 조회
  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, merchant: true, amountKRW: true, account: true, imagePath: true, receiptDate: true },
  });
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">영수증 관리</h2>
      <div className="flex items-center justify-between mb-3">
        <InlineUploader />
        <DownloadExcelButton />
      </div>
      <ReceiptsTable initialReceipts={receipts} />
    </div>
  );
}
