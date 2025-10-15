import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import InlineUploader from "@/components/InlineUploader";
import ReceiptsTable from "@/components/ReceiptsTable";
import DownloadExcelButton from "@/components/DownloadExcelButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return <div className="text-center">로그인이 필요합니다.</div>;
  const receipts = await prisma.receipt.findMany({
    where: { ownerId: session.uid },
    orderBy: { createdAt: "desc" },
    select: { id: true, merchant: true, amountKRW: true, account: true, imagePath: true, receiptDate: true },
  });
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">내 영수증</h2>
      <div className="flex items-center justify-between mb-3">
        <InlineUploader />
        <DownloadExcelButton />
      </div>
      <ReceiptsTable initialReceipts={receipts} />
    </div>
  );
}
