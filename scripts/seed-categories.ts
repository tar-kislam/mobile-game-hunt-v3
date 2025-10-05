import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const names = [
    'Action','Adventure','RPG','Strategy','Puzzle','Shooter','Simulation','Sports','Racing','Casual','Arcade','Fighting','Card','MOBA','Idle','Music','Educational','Platformer','Roguelike','Sandbox'
  ]
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  console.log('✅ Categories upserted')
}

main().catch((e)=>{ console.error(e); process.exit(1)}).finally(async()=>{ await prisma.$disconnect() })
