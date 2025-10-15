import { redirect } from "next/navigation";

export default async function Home() {
  // 로그인 없이 바로 대시보드로 이동
  redirect("/dashboard");
}
