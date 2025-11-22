const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password ? u.password.substring(0, 10) + '...' : 'NULL',
      role: u.role
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
