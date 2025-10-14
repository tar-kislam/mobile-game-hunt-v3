import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting seed...')

  // Create predefined categories
  const baseCategories: string[] = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter', 'Simulation', 
    'Sports', 'Racing', 'Casual', 'Arcade', 'Fighting', 'Card', 'MOBA', 'Idle', 
    'Music', 'Educational', 'Platformer', 'Roguelike', 'Sandbox'
  ]
  
  const additionalCategories: string[] = [
    'Battle Royale', 'Survivor-like', 'Auto Battler', 'Deckbuilder', 'Metroidvania',
    'Tower Defense', 'Idle RPG', 'Tycoon', 'MMORPG', 'Open World', 'Strategy RPG',
    'Rhythm', 'Gacha', 'Battle Card', 'Roguelite', 'Social MMO', 'Shooter FPS',
    'Shooter TPS', 'Sports Manager', 'Creative Builder', 'Simulation RPG'
  ]
  
  const categories = Array.from(new Set([...baseCategories, ...additionalCategories])).sort((a, b) => a.localeCompare(b))

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
