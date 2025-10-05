// Simple test script to verify prisma.follow functionality
const { PrismaClient } = require('@prisma/client');

async function testFollowAPI() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing prisma.follow access...');
    console.log('prisma.follow type:', typeof prisma.follow);
    console.log('prisma.follow methods:', Object.keys(prisma.follow || {}));

    // Try to query the Follow table
    console.log('Testing prisma.follow.findMany()...');
    const follows = await prisma.follow.findMany({ take: 1 });
    console.log('Follow query successful:', follows);

    console.log('✅ prisma.follow is working correctly!');
  } catch (error) {
    console.error('❌ Error testing prisma.follow:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFollowAPI();
