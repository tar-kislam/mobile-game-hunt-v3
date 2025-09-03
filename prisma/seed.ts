import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create predefined categories
  const categories = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter', 'Simulation', 
    'Sports', 'Racing', 'Casual', 'Arcade', 'Fighting', 'Card', 'MOBA', 'Idle', 
    'Music', 'Educational', 'Platformer', 'Roguelike', 'Sandbox'
  ]

  console.log('📂 Creating categories...')
  const createdCategories = []
  for (const categoryName of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    })
    createdCategories.push(category)
  }

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

  // Create dummy products with platforms and categories
  const product1 = await prisma.product.create({
    data: {
      title: 'Clash of Clans',
      description: 'A popular strategy mobile game where you build and defend your village.',
      url: 'https://clashofclans.com',
      image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400',
      platforms: ['ios', 'android'],
      countries: ['US', 'UK', 'CA'],
      status: 'PUBLISHED',
      releaseAt: new Date('2025-09-15T10:00:00Z'),
      userId: user1.id,
      categories: {
        create: [
          { categoryId: createdCategories.find(c => c.name === 'Strategy')!.id },
          { categoryId: createdCategories.find(c => c.name === 'Simulation')!.id }
        ]
      }
    },
  })

  const product2 = await prisma.product.create({
    data: {
      title: 'Pokemon GO',
      description: 'Augmented reality mobile game that lets you catch Pokemon in the real world.',
      url: 'https://pokemongo.com',
      image: 'https://images.unsplash.com/photo-1606503153255-598b8b91448?w=400',
      platforms: ['ios', 'android'],
      countries: ['US', 'JP', 'AU'],
      status: 'PUBLISHED',
      releaseAt: new Date('2025-09-20T14:00:00Z'),
      userId: user2.id,
      categories: {
        create: [
          { categoryId: createdCategories.find(c => c.name === 'Adventure')!.id },
          { categoryId: createdCategories.find(c => c.name === 'Casual')!.id }
        ]
      }
    },
  })

  const product3 = await prisma.product.create({
    data: {
      title: 'Todoist',
      description: 'A powerful task management app to organize your life and work.',
      url: 'https://todoist.com',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      platforms: ['ios', 'android', 'web'],
      countries: ['US', 'UK', 'DE', 'FR'],
      status: 'PUBLISHED',
      releaseAt: new Date('2025-09-25T09:00:00Z'),
      userId: adminUser.id,
      categories: {
        create: [
          { categoryId: createdCategories.find(c => c.name === 'Casual')!.id }
        ]
      }
    },
  })

  // Create votes
  await prisma.vote.createMany({
    data: [
      { userId: user1.id, productId: product2.id },
      { userId: user2.id, productId: product1.id },
      { userId: adminUser.id, productId: product1.id },
      { userId: user1.id, productId: product3.id },
      { userId: user2.id, productId: product3.id },
    ],
  })

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'This game is amazing! I love the strategy elements.',
        productId: product1.id,
        userId: user2.id,
      },
      {
        content: 'Great game, but could use some improvements.',
        productId: product1.id,
        userId: adminUser.id,
      },
      {
        content: 'Really fun to play with friends!',
        productId: product2.id,
        userId: user1.id,
      },
      {
        content: 'Perfect for productivity!',
        productId: product3.id,
        userId: user1.id,
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
