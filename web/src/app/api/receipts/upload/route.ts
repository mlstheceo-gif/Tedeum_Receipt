import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDir, saveBufferToFile } from "@/lib/fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs"; // 파일 시스템 사용을 위해

export async function POST(req: Request) {
  // 로그인 없이 업로드 허용
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

  // 기본 사용자 디렉터리 사용 (로그인 없이)
  const userDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads", "default");
  ensureDir(userDir);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const savedPath = saveBufferToFile(userDir, filename, buffer);
  const relPath = path.relative(process.cwd(), savedPath);

  // 기본 사용자 ID 사용 (TEDledger 사용자)
  const defaultUser = await prisma.user.findFirst();
  if (!defaultUser) {
    return NextResponse.json({ error: "no user found" }, { status: 500 });
  }

  // 임시로 빈 영수증 레코드 생성(분석 전)
  const receipt = await prisma.receipt.create({
    data: {
      ownerId: defaultUser.id,
      imagePath: relPath,
      merchant: "",
      amountKRW: 0,
      account: "OTHER",
      parsedRawJson: {},
    },
  });

  return NextResponse.json({ id: receipt.id, imagePath: relPath });
}
