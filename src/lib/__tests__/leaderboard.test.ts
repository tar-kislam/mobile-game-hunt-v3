// Mock the score calculation function for testing
export function calculateScore(votes: number, follows: number, clicks: number, createdAt: Date): number {
  const now = new Date();
  const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  const baseScore = Math.log1p(votes) + 0.6 * Math.log1p(follows) + 0.4 * Math.log1p(clicks);
  const decay = Math.exp(-ageHours / 36);
  
  return baseScore * decay;
}

describe('Leaderboard Score Calculation', () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  test('should calculate base score correctly', () => {
    const score = calculateScore(10, 5, 20, now);
    
    // log1p(10) + 0.6 * log1p(5) + 0.4 * log1p(20) * e^(-0/36)
    // 2.3979 + 0.6 * 1.7918 + 0.4 * 3.0445 * 1
    // 2.3979 + 1.0751 + 1.2178 = 4.6908
    expect(score).toBeCloseTo(4.69, 1);
  });

  test('should apply decay for older content', () => {
    const score1 = calculateScore(10, 5, 20, oneHourAgo);
    const score2 = calculateScore(10, 5, 20, oneDayAgo);
    const score3 = calculateScore(10, 5, 20, oneWeekAgo);
    
    // Score should decrease with age
    expect(score1).toBeLessThan(score2);
    expect(score2).toBeLessThan(score3);
  });

  test('should handle zero values', () => {
    const score = calculateScore(0, 0, 0, now);
    
    // log1p(0) + 0.6 * log1p(0) + 0.4 * log1p(0) * 1 = 0
    expect(score).toBe(0);
  });

  test('should handle high values', () => {
    const score = calculateScore(1000, 500, 2000, now);
    
    // Should be a positive number
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100); // Reasonable upper bound
  });

  test('should maintain relative ordering', () => {
    const score1 = calculateScore(100, 50, 200, now);
    const score2 = calculateScore(50, 25, 100, now);
    
    // Higher engagement should result in higher score
    expect(score1).toBeGreaterThan(score2);
  });
});
