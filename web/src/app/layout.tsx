import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영수증처리앱",
  description: "영수증 업로드·파싱·분류",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-[1200px] px-2 sm:px-3 py-6">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-sky-600">영수증처리앱</h1>
            <nav className="space-x-4 text-sm">
              <a className="hover:underline" href="/login">로그인</a>
              <a className="hover:underline" href="/register">회원가입</a>
              <a className="hover:underline" href="/dashboard">대시보드</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
