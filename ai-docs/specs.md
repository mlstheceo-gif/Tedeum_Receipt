# 프로젝트 스펙 요약 (영수증처리앱)

- 목적: 영수증 이미지를 업로드하면 금액, 구매처, 계정(계정과목)을 자동 추출/분류
- 핵심 기능:
  - 회원가입/로그인(이메일+비밀번호)
  - 영수증 이미지 업로드(웹)
  - OpenAI Vision으로 OCR+정보추출(JSON)
  - 계정과목 분류(규칙+LLM 보정)
  - 대시보드에서 목록/상세 확인
- 기술 스택:
  - Next.js(App Router) + TypeScript + Tailwind CSS
  - Prisma(SQLite 기본) → User, Receipt, AccountCategory(enum)
  - JWT 쿠키 인증(서버 라우트에서 verify)
  - OpenAI SDK 사용(이미지 파싱, Chat Completions + image_url)
- 주요 경로(구현):
  - / (세션 유무에 따라 /login 또는 /dashboard)
  - /login, /register, /dashboard, /upload
- API 라우트(구현):
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
  - POST /api/receipts/upload
  - POST /api/receipts/parse
  - GET  /api/receipts
- 보안/운영:
  - .env.local에 OPENAI_API_KEY, JWT_SECRET 보관
  - 업로드 파일은 /public/uploads/{userId}/{uuid}.jpg 저장(런타임)
  - .gitignore에 .env*, node_modules, .next, public/uploads, uploads 포함
- UI 가이드:
  - 토스 사이트 톤앤매너 참고(심플, 여백, 선명한 타이포, 파란 포인트)
  - 참고: https://toss.im/

본 문서는 기능/구조 변경 시 항상 갱신한다.
