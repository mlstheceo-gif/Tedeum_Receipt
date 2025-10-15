const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

async function main() {
  const prisma = new PrismaClient();
  try {
    const username = "TEDadmin";
    const password = "TEDadmin";
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.create({ data: { username, password: hashed, email: null } });
      console.log("Admin user created: TEDadmin");
    } else {
      console.log("Admin user already exists: TEDadmin");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
