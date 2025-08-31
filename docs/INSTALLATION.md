# Installation Guide - Web Price Comparator Preprocessing System

This guide covers the complete installation and initial setup of the preprocessing system for administrators.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Initial Configuration](#initial-configuration)
- [Verification](#verification)
- [Data Setup](#data-setup)
- [First Run](#first-run)
- [Common Issues](#common-issues)

## System Requirements

### Hardware Requirements

- **CPU**: 4+ cores recommended (minimum 2 cores)
- **RAM**: 8GB+ recommended (minimum 4GB)
- **Storage**: 50GB+ free space for processing large datasets
- **Network**: Stable internet connection for downloading dependencies

### Software Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: pnpm (preferred) or npm
- **Git**: For version control and updates

### Optional Tools

- **PowerShell 7+** (for Windows users - enhanced scripting)
- **VS Code** (for configuration editing)
- **Postman** (for API testing)

## Installation Steps

### Step 1: Install Node.js

#### Windows

```powershell
# Using winget (Windows 11)
winget install OpenJS.NodeJS

# Or download from https://nodejs.org/
# Choose LTS version (18.x or higher)
```

#### macOS

```bash
# Using Homebrew
brew install node@18

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install pnpm Package Manager

```powershell
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Step 3: Clone and Setup Project

```powershell
# Navigate to your development directory
cd D:\Dev  # or your preferred location

# If you don't have the project yet, clone it
# git clone <repository-url> web_price_comparator
# cd web_price_comparator

# Navigate to the project
cd web_price_comparator\shop-shrewd

# Install main project dependencies
pnpm install

# Navigate to preprocessor
cd preprocessor

# Install preprocessor dependencies
pnpm install

# Build the preprocessor
pnpm build
```

### Step 4: Verify Installation

```powershell
# Test CLI installation
pnpm preprocess --version

# Check system status
pnpm preprocess status

# Should show configuration and data status
```

## Initial Configuration

### Step 1: Environment Configuration

Create environment file in project root:

```powershell
# Navigate to project root
cd D:\Dev\web_price_comparator\shop-shrewd

# Create .env.local file with configuration
echo VITE_ORI_CORE_PATH=/ori-core >> .env.local
echo PREPROCESS_BATCH_SIZE=1000 >> .env.local
echo PREPROCESS_MAX_CONCURRENCY=4 >> .env.local
echo PREPROCESS_MEMORY_LIMIT_MB=2048 >> .env.local
echo MAPPING_FUZZY_THRESHOLD=0.82 >> .env.local
echo MAPPING_MIN_CONFIDENCE=0.7 >> .env.local
echo OUTPUT_SHARD_SIZE_MB=50 >> .env.local
echo LOG_LEVEL=info >> .env.local
echo ADMIN_ENABLE_AUTH=false >> .env.local
```

#### Production Environment

For production, use these additional settings:

```powershell
echo NODE_ENV=production >> .env.local
echo PREPROCESS_MEMORY_LIMIT_MB=4096 >> .env.local
echo PREPROCESS_MAX_CONCURRENCY=8 >> .env.local
echo LOG_LEVEL=warn >> .env.local
echo ADMIN_ENABLE_AUTH=true >> .env.local
```

### Step 2: Directory Structure Setup

```powershell
# Create necessary directories
mkdir data, out

# Create shop-specific directories
mkdir data\auchan, data\carrefour, data\kaufland, data\mega, data\freshful

# Create output directories
mkdir out\auchan, out\carrefour, out\kaufland, out\mega, out\freshful

# Verify structure
Get-ChildItem -Recurse data, out
```

### Step 3: Category Configuration

The system comes with pre-configured categories, but you may want to customize:

```powershell
# View current category configuration
Get-Content preprocessor\config\canonical\categories.yaml | Select-Object -First 50

# Shop-specific rules (will be created automatically)
ls preprocessor\config\shops\
```

## Verification

### Step 1: System Health Check

```powershell
# Run comprehensive status check
pnpm preprocess status

# Expected output:
# Configuration: environment, paths, settings
# Shop Data: status for each shop
# Memory Usage: current system resources
```

### Step 2: CLI Commands Test

```powershell
# Test all main commands
pnpm preprocess --help
pnpm preprocess categories --help
pnpm preprocess validate --help
pnpm preprocess clean --help

# Test dry run (should work even without data)
pnpm preprocess freshful --dry-run
```

### Step 3: Web Interface Test

```powershell
# Start development server
cd ..  # back to shop-shrewd root
pnpm dev

# Open browser and navigate to:
# http://localhost:8080/ori-core
# Should show admin panel (with auth disabled)
```

## Data Setup

### Step 1: Sample Data Structure

Create sample data for testing:

```powershell
# Create sample Freshful data
$sampleData = @"
[
  {
    "name": "Lapte integral 3.5% pasteurizat 1L Zuzu",
    "brand": "Zuzu",
    "price": 6.89,
    "unit": "L",
    "image": "https://example.com/zuzu-milk.jpg",
    "url": "https://freshful.ro/products/zuzu-lapte-integral-1l",
    "category": "dairy > milk",
    "gtin": "5941148000123",
    "stock": true,
    "weight": "1000ml",
    "fatContent": "3.5%"
  }
]
"@

$sampleData | Out-File -FilePath "data\freshful\sample.json" -Encoding UTF8
```

### Step 2: Data Validation

```powershell
# Validate sample data
pnpm preprocess validate freshful --file "data\freshful\sample.json"

# Should show: ✅ File is valid JSON: 1 items
```

### Step 3: Test Processing

```powershell
# Process sample data
pnpm preprocess freshful --limit 10 --verbose --report

# Check outputs
ls out\freshful\
Get-Content out\freshful\metadata.json
```

## First Run

### Step 1: Process Sample Data

```powershell
# Process with verbose output
pnpm preprocess freshful --verbose --report

# Expected output:
# ✅ Processed freshful: X products from Y files
# 📊 Generated reports in out/freshful/reports/
```

### Step 2: Review Results

```powershell
# Check generated files
ls out\freshful\by-category\
ls out\freshful\reports\

# View processing summary
Get-Content out\freshful\reports\processing-summary.json

# Check for unmapped categories
Get-Content out\freshful\reports\unmapped.jsonl
```

### Step 3: Category Management

```powershell
# View category statistics
pnpm preprocess categories --stats

# Check for unmapped categories
pnpm preprocess categories --unmapped
```

### Step 4: Admin Panel Access

```powershell
# Start the web server
pnpm dev

# Access admin panel:
# URL: http://localhost:8080/ori-core
# Features available:
# - File upload interface
# - Category management
# - Processing dashboard
# - Unmapped queue review
```

## Common Issues

### Issue 1: Node.js Version Error

**Error**: `Error: The engine "node" is incompatible with this module`

**Solution**:

```powershell
# Check Node version
node --version

# Should be 18.0.0 or higher
# If lower, update Node.js
```

### Issue 2: pnpm Command Not Found

**Error**: `'pnpm' is not recognized as an internal or external command`

**Solution**:

```powershell
# Install pnpm globally
npm install -g pnpm

# Or use npx instead
npx pnpm install
```

### Issue 3: Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:

```powershell
# Increase memory limit
echo PREPROCESS_MEMORY_LIMIT_MB=4096 >> .env.local

# Or reduce batch size
echo PREPROCESS_BATCH_SIZE=500 >> .env.local
```

### Issue 4: Permission Errors (Windows)

**Error**: `Error: EACCES: permission denied`

**Solution**:

```powershell
# Run PowerShell as Administrator
# Or change execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 5: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::8080`

**Solution**:

```powershell
# Kill process using port 8080
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process

# Or use different port
echo VITE_PORT=3000 >> .env.local
```

### Issue 6: TypeScript Build Errors

**Error**: `Error: TypeScript compilation failed`

**Solution**:

```powershell
# Clean and rebuild
cd preprocessor
pnpm clean
pnpm build

# Check for syntax errors
pnpm lint
```

### Issue 7: Category Mapping Issues

**Problem**: Many unmapped categories

**Solution**:

```powershell
# Lower fuzzy threshold
echo MAPPING_FUZZY_THRESHOLD=0.75 >> .env.local

# Enable learning mode
echo MAPPING_ENABLE_LEARNING=true >> .env.local

# Review unmapped categories
pnpm preprocess categories --unmapped
```

## Support Commands

### Diagnostic Commands

```powershell
# System information
pnpm preprocess status
node --version
pnpm --version
Get-ComputerInfo | Select-Object TotalPhysicalMemory, CsProcessors

# Log analysis
Get-Content out\*\reports\processing-log.txt | Select-String "ERROR"

# Memory monitoring
pnpm preprocess freshful --perf --verbose
```

### Maintenance Commands

```powershell
# Clean all outputs
pnpm preprocess clean all --force

# Update dependencies
pnpm update

# Rebuild system
pnpm clean && pnpm build
```

### Backup Commands

```powershell
# Backup configuration
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
Copy-Item -Recurse preprocessor\config\ "backup\config-$date\"

# Backup environment
Copy-Item .env.local "backup\.env.local-$date"
```

## Next Steps

After successful installation:

1. **Read the [Admin Guide](./ADMIN_GUIDE.md)** for detailed usage instructions
2. **Set up data sources** for each shop
3. **Configure category mappings** for your specific needs
4. **Set up automated processing** (cron jobs or scheduled tasks)
5. **Monitor system performance** and adjust settings as needed

## Getting Help

- **Documentation**: Check `docs/` directory for detailed guides
- **Logs**: Review files in `out/{shop}/reports/` for processing details
- **Verbose Mode**: Use `--verbose` flag for detailed output
- **System Status**: Run `pnpm preprocess status` for health check

---

**Installation completed successfully!** 🎉

You're now ready to start processing shop data. Continue with the [Admin Guide](./ADMIN_GUIDE.md) for daily operations.
