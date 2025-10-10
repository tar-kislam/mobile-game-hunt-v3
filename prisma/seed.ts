import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting seed...')

  // Create predefined categories
  const categories: string[] = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter', 'Simulation', 
    'Sports', 'Racing', 'Casual', 'Arcade', 'Fighting', 'Card', 'MOBA', 'Idle', 
    'Music', 'Educational', 'Platformer', 'Roguelike', 'Sandbox'
  ]

  console.log('📂 Creating categories...')
  const createdCategories: any[] = []
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
  .catch((e: any) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
