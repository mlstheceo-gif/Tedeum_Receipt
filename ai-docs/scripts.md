# 자주 쓰는 스크립트

# 개발 서버
npm run dev

# Prisma 마이그레이션
npx prisma migrate dev --name init

# Prisma 클라이언트 생성(스키마 변경 시)
npx prisma generate

# 린트/포맷(생성 후 채움)
npm run lint
npm run format
