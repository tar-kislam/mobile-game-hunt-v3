import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories first
  const gameCategory = await prisma.category.upsert({
    where: { slug: 'mobile-games' },
    update: {},
    create: {
      name: 'Mobile Games',
      slug: 'mobile-games',
    },
  })

  const utilityCategory = await prisma.category.upsert({
    where: { slug: 'utilities' },
    update: {},
    create: {
      name: 'Utilities',
      slug: 'utilities',
    },
  })

  // Create dummy users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create dummy products
  const product1 = await prisma.product.create({
    data: {
      title: 'Clash of Clans',
      description: 'A popular strategy mobile game where you build and defend your village.',
      url: 'https://clashofclans.com',
      image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400',
      categoryId: gameCategory.id,
      userId: user1.id,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      title: 'Pokemon GO',
      description: 'Augmented reality mobile game that lets you catch Pokemon in the real world.',
      url: 'https://pokemongo.com',
      image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b91448?w=400',
      categoryId: gameCategory.id,
      userId: user2.id,
    },
  })

  const product3 = await prisma.product.create({
    data: {
      title: 'Todoist',
      description: 'A powerful task management app to organize your life and work.',
      url: 'https://todoist.com',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      categoryId: utilityCategory.id,
      userId: adminUser.id,
    },
  })

  // Create votes
  await prisma.vote.createMany({
    data: [
      { userId: user1.id, productId: product2.id },
      { userId: user1.id, productId: product3.id },
      { userId: user2.id, productId: product1.id },
      { userId: user2.id, productId: product3.id },
      { userId: adminUser.id, productId: product1.id },
      { userId: adminUser.id, productId: product2.id },
    ],
  })

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great game! Been playing for years.',
        productId: product1.id,
        userId: user2.id,
      },
      {
        content: 'Love the AR features in this game.',
        productId: product2.id,
        userId: user1.id,
      },
      {
        content: 'This app has really improved my productivity.',
        productId: product3.id,
        userId: user1.id,
      },
      {
        content: 'The latest update is amazing!',
        productId: product1.id,
        userId: adminUser.id,
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`Created:`)
  console.log(`- 2 categories`)
  console.log(`- 3 users (including 1 admin)`)
  console.log(`- 3 products`)
  console.log(`- 6 votes`)
  console.log(`- 4 comments`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
