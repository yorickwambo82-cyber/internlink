const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: { entity: 'Fapshi' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("Recent Webhook Logs:");
  logs.forEach(l => console.log(JSON.stringify(l, null, 2)));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
