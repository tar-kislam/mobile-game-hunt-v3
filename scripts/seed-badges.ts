import { PrismaClient } from '@prisma/client'
import { BADGE_DEFINITIONS } from '../src/lib/xp-system'

const prisma = new PrismaClient()

async function seedBadges() {
  console.log('🌱 Seeding badge definitions...')

  try {
    for (const [key, definition] of Object.entries(BADGE_DEFINITIONS)) {
      await prisma.badgeDefinition.upsert({
        where: { key: definition.key },
        update: {
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
        },
        create: {
          key: definition.key,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
        },
      })
      console.log(`✅ Badge "${definition.name}" seeded`)
    }

    console.log('🎉 All badge definitions seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding badges:', error)
    throw error
  }
}

async function main() {
  try {
    await seedBadges()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
