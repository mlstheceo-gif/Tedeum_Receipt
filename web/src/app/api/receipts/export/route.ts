import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.receipt.findMany({
    where: { ownerId: session.uid },
    orderBy: { createdAt: "desc" },
    select: { merchant: true, amountKRW: true, account: true, receiptDate: true },
  });

  const data = rows.map(r => ({
    날짜: r.receiptDate ? new Date(r.receiptDate).toISOString().slice(0,10) : "",
    구매처: r.merchant,
    금액: r.amountKRW,
    계정: r.account,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Receipts");
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=receipts.xlsx`,
    },
  });
}


