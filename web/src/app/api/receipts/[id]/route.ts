import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AccountCategory } from "@prisma/client";

const schema = z.object({
  merchant: z.string().min(0).max(200).optional(),
  amountKRW: z.number().int().min(0).optional(),
  account: z.enum(["FOOD","TRANSPORT","GROCERIES","UTILITIES","ENTERTAINMENT","HEALTHCARE","EDUCATION","OTHER"]).optional(),
  receiptDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: Request, context: any) {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = schema.parse(body);

  const existed = await prisma.receipt.findUnique({ where: { id: params.id } });
  if (!existed || existed.ownerId !== session.uid) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const updated = await prisma.receipt.update({
    where: { id: params.id },
    data: {
      merchant: data.merchant ?? existed.merchant,
      amountKRW: data.amountKRW ?? existed.amountKRW,
      account: (data.account as AccountCategory | undefined) ?? existed.account,
      receiptDate: data.receiptDate ? new Date(data.receiptDate) : existed.receiptDate,
    },
    select: { id: true, merchant: true, amountKRW: true, account: true, imagePath: true, receiptDate: true },
  });

  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_req: Request, context: any) {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const existed = await prisma.receipt.findUnique({ where: { id: params.id } });
  if (!existed || existed.ownerId !== session.uid) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.receipt.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


