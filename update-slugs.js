import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProductSlugs() {
  try {
    // Get all products without slugs
    const products = await prisma.product.findMany({
      where: {
        slug: null
      },
      select: {
        id: true,
        title: true
      }
    })

    console.log(`Found ${products.length} products without slugs`)

    for (const product of products) {
      // Generate slug from title
      const slug = product.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens

      // Check if slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug }
      })

      let finalSlug = slug
      if (existingProduct && existingProduct.id !== product.id) {
        // Add number suffix if slug exists
        let counter = 1
        do {
          finalSlug = `${slug}-${counter}`
          counter++
        } while (await prisma.product.findUnique({ where: { slug: finalSlug } }))
      }

      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: finalSlug }
      })

      console.log(`Updated ${product.title} -> ${finalSlug}`)
    }

    console.log('All products updated successfully!')
  } catch (error) {
    console.error('Error updating product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductSlugs()
