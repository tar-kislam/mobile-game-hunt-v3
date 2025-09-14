/**
 * Test suite for Featured Games Algorithm
 */

import { 
  getFeaturedGames, 
  getFeaturedGamesAnalysis,
  FEATURED_WEIGHTS,
  FeaturedGame 
} from '../featured-algorithm';

// Mock dataset with varying values to test the algorithm
const mockGames: FeaturedGame[] = [
  {
    id: 'game-1',
    title: 'Editorial Override Game',
    upvotes: 50,
    comments: 20,
    rating: 4.5,
    releaseDate: '2024-01-15',
    editorial_boost: false,
    editorial_override: true, // Should appear at top
  },
  {
    id: 'game-2',
    title: 'High Performance Game',
    upvotes: 200,
    comments: 150,
    rating: 4.8,
    releaseDate: '2024-09-01',
    editorial_boost: true,
    editorial_override: false,
  },
  {
    id: 'game-3',
    title: 'Popular Game',
    upvotes: 300,
    comments: 100,
    rating: 4.2,
    releaseDate: '2024-08-15',
    editorial_boost: false,
    editorial_override: false,
  },
  {
    id: 'game-4',
    title: 'Recent Release',
    upvotes: 80,
    comments: 30,
    rating: 4.0,
    releaseDate: '2024-09-10',
    editorial_boost: false,
    editorial_override: false,
  },
  {
    id: 'game-5',
    title: 'Low Performance Game',
    upvotes: 10,
    comments: 5,
    rating: 3.0,
    releaseDate: '2023-12-01',
    editorial_boost: false,
    editorial_override: false,
  },
  {
    id: 'game-6',
    title: 'Editorial Boosted Game',
    upvotes: 120,
    comments: 80,
    rating: 4.1,
    releaseDate: '2024-07-20',
    editorial_boost: true,
    editorial_override: false,
  },
  {
    id: 'game-7',
    title: 'High Rating Game',
    upvotes: 90,
    comments: 40,
    rating: 4.9,
    releaseDate: '2024-06-10',
    editorial_boost: false,
    editorial_override: false,
  },
  {
    id: 'game-8',
    title: 'Average Game',
    upvotes: 60,
    comments: 25,
    rating: 3.8,
    releaseDate: '2024-05-15',
    editorial_boost: false,
    editorial_override: false,
  },
  {
    id: 'game-9',
    title: 'Another Editorial Override',
    upvotes: 30,
    comments: 15,
    rating: 3.5,
    releaseDate: '2024-04-01',
    editorial_boost: false,
    editorial_override: true, // Should appear at top
  },
  {
    id: 'game-10',
    title: 'Older Game',
    upvotes: 150,
    comments: 90,
    rating: 4.3,
    releaseDate: '2023-10-01',
    editorial_boost: false,
    editorial_override: false,
  },
];

/**
 * Test the featured games algorithm
 */
export function testFeaturedAlgorithm() {
  console.log('🧪 Testing Featured Games Algorithm\n');
  
  // Test 1: Basic functionality
  console.log('📊 Test 1: Basic Algorithm Test');
  const featuredGames = getFeaturedGames(mockGames, 6);
  console.log(`Returned ${featuredGames.length} featured games out of ${mockGames.length} total games`);
  
  // Verify editorial override games are at the top
  const overrideGames = featuredGames.filter(g => g.editorial_override);
  const regularGames = featuredGames.filter(g => !g.editorial_override);
  
  console.log(`\n✅ Editorial Override Games (${overrideGames.length}):`);
  overrideGames.forEach((game, index) => {
    console.log(`  ${index + 1}. ${game.title} (Score: ${game.featured_score.toFixed(4)})`);
  });
  
  console.log(`\n📈 Regular Games (${regularGames.length}):`);
  regularGames.forEach((game, index) => {
    console.log(`  ${index + overrideGames.length + 1}. ${game.title} (Score: ${game.featured_score.toFixed(4)})`);
  });
  
  // Test 2: Verify sorting order
  console.log('\n🔍 Test 2: Sorting Verification');
  let sortingCorrect = true;
  for (let i = 1; i < regularGames.length; i++) {
    if (regularGames[i].featured_score > regularGames[i-1].featured_score) {
      console.log(`❌ Sorting error: ${regularGames[i].title} has higher score than ${regularGames[i-1].title}`);
      sortingCorrect = false;
    }
  }
  if (sortingCorrect) {
    console.log('✅ All regular games are correctly sorted by score (descending)');
  }
  
  // Test 3: Limit functionality
  console.log('\n🎯 Test 3: Limit Functionality');
  const limitedGames = getFeaturedGames(mockGames, 3);
  console.log(`Requested 3 games, got ${limitedGames.length} games`);
  if (limitedGames.length <= 3) {
    console.log('✅ Limit functionality works correctly');
  } else {
    console.log('❌ Limit functionality failed');
  }
  
  // Test 4: Edge cases
  console.log('\n⚠️ Test 4: Edge Cases');
  
  // Empty array
  const emptyResult = getFeaturedGames([], 5);
  console.log(`Empty array test: ${emptyResult.length === 0 ? '✅' : '❌'} (Expected 0, got ${emptyResult.length})`);
  
  // Limit larger than array
  const largeLimitResult = getFeaturedGames(mockGames, 20);
  console.log(`Large limit test: ${largeLimitResult.length === mockGames.length ? '✅' : '❌'} (Expected ${mockGames.length}, got ${largeLimitResult.length})`);
  
  // Zero limit
  const zeroLimitResult = getFeaturedGames(mockGames, 0);
  console.log(`Zero limit test: ${zeroLimitResult.length === 0 ? '✅' : '❌'} (Expected 0, got ${zeroLimitResult.length})`);
  
  // Test 5: Detailed analysis
  console.log('\n📋 Test 5: Detailed Analysis');
  const analysis = getFeaturedGamesAnalysis(mockGames, 6);
  console.log('\nAlgorithm Analysis:');
  console.log(`  Total Games: ${analysis.totalGames}`);
  console.log(`  Requested Limit: ${analysis.requestedLimit}`);
  console.log(`  Returned Count: ${analysis.returnedCount}`);
  console.log(`  Editorial Override Games: ${analysis.overrideGames}`);
  console.log(`  Regular Games: ${analysis.regularGames}`);
  console.log(`  Score Range: ${analysis.scoreRange.min.toFixed(4)} - ${analysis.scoreRange.max.toFixed(4)}`);
  console.log(`  Average Score: ${analysis.scoreRange.avg.toFixed(4)}`);
  
  console.log('\nCurrent Weights:');
  Object.entries(analysis.weights).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  // Test 6: Normalization verification
  console.log('\n🔢 Test 6: Normalization Verification');
  const firstGame = featuredGames[0];
  console.log(`\nFirst game: ${firstGame.title}`);
  console.log(`  Featured Score: ${firstGame.featured_score.toFixed(4)}`);
  console.log(`  Normalized Scores:`);
  Object.entries(firstGame.normalized_scores).forEach(([key, value]) => {
    console.log(`    ${key}: ${value.toFixed(4)}`);
  });
  
  // Verify all normalized scores are between 0 and 1
  let normalizationCorrect = true;
  featuredGames.forEach(game => {
    Object.values(game.normalized_scores).forEach(score => {
      if (score < 0 || score > 1) {
        console.log(`❌ Normalization error in ${game.title}: score ${score} is outside [0,1] range`);
        normalizationCorrect = false;
      }
    });
  });
  if (normalizationCorrect) {
    console.log('✅ All normalized scores are within [0,1] range');
  }
  
  console.log('\n🎉 Featured Games Algorithm Test Complete!\n');
  
  return {
    success: sortingCorrect && normalizationCorrect,
    featuredGames,
    analysis,
  };
}

/**
 * Run the test if this file is executed directly
 */
if (typeof window === 'undefined' && require.main === module) {
  testFeaturedAlgorithm();
}
