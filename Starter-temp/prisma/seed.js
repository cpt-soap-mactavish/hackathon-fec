const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Create Admin User
  const adminEmail = 'admin@stockmaster.com'
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: 'AdminUser',
      name: 'System Admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log(`Created user: ${admin.username}`)

  // 2. Create Default Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: {
      name: 'Main Warehouse',
      location: 'Headquarters',
    },
  })
  console.log(`Created warehouse: ${warehouse.name}`)

  // 3. Create Sample Products
  const products = [
    {
      name: 'Laptop Pro X',
      sku: 'LAP-PRO-001',
      category: 'Electronics',
      uom: 'PCS',
      minStock: 10,
    },
    {
      name: 'Wireless Mouse',
      sku: 'ACC-MSE-002',
      category: 'Accessories',
      uom: 'PCS',
      minStock: 50,
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    })
    console.log(`Created product: ${product.name}`)

    // Add initial stock (optional, or separate transaction)
    await prisma.stock.upsert({
        where: {
            productId_warehouseId: {
                productId: product.id,
                warehouseId: warehouse.id
            }
        },
        update: {},
        create: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: 100
        }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
