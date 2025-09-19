/**
 * Calculates the current level and XP progress based on total XP
 * 
 * Rules:
 * - Level 1 → 100 XP
 * - Level 2 → 200 XP (total 300 XP)
 * - Level 3 → 300 XP (total 600 XP)
 * - Level 4 → 400 XP (total 1000 XP)
 * - And so on (each level requires +100 XP more than previous)
 * 
 * @param totalXP - The user's total accumulated XP
 * @returns Object containing level information and progress
 */
export function calculateLevelProgress(totalXP: number): {
  level: number;
  currentXP: number;
  requiredXP: number;
  remainingXP: number;
} {
  // Handle edge cases
  if (totalXP < 0) {
    throw new Error('Total XP cannot be negative');
  }

  // If user has 0 XP, they're at level 1 with 0 progress
  if (totalXP === 0) {
    return {
      level: 1,
      currentXP: 0,
      requiredXP: 100, // Level 1 requires 100 XP
      remainingXP: 100
    };
  }

  // Calculate current level using cumulative XP requirements
  // Level 1: 100 XP
  // Level 2: 100 + 200 = 300 XP
  // Level 3: 100 + 200 + 300 = 600 XP
  // Level 4: 100 + 200 + 300 + 400 = 1000 XP
  // Formula: Level n requires n * (n + 1) * 100 / 2 total XP
  
  let level = 1;
  let cumulativeXP = 0;
  
  // Find the highest level where cumulative XP <= totalXP
  while (cumulativeXP + (level * 100) <= totalXP) {
    cumulativeXP += level * 100;
    level++;
  }

  // Calculate XP progress within current level
  const currentXP = totalXP - cumulativeXP;
  const requiredXP = level * 100;
  const remainingXP = requiredXP - currentXP;

  return {
    level,
    currentXP,
    requiredXP,
    remainingXP
  };
}

/**
 * Alternative implementation using mathematical formula
 * More efficient for very large XP values
 */
export function calculateLevelProgressOptimized(totalXP: number): {
  level: number;
  currentXP: number;
  requiredXP: number;
  remainingXP: number;
} {
  // Handle edge cases
  if (totalXP < 0) {
    throw new Error('Total XP cannot be negative');
  }

  if (totalXP === 0) {
    return {
      level: 1,
      currentXP: 0,
      requiredXP: 100,
      remainingXP: 100
    };
  }

  // Mathematical approach: solve quadratic equation
  // Total XP for level n = n * (n + 1) * 100 / 2
  // We need to find the highest level where total XP <= totalXP
  
  // Using quadratic formula: n^2 + n - (2 * totalXP / 100) = 0
  const discriminant = 1 + (8 * totalXP) / 100;
  const level = Math.floor((-1 + Math.sqrt(discriminant)) / 2);
  
  // Calculate cumulative XP up to this level
  const cumulativeXP = (level * (level + 1) * 100) / 2;
  
  // Calculate XP progress within current level
  const currentXP = totalXP - cumulativeXP;
  const requiredXP = (level + 1) * 100;
  const remainingXP = requiredXP - currentXP;

  return {
    level: level + 1, // +1 because we want the current level, not the completed level
    currentXP,
    requiredXP,
    remainingXP
  };
}

/**
 * Test cases for the XP calculation function
 */
export function testXPCalculator() {
  const testCases = [
    { totalXP: 0, expectedLevel: 1, expectedCurrentXP: 0, expectedRequiredXP: 100, expectedRemainingXP: 100 },
    { totalXP: 50, expectedLevel: 1, expectedCurrentXP: 50, expectedRequiredXP: 100, expectedRemainingXP: 50 },
    { totalXP: 100, expectedLevel: 2, expectedCurrentXP: 0, expectedRequiredXP: 200, expectedRemainingXP: 200 },
    { totalXP: 500, expectedLevel: 3, expectedCurrentXP: 200, expectedRequiredXP: 300, expectedRemainingXP: 100 },
    { totalXP: 1200, expectedLevel: 5, expectedCurrentXP: 200, expectedRequiredXP: 500, expectedRemainingXP: 300 }
  ];

  console.log('Testing XP Calculator...\n');

  testCases.forEach((testCase, index) => {
    const result = calculateLevelProgress(testCase.totalXP);
    
    console.log(`Test Case ${index + 1}: ${testCase.totalXP} XP`);
    console.log(`Expected: Level ${testCase.expectedLevel}, Current: ${testCase.expectedCurrentXP}, Required: ${testCase.expectedRequiredXP}, Remaining: ${testCase.expectedRemainingXP}`);
    console.log(`Result: Level ${result.level}, Current: ${result.currentXP}, Required: ${result.requiredXP}, Remaining: ${result.remainingXP}`);
    
    // Verify results
    const isCorrect = 
      result.level === testCase.expectedLevel &&
      result.currentXP === testCase.expectedCurrentXP &&
      result.requiredXP === testCase.expectedRequiredXP &&
      result.remainingXP === testCase.expectedRemainingXP;
    
    console.log(`Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
  });
}

/**
 * Helper function to get XP progress percentage
 */
export function getXPProgressPercentage(totalXP: number): number {
  const { currentXP, requiredXP } = calculateLevelProgress(totalXP);
  return Math.round((currentXP / requiredXP) * 100);
}

/**
 * Helper function to get total XP needed to reach a specific level
 */
export function getTotalXPForLevel(targetLevel: number): number {
  if (targetLevel < 1) {
    throw new Error('Level must be at least 1');
  }
  
  let totalXP = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXP += level * 100;
  }
  
  return totalXP;
}
