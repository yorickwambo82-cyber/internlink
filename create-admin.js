const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user in production database...');
  
  const email = 'admin@test.com';
  const password = '123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin user already exists! Updating role to ADMIN just in case...');
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', active: true, verified: true }
    });
    console.log('Done!');
    return;
  }

  // Create new admin
  const user = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      verified: true,
      active: true,
    },
  });

  console.log(`Successfully created admin account!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
