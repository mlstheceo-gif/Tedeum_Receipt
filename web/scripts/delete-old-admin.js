const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    // 먼저 TEDadmin 사용자의 영수증들을 삭제
    const receiptsDeleted = await prisma.receipt.deleteMany({
      where: { owner: { username: "TEDadmin" } }
    });
    console.log(`Deleted ${receiptsDeleted.count} receipts from TEDadmin`);
    
    // 그 다음 TEDadmin 사용자 삭제
    const deleted = await prisma.user.deleteMany({ 
      where: { username: "TEDadmin" } 
    });
    console.log(`Deleted ${deleted.count} TEDadmin user(s)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
