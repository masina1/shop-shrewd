# PriceCompare - Romanian Supermarket Price Comparison

A comprehensive price comparison platform for Romanian supermarkets (Auchan, Carrefour, Kaufland, Mega Image, Freshful).

## 🔧 Admin Documentation

### For Administrators and Data Processors

- **[📋 Installation Guide](./docs/INSTALLATION.md)** - Complete setup instructions for the preprocessing system
- **[👨‍💼 Admin Guide](./docs/ADMIN_GUIDE.md)** - Daily operations, commands, and troubleshooting
- **[🏗️ Architecture Decision Records](./docs/adr/)** - Technical decisions and system design

### Quick Start for Admins

```powershell
# Install and setup
cd shop-shrewd/preprocessor
pnpm install && pnpm build

# Check system status
pnpm preprocess status

# Process shop data
pnpm preprocess freshful --report --verbose

# Access admin panel
pnpm dev  # Then go to http://localhost:8080/ori-core
```

## Project info

**URL**: https://lovable.dev/projects/8d13559b-b325-4526-a0fa-8507a3cad2f4
**Repository**: https://github.com/masina1/shop-shrewd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8d13559b-b325-4526-a0fa-8507a3cad2f4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: React + Vite + TypeScript + React Router + Tailwind CSS + shadcn/ui
- **Data Processing**: Client-side normalization pipeline for vendor feeds
- **Search**: Diacritics-insensitive search with faceted filtering
- **I18n**: Romanian/English language support
- **Development**: ESLint + Prettier + Husky for code quality

## Features

- 🛒 **Multi-store price comparison** across 5 major Romanian retailers
- 🔍 **Smart search** with diacritics-insensitive matching
- 📱 **Mobile-responsive** design with touch-friendly interface
- 🏷️ **Advanced filtering** by category, brand, store, price range, promotions
- 💰 **Cheapest price detection** with alternative offers
- 📋 **Wishlists and combos** with local storage persistence
- 🌐 **Bilingual support** (Romanian/English)
- ♿ **Accessibility compliant** with ARIA labels and keyboard navigation

## Data Architecture

The application uses a sophisticated normalization pipeline to unify data from different vendors:

- **Canonical product IDs**: EAN/GTIN preferred, fallback to normalized brand+name+size
- **Category mapping**: Unified two-level taxonomy across all stores
- **Quality flags**: Detection of missing prices, images, unit mismatches
- **Synonym handling**: Intelligent matching for fat content, processing methods, sizes

## Development Data

Sample vendor data is available in `public/data/dev/` for:

- Auchan
- Carrefour
- Kaufland
- Mega Image
- Freshful

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8d13559b-b325-4526-a0fa-8507a3cad2f4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Changelog

- **[2025-01-29] Phase 1 Complete - Admin Panel & Search System Implementation**
  - **Added**: Complete `/ori-core` admin panel with 14 functional pages (AdminOverview, CategoryManagement, UnmappedQueue, ProcessingStatus, SearchIndices, DataIngestion, AdminStores, AdminProducts, AdminOffers, AdminSettings, MonetizationPage, AdminReview + more)
  - **Added**: Search index generation system with FlexSearch integration (`SearchIndexGenerator` class)
  - **Added**: CLI command `generate-search-indices` for bulk index creation
  - **Added**: Comprehensive preprocessing pipeline with category mapping engine
  - **Added**: Shop-specific normalizers (Freshful + Universal fallback for Auchan, Carrefour, Kaufland, Mega, Lidl)
  - **Added**: JSONL sharding system with category-based output structure
  - **Added**: AdminLayout with responsive sidebar navigation and routing
  - **Added**: Real-time search testing functionality in admin panel
  - **Added**: Processing status dashboard with job monitoring
  - **Added**: Category management interface with mapping tools
  - **Added**: Unmapped products queue for manual review
  - **Added**: Data ingestion interface for file uploads
  - **Added**: Comprehensive documentation (INSTALLATION.md, ADMIN_GUIDE.md, NEXT_STEPS.md, ADMIN_DATA_INTEGRATION.md)
  - **Fixed**: Updated `.gitignore` to exclude processed data files and build artifacts
  - **Changed**: Preprocessing system now generates real output data for all 5 Romanian supermarket chains
  - **Status**: Phase 1 (95% complete) - Core system operational, moving to Phase 2 real data integration
