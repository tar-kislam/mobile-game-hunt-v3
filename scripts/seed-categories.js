const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const base = [
    'Action','Adventure','RPG','Strategy','Puzzle','Shooter','Simulation','Sports','Racing','Casual','Arcade','Fighting','Card','MOBA','Idle','Music','Educational','Platformer','Roguelike','Sandbox'
  ]
  const additions = [
    'Battle Royale', 'Survivor-like', 'Auto Battler', 'Deckbuilder', 'Metroidvania',
    'Tower Defense', 'Idle RPG', 'Tycoon', 'MMORPG', 'Open World', 'Strategy RPG',
    'Rhythm', 'Gacha', 'Battle Card', 'Roguelite', 'Social MMO', 'Shooter FPS',
    'Shooter TPS', 'Sports Manager', 'Creative Builder', 'Simulation RPG'
  ]
  const names = Array.from(new Set([...base, ...additions])).sort((a,b)=>a.localeCompare(b))
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  console.log('✅ Categories upserted')
}

main().catch((e)=>{ console.error(e); process.exit(1) }).finally(async()=>{ await prisma.$disconnect() })
