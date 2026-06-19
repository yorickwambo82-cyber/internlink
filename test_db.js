const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fix existing student profiles by assigning them "Computer Science" so notifications can be tested
  await prisma.studentProfile.updateMany({
    where: { fieldOfStudy: null },
    data: { fieldOfStudy: "Computer Science" }
  });
  
  const students = await prisma.studentProfile.findMany();
  console.log('Students updated. Current state:', students.map(s => ({ id: s.id, fieldOfStudy: s.fieldOfStudy })));
}

main().finally(() => prisma.$disconnect());
