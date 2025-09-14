# Featured Games Algorithm

A sophisticated scoring system for determining which games should be featured prominently on the Mobile Game Hunt platform.

## Overview

The Featured Games Algorithm uses a weighted scoring system combined with editorial controls to determine which games appear in the Featured Games section. It balances algorithmic ranking with editorial curation.

## Features

- **Weighted Scoring System**: Combines multiple metrics with configurable weights
- **Editorial Override**: Admin can manually promote games to the top
- **Editorial Boost**: Admin can give games a scoring boost
- **Normalization**: All metrics are normalized to 0-1 range for fair comparison
- **Extensible**: Easy to adjust weights and add new metrics
- **Tested**: Comprehensive test suite with mock data

## Algorithm Details

### Scoring Formula

```typescript
featured_score = (upvotes_normalized * 0.30) 
               + (comments_normalized * 0.20) 
               + (rating_normalized * 0.25) 
               + (recency_normalized * 0.15) 
               + (editorial_boost * 0.10)
```

### Weights Configuration

```typescript
const FEATURED_WEIGHTS = {
  upvotes: 0.30,      // 30% - Community engagement
  comments: 0.20,     // 20% - Discussion activity
  rating: 0.25,       // 25% - Quality indicator
  recency: 0.15,      // 15% - Freshness factor
  editorial_boost: 0.10, // 10% - Editorial influence
};
```

### Editorial Controls

1. **Editorial Override** (`editorial_override: true`):
   - Game appears at the top of featured list regardless of score
   - Takes precedence over all algorithmic ranking
   - Used for manually curating the most important games

2. **Editorial Boost** (`editorial_boost: true`):
   - Adds 10% to the featured score
   - Provides editorial influence while maintaining algorithmic fairness
   - Used to give deserving games a competitive edge

## Usage

### Basic Usage

```typescript
import { getFeaturedGames } from '@/lib/featured-algorithm';

const featuredGames = getFeaturedGames(games, 6);
```

### Database Integration

```typescript
import { getFeaturedGamesFromDB } from '@/lib/featured-games-service';

const featuredGames = await getFeaturedGamesFromDB(6);
```

### API Endpoint

```bash
GET /api/featured-games?limit=6
```

## Files Structure

```
src/lib/
├── featured-algorithm.ts          # Core algorithm implementation
├── featured-games-service.ts      # Database integration service
├── featured-integration-example.ts # Usage examples
└── __tests__/
    └── featured-algorithm.test.ts  # Comprehensive test suite
```

## Testing

The algorithm includes a comprehensive test suite with:

- **Mock Dataset**: 10 games with varying performance metrics
- **Edge Cases**: Empty arrays, limits, normalization validation
- **Editorial Override**: Verification that override games appear first
- **Sorting Verification**: Ensures proper score-based ordering
- **Normalization**: Validates all scores are in [0,1] range

Run tests:
```bash
cd src/lib/__tests__
npx tsx featured-algorithm.test.ts
```

## Test Results

✅ **Editorial Override Games**: Correctly appear at the top
✅ **Score-based Sorting**: Regular games sorted by descending score
✅ **Limit Functionality**: Respects requested limit
✅ **Edge Cases**: Handles empty arrays, large limits, zero limits
✅ **Normalization**: All scores within [0,1] range
✅ **Weight Configuration**: Configurable and extensible

## Integration Points

### Landing Page
- Use `getFeaturedGamesFromDB(6)` for Featured Games section
- Integrates with existing `EpicFeaturedGames` component

### Discover Page
- Use `getFeaturedGamesFromDB(12)` for more games
- Can be extended for personalized recommendations

### Admin Dashboard
- Editorial controls integrated with existing admin interface
- Real-time updates when editorial settings change

## Extensibility

### Adding New Metrics

1. Add field to `FeaturedGame` interface
2. Add weight to `FEATURED_WEIGHTS` configuration
3. Update normalization logic in `calculateNormalizedScores`
4. Update scoring formula in `calculateNormalizedScores`

### Adjusting Weights

```typescript
import { updateFeaturedWeights } from '@/lib/featured-algorithm';

updateFeaturedWeights({
  upvotes: 0.40,    // Increase upvotes weight
  rating: 0.15,     // Decrease rating weight
});
```

### Custom Scoring

For specialized use cases, you can create custom scoring functions that use the same normalization and editorial override logic.

## Performance Considerations

- **Database Queries**: Optimized with proper indexing on `status`, `editorial_override`, `editorial_boost`
- **Caching**: Can be cached with TTL for improved performance
- **Normalization**: Efficient min-max normalization across all games
- **Memory**: Minimal memory footprint with streaming-friendly design

## Future Enhancements

1. **Rating System**: Implement actual rating calculation from user feedback
2. **Personalization**: Add user preference weights for personalized feeds
3. **A/B Testing**: Support for different weight configurations
4. **Analytics**: Track performance of featured games
5. **Machine Learning**: Use ML models for more sophisticated scoring

## Maintenance

- **Weight Tuning**: Monitor performance and adjust weights as needed
- **Editorial Review**: Regularly review editorial override usage
- **Data Quality**: Ensure game data is complete and accurate
- **Performance Monitoring**: Track algorithm performance and optimization opportunities
