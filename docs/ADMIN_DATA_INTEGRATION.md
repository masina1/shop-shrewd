# Admin Panel Data Integration Guide

This document explains how to connect the ORI Core admin panel to real data from your preprocessing system.

## 🎯 Current Status

✅ **Completed:**

- Admin panel MVP with `/ori-core` routes
- Unmapped queue with approve/reject functionality
- Data service architecture
- Mock data integration

🔄 **In Progress:**

- Real data loading from preprocessing system

## 📁 Data Integration Architecture

### Current Structure

```
src/lib/admin/
├── dataService.ts           # Main data service interface
├── preprocessorDataLoader.ts # File-based data loader
└── types/admin.ts           # TypeScript interfaces
```

### Data Flow

1. **Admin Panel** → **Data Service** → **Preprocessor Data Loader**
2. **Preprocessor Data Loader** → **File System** (JSONL reports)
3. **Data Service** → **Admin Panel** (React components)

## 🔌 Connecting Real Data

### Option 1: File-Based Integration (Current)

The system currently uses a file-based approach that can be extended to read real data:

```typescript
// In preprocessorDataLoader.ts
async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
  // TODO: Replace with real file reading
  const shops = ['freshful', 'auchan', 'mega', 'carrefour', 'lidl'];
  const allProducts: UnmappedProduct[] = [];

  for (const shop of shops) {
    const unmappedPath = `/out/${shop}/reports/unmapped.jsonl`;
    const products = await this.readUnmappedFile(unmappedPath);
    allProducts.push(...products);
  }

  return allProducts;
}
```

### Option 2: API Integration (Recommended for Production)

Create a backend API that serves preprocessing data:

```typescript
// In dataService.ts
async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
  const response = await fetch('/api/preprocessor/unmapped');
  if (!response.ok) {
    throw new Error('Failed to load unmapped products');
  }
  return response.json();
}
```

### Option 3: Direct Database Integration

Connect directly to your preprocessing database:

```typescript
// In preprocessorDataLoader.ts
async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
  // Connect to your database and query unmapped products
  const query = `
    SELECT * FROM products
    WHERE mapping_status = 'unmapped'
    ORDER BY confidence DESC
  `;
  // Execute query and transform results
}
```

## 📊 Data Sources

### Preprocessing Reports

Your preprocessing system generates these files:

```
/out/{shop}/reports/
├── unmapped.jsonl          # Products needing category mapping
├── rejects.jsonl           # Products that failed validation
├── processing-summary.json # Processing statistics
└── mapping-report.csv      # Category mapping results
```

### Unmapped Products Format

Each line in `unmapped.jsonl` contains:

```json
{
  "product_name": "Lapte integral 3.5% 1L",
  "brand": "Danone",
  "shop": "auchan",
  "raw_category": "lactate-si-oua",
  "suggested_category": "Lactate & Ouă",
  "confidence": 0.85,
  "product_data": {
    "price": 8.99,
    "image": "https://...",
    "url": "https://..."
  }
}
```

### Category Structure

Categories are loaded from your canonical `categories.yaml`:

```yaml
Fructe & Legume:
  - Fructe proaspete
  - Legume proaspete
  - Salate & verdețuri

Lactate & Ouă:
  - Lapte
  - Brânzeturi
  - Iaurt & derivate
```

## 🚀 Implementation Steps

### Step 1: Test Current Mock Data

1. Navigate to `/ori-core/unmapped`
2. Verify approve/reject functionality works
3. Check that products move between tabs correctly

### Step 2: Connect Real Unmapped Data

1. Update `preprocessorDataLoader.ts` to read real files
2. Test with a small subset of your data
3. Verify data transformation works correctly

### Step 3: Add Real-Time Updates

1. Implement file watching for new preprocessing runs
2. Add refresh functionality to admin panel
3. Consider WebSocket updates for live processing status

### Step 4: Production Deployment

1. Set up proper API endpoints
2. Add authentication and authorization
3. Implement error handling and logging

## 🔧 Configuration

### Environment Variables

```bash
# Development
VITE_PREPROCESSOR_DATA_PATH=/out

# Production
VITE_PREPROCESSOR_API_URL=https://api.yoursite.com/preprocessor
```

### File Paths

```typescript
// Configure data paths in preprocessorDataLoader.ts
private basePath = process.env.VITE_PREPROCESSOR_DATA_PATH || '/out';
```

## 📈 Performance Considerations

### Large Datasets

- Implement pagination for unmapped products
- Add search and filtering capabilities
- Consider virtual scrolling for very large lists

### Real-Time Updates

- Use WebSockets for live processing status
- Implement optimistic updates for approve/reject actions
- Add background refresh for new data

### Caching

- Cache category mappings and product data
- Implement client-side caching for better performance
- Add server-side caching for frequently accessed data

## 🧪 Testing

### Unit Tests

```bash
npm run test -- --grep "AdminDataService"
npm run test -- --grep "UnmappedQueue"
```

### Integration Tests

```bash
# Test with real preprocessing output
npm run test:integration
```

### Manual Testing

1. Run preprocessing on a small dataset
2. Navigate to admin panel
3. Verify data loads correctly
4. Test approve/reject functionality
5. Check data persistence

## 🚨 Troubleshooting

### Common Issues

#### Data Not Loading

- Check file paths in `preprocessorDataLoader.ts`
- Verify preprocessing reports exist
- Check browser console for errors

#### Approve/Reject Not Working

- Verify data service methods are implemented
- Check network requests in browser dev tools
- Verify state updates in React components

#### Performance Issues

- Implement pagination for large datasets
- Add loading states and error boundaries
- Consider virtual scrolling for very long lists

### Debug Mode

Enable debug logging:

```typescript
// In dataService.ts
private debug = process.env.NODE_ENV === 'development';

async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
  if (this.debug) {
    console.log('Loading unmapped products...');
  }
  // ... implementation
}
```

## 🔮 Future Enhancements

### Advanced Features

- **Machine Learning Integration**: Auto-suggest categories based on product patterns
- **Bulk Operations**: Approve/reject multiple products at once
- **Category Management**: Edit canonical category structure
- **Processing Pipeline**: Trigger preprocessing runs from admin panel
- **Analytics Dashboard**: Processing statistics and trends

### Integration Points

- **Notification System**: Alert admins of new unmapped products
- **Workflow Management**: Assign products to specific reviewers
- **Audit Trail**: Track all approve/reject decisions
- **Export Functionality**: Download processed data and reports

## 📚 Resources

- [Admin Panel User Guide](./ADMIN_GUIDE.md)
- [Preprocessing System Documentation](../preprocessor/README.md)
- [Category Mapping Engine](../preprocessor/core/category-mapping/README.md)
- [API Reference](./API_REFERENCE.md)

## 🤝 Contributing

To contribute to the admin panel data integration:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📞 Support

For questions or issues with data integration:

- Create an issue in the repository
- Check the troubleshooting section above
- Review the preprocessing system logs
- Contact the development team
