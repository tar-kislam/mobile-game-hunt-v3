import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Check if categories already exist to prevent re-seeding
  const existingCategories = await prisma.category.count()
  if (existingCategories > 0) {
    console.log('📂 Categories already exist, skipping seed...')
    return
  }

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

  // No dummy users/products/votes/comments. Seed only taxonomy (categories).

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
