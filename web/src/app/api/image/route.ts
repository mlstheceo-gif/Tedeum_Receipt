import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get("path");
    
    if (!imagePath) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    // Vercel에서는 /tmp 디렉터리 사용
    const fullPath = path.join("/tmp", imagePath);
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const base64 = fileBuffer.toString("base64");
    const ext = path.extname(imagePath).slice(1) || "jpg";
    const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
    
    return NextResponse.json({ 
      data: `data:${mimeType};base64,${base64}` 
    });
  } catch (error) {
    console.error("Image serve error:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}
