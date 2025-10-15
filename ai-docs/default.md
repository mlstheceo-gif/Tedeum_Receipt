# 기본 규칙

- 코드 스타일: TypeScript 우선, 명확한 변수명/함수명, 조기 반환 선호
- 주석: 초심자 학습을 돕는 핵심 설명만(불필요한 장황한 주석 지양)
- 인증: 비밀번호는 bcrypt로 해시 저장, 세션은 JWT(HttpOnly 쿠키)
- 데이터:
  - 금액: 정수(원) 또는 Decimal 보관. 초기에는 정수 KRW.
  - 계정과목: enum으로 관리(FOOD, TRANSPORT, GROCERIES, UTILITIES, ENTERTAINMENT, HEALTHCARE, EDUCATION, OTHER)
- 업로드: 이미지 확장자(jpg/png/webp)만 허용, 10MB 제한(초기값)
- 에러 처리: Zod로 입력 검증, 4xx/5xx 구분하여 반환
- OpenAI: JSON 모드로 amount/merchant/accountCategory를 강제 파싱
- 폴더:
  - app/ (Next.js App Router)
  - app/api/* (Route Handlers)
  - lib/ (auth, db, validators, openai 등)
  - components/ (UI)
  - prisma/schema.prisma
  - uploads/ (런타임 생성)
