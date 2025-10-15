import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE_NAME = "session";

export async function register(username: string, password: string, email?: string | null) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("username already exists");
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hashed, email: email ?? null } });
  return user;
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  const token = jwt.sign({ uid: user.id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  (await cookies()).set({ name: COOKIE_NAME, value: token, httpOnly: true, sameSite: "lax", path: "/" });
  return user;
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string; username: string };
    return payload;
  } catch {
    return null;
  }
}
