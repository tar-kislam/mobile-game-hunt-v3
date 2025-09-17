const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseStructure() {
  try {
    console.log('Testing database structure...\n');
    
    // Test if GameFollow table exists and works
    console.log('=== Testing GameFollow table ===');
    try {
      const gameFollows = await prisma.gameFollow.findMany({
        take: 5
      });
      console.log(`✅ GameFollow table accessible, found ${gameFollows.length} records`);
    } catch (error) {
      console.log('❌ GameFollow table error:', error.message);
    }
    
    // Test if Follow table exists and works (user-to-user follows)
    console.log('\n=== Testing Follow table (user-to-user) ===');
    try {
      const follows = await prisma.follow.findMany({
        take: 5
      });
      console.log(`✅ Follow table accessible, found ${follows.length} records`);
    } catch (error) {
      console.log('❌ Follow table error:', error.message);
    }
    
    // Test User relations
    console.log('\n=== Testing User relations ===');
    try {
      const user = await prisma.user.findFirst({
        include: {
          gameFollows: true,
          followers: true,
          following: true
        }
      });
      if (user) {
        console.log(`✅ User relations working:`);
        console.log(`  - gameFollows: ${user.gameFollows.length}`);
        console.log(`  - followers: ${user.followers.length}`);
        console.log(`  - following: ${user.following.length}`);
      }
    } catch (error) {
      console.log('❌ User relations error:', error.message);
    }
    
    // Test Product relations
    console.log('\n=== Testing Product relations ===');
    try {
      const product = await prisma.product.findFirst({
        include: {
          followUsers: true
        }
      });
      if (product) {
        console.log(`✅ Product relations working:`);
        console.log(`  - followUsers: ${product.followUsers.length}`);
      }
    } catch (error) {
      console.log('❌ Product relations error:', error.message);
    }
    
    console.log('\n✅ Database structure test complete!');
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseStructure();

