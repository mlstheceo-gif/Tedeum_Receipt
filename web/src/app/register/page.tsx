"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, email: email || undefined }) });
    if (res.ok) location.href = "/login"; else setMsg((await res.json()).error ?? "회원가입 실패");
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">회원가입</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="아이디(3자 이상)" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="이메일(선택)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="비밀번호(8자 이상)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-sky-600 text-white rounded py-2">가입하기</button>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>
    </div>
  );
}
