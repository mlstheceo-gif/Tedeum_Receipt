import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const receipts = await prisma.receipt.findMany({ where: { ownerId: session.uid }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(receipts);
}
