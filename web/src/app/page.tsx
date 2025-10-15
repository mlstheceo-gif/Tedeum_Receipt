import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  if (session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg">이미 로그인되어 있습니다.</p>
          <Link href="/dashboard" className="text-sky-600 underline">대시보드로 이동</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">로그인 하세요</h2>
        <div className="space-x-4">
          <Link href="/login" className="text-white bg-sky-600 px-4 py-2 rounded">로그인</Link>
          <Link href="/register" className="text-sky-600 underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
