const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting...");
    const users = await prisma.user.findMany();
    console.log("Success! Users count:", users.length);
    console.log("Users:", users);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
