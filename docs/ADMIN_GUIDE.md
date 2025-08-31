# Admin Guide - Web Price Comparator Preprocessing System

This guide covers all administrative tasks, commands, and procedures for managing the preprocessing system.

## Table of Contents

- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [Data Processing](#data-processing)
- [Category Management](#category-management)
- [Admin Panel (Ori-Core)](#admin-panel-ori-core)
- [Troubleshooting](#troubleshooting)
- [System Maintenance](#system-maintenance)
- [Performance Monitoring](#performance-monitoring)

## Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **pnpm** package manager
3. **Access** to shop data files

### Initial Setup

```powershell
# Navigate to project
cd shop-shrewd/preprocessor

# Install dependencies
pnpm install

# Build the system
pnpm build

# Verify installation
pnpm preprocess status
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# PowerShell commands:
echo VITE_ORI_CORE_PATH=/ori-core >> .env.local
echo PREPROCESS_BATCH_SIZE=1000 >> .env.local
echo MAPPING_FUZZY_THRESHOLD=0.82 >> .env.local
echo OUTPUT_SHARD_SIZE_MB=50 >> .env.local
echo LOG_LEVEL=info >> .env.local
```

## CLI Commands

### Main Processing Commands

#### Process Single Shop

```powershell
# Basic processing
pnpm preprocess auchan

# With custom paths
pnpm preprocess auchan --in "D:\data\auchan" --out "D:\output\auchan"

# With limits and reporting
pnpm preprocess auchan --limit 1000 --report --verbose
```

#### Process All Shops

```powershell
# Process all shops
pnpm preprocess all

# Dry run to validate
pnpm preprocess all --dry-run

# Strict mode (fail on unmapped categories)
pnpm preprocess all --strict
```

#### Advanced Flags

```powershell
# Performance monitoring
pnpm preprocess auchan --perf --verbose

# Regenerate outputs only
pnpm preprocess auchan --rewrite

# Debug with limits
pnpm preprocess auchan --limit 100 --verbose --dry-run
```

### Validation Commands

#### Validate Shop Data

```powershell
# Validate all files
pnpm preprocess validate auchan

# Validate specific file
pnpm preprocess validate auchan --file "data/auchan/products.json"

# Schema validation
pnpm preprocess validate auchan --schema
```

### Category Management

#### View Category Status

```powershell
# Show all category mappings
pnpm preprocess categories

# Show unmapped categories
pnpm preprocess categories --unmapped

# Show statistics
pnpm preprocess categories --stats

# Filter by shop
pnpm preprocess categories --shop auchan --unmapped
```

### System Management

#### Check System Status

```powershell
# Overall system status
pnpm preprocess status
```

#### Clean Outputs

```powershell
# Clean specific shop
pnpm preprocess clean auchan --force

# Clean all shops
pnpm preprocess clean all --force

# Interactive clean (asks for confirmation)
pnpm preprocess clean auchan
```

## Data Processing

### Input Data Requirements

#### File Structure

```
data/
├── auchan/
│   ├── 2025-01-15/
│   │   ├── products-page-1.json
│   │   ├── products-page-2.json
│   │   └── ...
│   └── latest.json
├── carrefour/
├── kaufland/
├── mega/
└── freshful/
```

#### Supported Input Formats

**Standard Format (All Shops):**

```json
[
  {
    "name": "Product Name",
    "brand": "Brand Name",
    "price": "12,99",
    "unit": "buc",
    "image": "https://...",
    "url": "https://...",
    "category": "Category Path",
    "ean": "1234567890123",
    "inStock": true,
    "size": "500g"
  }
]
```

### Processing Workflow

#### Daily Processing Routine

```powershell
# 1. Validate new data
pnpm preprocess validate all

# 2. Process with reporting
pnpm preprocess all --report --perf

# 3. Check for unmapped categories
pnpm preprocess categories --unmapped

# 4. Review processing logs
# Check: out/{shop}/reports/mapping-report.csv
```

#### Manual Processing Steps

1. **Upload Data Files**

   - Place JSON files in `data/{shop}/` directory
   - Use dated subdirectories for organization

2. **Validate Data**

   ```powershell
   pnpm preprocess validate {shop}
   ```

3. **Process Data**

   ```powershell
   pnpm preprocess {shop} --report
   ```

4. **Review Results**
   - Check `out/{shop}/metadata.json` for summary
   - Review `out/{shop}/reports/unmapped.jsonl` for issues

### Output Structure

```
out/{shop}/
├── products.index.jsonl           # Minimal product index
├── by-category/                   # Category shards
│   ├── lactate-oua.jsonl
│   ├── carne-peste.jsonl
│   └── ...
├── search/                        # Search indices
│   ├── lactate-oua.idx.json
│   └── ...
├── reports/                       # Processing reports
│   ├── mapping-report.csv
│   ├── unmapped.jsonl
│   └── processing-log.txt
├── full/                          # Archive copies
│   └── 2025-01-15/
└── metadata.json                  # Processing metadata
```

## Category Management

### Understanding Category Mapping

The system uses a 4-tier matching strategy:

1. **Exact Match** (Confidence: 1.0)
   - Direct string match with shop rules
2. **Regex Match** (Confidence: 0.95)
   - Pattern-based matching
3. **Synonym Match** (Confidence: 0.9)
   - Synonym dictionary lookup
4. **Fuzzy Match** (Confidence: 0.82+)
   - String similarity algorithm

### Managing Unmapped Categories

#### Viewing Unmapped Categories

```powershell
# Show all unmapped
pnpm preprocess categories --unmapped

# Export to file for review
pnpm preprocess categories --unmapped > unmapped-review.txt
```

#### Manual Category Mapping

1. **Edit Shop Rules File**

   ```powershell
   # Edit shop-specific rules
   notepad preprocessor/config/shops/auchan.yaml
   ```

2. **Add Mapping Rules**

   ```yaml
   - id: "rule_auchan_001"
     shop: "auchan"
     pattern: "Alimente > Lactate si oua > Lapte UHT"
     pattern_type: "exact"
     target_path:
       ["Lactate & ouă", "Lapte, smântână și brânză proaspătă", "Lapte UHT"]
     confidence: 1.0
     created_by: "admin"
     created_at: "2025-01-15T10:00:00Z"
     enabled: true
   ```

3. **Test Mapping**
   ```powershell
   # Test with single product
   pnpm preprocess auchan --limit 1 --verbose
   ```

### Category Configuration

#### Canonical Categories File

Location: `preprocessor/config/canonical/categories.yaml`

```yaml
categories:
  "Lactate & ouă":
    slug: "lactate-oua"
    subcategories:
      "Lapte, smântână și brânză proaspătă":
        slug: "lapte-smantana-branza-proaspata"
        subcategories:
          - name: "Lapte proaspăt"
            slug: "lapte-proaspat"
          - name: "Lapte UHT"
            slug: "lapte-uht"
```

## Admin Panel (Ori-Core)

### Accessing Ori-Core

1. **Start Development Server**

   ```powershell
   cd shop-shrewd
   pnpm dev
   ```

2. **Navigate to Admin Panel**
   - URL: `http://localhost:8080/ori-core`
   - Authentication: Currently stubbed (development mode)

### Admin Panel Features

#### File Upload Interface

- **Drag & Drop** JSON files
- **Validation Preview** before processing
- **Batch Processing** status monitoring
- **Error Reporting** with line numbers

#### Category Manager

- **Visual Category Tree** with expand/collapse
- **Mapping Interface** in right panel
- **Confidence Indicators** for mappings
- **Sample Products** for unmapped categories

#### Unmapped Queue

- **Review Queue** with sample products
- **Approve/Reject** mapping suggestions
- **Bulk Actions** for multiple categories
- **Manual Override** creation

#### Processing Dashboard

- **Real-time Status** monitoring
- **Progress Indicators** with throughput
- **Download Links** for outputs
- **Error Logs** with filtering

### Admin Panel Operations

#### Uploading Files

1. Navigate to **Upload** section
2. **Drag files** or click to browse
3. **Select shop** from dropdown
4. **Review validation** results
5. **Click Process** to start

#### Managing Categories

1. Go to **Category Manager**
2. **Expand category tree** on left
3. **Review mappings** in right panel
4. **Add new rules** using the form
5. **Test mappings** with sample data

#### Reviewing Unmapped

1. Access **Unmapped Queue**
2. **Sort by frequency** or date
3. **Review sample products**
4. **Accept suggestions** or create manual rules
5. **Mark as resolved**

## Troubleshooting

### Common Issues

#### Memory Issues

```powershell
# Increase memory limit
echo PREPROCESS_MEMORY_LIMIT_MB=4096 >> .env.local

# Use smaller batch sizes
echo PREPROCESS_BATCH_SIZE=500 >> .env.local
```

#### Processing Errors

```powershell
# Check with verbose logging
pnpm preprocess {shop} --verbose --limit 10

# Validate input data first
pnpm preprocess validate {shop}

# Check system status
pnpm preprocess status
```

#### Category Mapping Issues

```powershell
# Review unmapped categories
pnpm preprocess categories --unmapped --shop {shop}

# Check fuzzy threshold
echo MAPPING_FUZZY_THRESHOLD=0.75 >> .env.local

# Enable learning mode
echo MAPPING_ENABLE_LEARNING=true >> .env.local
```

### Error Recovery

#### Repro Commands

When errors occur, the system provides repro commands:

```powershell
# Example error with repro command
❌ Processing failed: Invalid JSON in line 1205

🔄 To reproduce this error:
   preprocess auchan --limit 1210 --verbose
```

#### Log Analysis

```powershell
# Check processing logs
Get-Content out/auchan/reports/processing-log.txt | Select-String "ERROR"

# Check system memory usage
pnpm preprocess status
```

## System Maintenance

### Daily Maintenance Tasks

#### Morning Checklist

```powershell
# 1. Check system status
pnpm preprocess status

# 2. Review overnight processing
Get-Content out/*/reports/processing-log.txt | Select-String "$(Get-Date -Format 'yyyy-MM-dd')"

# 3. Check for unmapped categories
pnpm preprocess categories --unmapped

# 4. Verify data freshness
Get-ChildItem data/*/latest.json | Select LastWriteTime, Name
```

#### Weekly Maintenance

```powershell
# 1. Clean old outputs
pnpm preprocess clean all --force

# 2. Update category mappings
# Review and update .yaml files in preprocessor/config/shops/

# 3. Performance review
# Check memory usage trends and processing times

# 4. Backup configurations
Copy-Item -Recurse preprocessor/config/ backup/config-$(Get-Date -Format 'yyyy-MM-dd')/
```

### Configuration Management

#### Backup Configurations

```powershell
# Create timestamped backup
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
Copy-Item -Recurse preprocessor/config/ "backup/config-$date/"
```

#### Version Control

```powershell
# Commit configuration changes
git add preprocessor/config/
git commit -m "Update category mappings for $(Get-Date -Format 'yyyy-MM-dd')"
git push
```

## Performance Monitoring

### Key Metrics

#### Processing Performance

- **Products per second** - Target: >100 products/second
- **Memory usage** - Should stay under configured limit
- **Category mapping rate** - Target: >95% mapped
- **Error rate** - Target: <1% of products

#### Monitoring Commands

```powershell
# Performance metrics
pnpm preprocess {shop} --perf

# Memory monitoring
pnpm preprocess status

# Category coverage
pnpm preprocess categories --stats
```

### Performance Tuning

#### Batch Size Optimization

```powershell
# Small files (< 10MB)
echo PREPROCESS_BATCH_SIZE=2000 >> .env.local

# Large files (> 100MB)
echo PREPROCESS_BATCH_SIZE=500 >> .env.local
```

#### Memory Optimization

```powershell
# Enable garbage collection
echo PREPROCESS_ENABLE_GC=true >> .env.local

# Adjust shard size
echo OUTPUT_SHARD_SIZE_MB=25 >> .env.local
```

### Monitoring Scripts

#### Health Check Script

```powershell
# Create: scripts/health-check.ps1
function Test-PreprocessorHealth {
    Write-Host "🔍 Checking preprocessor health..." -ForegroundColor Cyan

    # Check dependencies
    pnpm preprocess status

    # Check data freshness
    $dataFiles = Get-ChildItem data/*/latest.json -ErrorAction SilentlyContinue
    foreach ($file in $dataFiles) {
        $age = (Get-Date) - $file.LastWriteTime
        if ($age.TotalHours -gt 24) {
            Write-Warning "⚠️  Stale data: $($file.Name) ($($age.TotalHours.ToString('F1')) hours old)"
        } else {
            Write-Host "✅ Fresh data: $($file.Name)" -ForegroundColor Green
        }
    }

    # Check unmapped categories
    $unmapped = pnpm preprocess categories --unmapped 2>$null
    if ($unmapped) {
        Write-Warning "⚠️  Unmapped categories found - review needed"
    } else {
        Write-Host "✅ All categories mapped" -ForegroundColor Green
    }
}

Test-PreprocessorHealth
```

#### Performance Report Script

```powershell
# Create: scripts/performance-report.ps1
function Get-PerformanceReport {
    param($Shop = "all")

    Write-Host "📊 Generating performance report..." -ForegroundColor Cyan

    if ($Shop -eq "all") {
        $shops = @("auchan", "carrefour", "kaufland", "mega", "freshful")
    } else {
        $shops = @($Shop)
    }

    foreach ($shop in $shops) {
        $metadataPath = "out/$shop/metadata.json"
        if (Test-Path $metadataPath) {
            $metadata = Get-Content $metadataPath | ConvertFrom-Json
            Write-Host "`n📈 $shop Performance:" -ForegroundColor Yellow
            Write-Host "  Products: $($metadata.stats.totalProducts)"
            Write-Host "  Processing time: $($metadata.stats.processingTime / 1000)s"
            Write-Host "  Memory peak: $($metadata.stats.memoryPeak / 1MB)MB"
            Write-Host "  Shards: $($metadata.stats.totalShards)"
        } else {
            Write-Host "`n❌ No data for $shop" -ForegroundColor Red
        }
    }
}

Get-PerformanceReport
```

## Support and Escalation

### When to Escalate

1. **Processing failures** affecting multiple shops
2. **Memory issues** causing system crashes
3. **Category mapping** accuracy below 90%
4. **Performance degradation** over 50%
5. **Data corruption** in outputs

### Support Information

- **Documentation**: This guide + inline code comments
- **Logs**: `out/*/reports/processing-log.txt`
- **Configuration**: `preprocessor/config/`
- **Monitoring**: CLI commands + admin panel

### Emergency Procedures

#### System Recovery

```powershell
# 1. Stop all processing
# Ctrl+C any running processes

# 2. Check system resources
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# 3. Clean outputs and restart
pnpm preprocess clean all --force
pnpm preprocess status

# 4. Restart with minimal load
pnpm preprocess {shop} --limit 100 --verbose
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Contact**: Development Team
