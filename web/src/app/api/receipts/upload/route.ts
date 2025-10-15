import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDir, saveBufferToFile } from "@/lib/fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs"; // 파일 시스템 사용을 위해

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart required" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const userDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads", session.uid);
  ensureDir(userDir);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const savedPath = saveBufferToFile(userDir, filename, buffer);
  const relPath = path.relative(process.cwd(), savedPath);

  // 임시로 빈 영수증 레코드 생성(분석 전)
  const receipt = await prisma.receipt.create({
    data: {
      ownerId: session.uid,
      imagePath: relPath,
      merchant: "",
      amountKRW: 0,
      account: "OTHER",
      parsedRawJson: {},
    },
  });

  return NextResponse.json({ id: receipt.id, imagePath: relPath });
}
