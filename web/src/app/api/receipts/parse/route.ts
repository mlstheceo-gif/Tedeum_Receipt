import { NextResponse } from "next/server";
import { prisma, } from "@/lib/db";
import { parseReceiptFromImageDataUrl, ParsedReceipt } from "@/lib/openai";
import { getSession } from "@/lib/auth";
import path from "path";
import { fileToDataUrl } from "@/lib/image";
import { AccountCategory } from "@prisma/client";

function toAccountCategory(input: string | undefined | null): AccountCategory {
  const v = (input ?? "").toUpperCase();
  const values = Object.values(AccountCategory);
  return (values.includes(v as AccountCategory) ? (v as AccountCategory) : AccountCategory.OTHER);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { receiptId } = await req.json() as { receiptId: string };
  const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
  if (!receipt || receipt.ownerId !== session.uid) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const absPath = path.join(process.cwd(), receipt.imagePath);
  const dataUrl = fileToDataUrl(absPath);
  const parsed = await parseReceiptFromImageDataUrl(dataUrl);

  function normalizeAmountKRW(input: ParsedReceipt["amountKRW"]): number {
    if (typeof input === "number" && Number.isFinite(input)) return Math.max(0, Math.trunc(input));
    if (typeof input === "string") {
      const digits = input.replace(/[^0-9]/g, "");
      if (digits.length === 0) return 0;
      return Math.max(0, parseInt(digits, 10));
    }
    return 0;
  }

  const updated = await prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      merchant: parsed.merchant ?? "",
      amountKRW: normalizeAmountKRW(parsed.amountKRW),
      account: toAccountCategory(parsed.accountCategory),
      receiptDate: parsed.date ? new Date(parsed.date) : receipt.receiptDate ?? new Date(),
      parsedRawJson: parsed,
    },
  });

  return NextResponse.json(updated);
}
