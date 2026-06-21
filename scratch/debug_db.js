const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log("Recent users:", users);

  const subs = await prisma.subscription.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log("Recent subs:", subs);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
