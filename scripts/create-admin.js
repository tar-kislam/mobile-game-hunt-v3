const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Load .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

async function main() {
  const prisma = new PrismaClient()
  const email = process.env.ADMIN_EMAIL || 'admin@mgh.local'
  const name = process.env.ADMIN_NAME || 'Admin'
  const password = process.env.ADMIN_PASSWORD || 'Admin!234'

  try {
    const passwordHash = bcrypt.hashSync(password, 12)
    const existing = await prisma.user.findUnique({ where: { email } })
    let user
    if (existing) {
      user = await prisma.user.update({ where: { email }, data: { role: 'ADMIN', passwordHash } })
    } else {
      user = await prisma.user.create({ data: { email, name, role: 'ADMIN', passwordHash } })
    }
    console.log(JSON.stringify({ ok: true, email, role: user.role, id: user.id }))
  } catch (err) {
    console.error('create-admin error:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


