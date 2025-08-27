# ADR-0001: Frontend-Only MVP with Mock Data

## Status

Accepted

## Context

The PriceCompare application needs to demonstrate price comparison functionality across Romanian supermarket chains. For Sprint 0-2, we need to establish the core architecture and prove the concept without the complexity of live data scraping infrastructure.

## Decision

Implement a frontend-only MVP that:

1. Uses local JSON files for vendor product data during development
2. Implements a complete data normalization pipeline for future live data
3. Uses client-side search and filtering without backend dependencies
4. Maintains the same interfaces that will work with future backend services

## Architecture Components

### Data Layer

- **Local JSON feeds**: Store vendor data in `public/data/dev/{store}.json`
- **Normalization pipeline**: Convert heterogeneous vendor data to unified schema
- **Repository pattern**: Centralized data access with caching
- **TypeScript types**: Strict typing aligned with project requirements

### Search & Filtering

- **Client-side search**: Diacritics-insensitive text matching
- **Faceted filtering**: Categories, brands, stores, price ranges
- **URL state management**: Bookmarkable search results
- **Pagination**: Efficient rendering of large result sets

### Data Processing

- **Canonical IDs**: EAN/GTIN preferred, fallback to normalized brand+name+size
- **Category mapping**: Unified taxonomy across different store categorizations
- **Price comparison**: Cheapest offer detection with alternatives
- **Quality flags**: Detection of missing prices, images, unit mismatches

## Rationale

### Benefits

1. **Fast development**: No backend infrastructure needed for MVP
2. **Real data simulation**: Use actual scraped data in normalized format
3. **Future-proof interfaces**: Same APIs will work with live backend
4. **Easy testing**: Predictable data for UI development and testing
5. **Deployment simplicity**: Static site deployment to Vercel

### Trade-offs

1. **Data freshness**: Manual updates required during MVP phase
2. **Scale limitations**: Client-side processing limits product count
3. **No real-time features**: Price alerts, live inventory require backend

## Implementation Details

### Environment Configuration

```bash
# Development (local JSON files)
VITE_FEED_AUCHAN=/data/dev/auchan.json
VITE_FEED_CARREFOUR=/data/dev/carrefour.json

# Future production (remote URLs)
VITE_FEED_AUCHAN=https://api.pricecompare.ro/feeds/auchan
```

### Data Flow

1. **Load**: Fetch JSON files from public directory
2. **Normalize**: Convert vendor formats to unified Product schema
3. **Group**: Merge offers by canonical product ID
4. **Search**: Filter and sort based on user criteria
5. **Display**: Present cheapest offers with alternatives

### Migration Path

When transitioning to live backend:

1. Replace `loadVendorData()` with API calls
2. Move normalization to server-side
3. Add real-time data refresh
4. Implement user accounts and persistence

## Consequences

### Positive

- Rapid prototyping and validation of UX
- Real vendor data integration testing
- Clean separation of concerns
- Type-safe data handling

### Negative

- Manual data maintenance during MVP
- Limited scalability for large product catalogs
- No real-time price updates
- Client-side performance constraints

## Notes

This decision enables rapid development of the core price comparison features while establishing the architectural foundation for a production-ready system. The normalization pipeline and repository pattern will directly transfer to the backend implementation.

## Alternatives Considered

1. **Backend-first approach**: Rejected due to increased complexity and slower initial development
2. **Hardcoded mock data**: Rejected as it wouldn't test real vendor data integration
3. **Third-party BaaS**: Rejected to maintain control over data processing logic
