import { NextResponse } from "next/server";
import { z } from "zod";
import { register } from "@/lib/auth";

const schema = z.object({ username: z.string().min(3), password: z.string().min(8), email: z.string().email().optional() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, email } = schema.parse(body);
    const user = await register(username, password, email);
    return NextResponse.json({ id: user.id, username: user.username });
  } catch (e: unknown) {
    const message = e instanceof z.ZodError ? e.message : (e as Error).message ?? "invalid";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
