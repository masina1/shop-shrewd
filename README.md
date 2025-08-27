# PriceCompare - Romanian Supermarket Price Comparison

A comprehensive price comparison platform for Romanian supermarkets (Auchan, Carrefour, Kaufland, Mega Image, Freshful).

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
