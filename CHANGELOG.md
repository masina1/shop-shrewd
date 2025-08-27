# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Sprint 0 compliance: Environment configuration and data normalization pipeline
- Unified product data types matching workspace specifications
- Vendor feed normalization for Auchan, Carrefour, Kaufland, Mega, Freshful
- Category taxonomy mapping and synonym handling
- Canonical product ID generation with EAN/GTIN support
- Data quality flags for missing prices, unit mismatches, missing images
- Enhanced search service with diacritics-insensitive search
- Repository pattern for centralized product data management

### Changed

- Updated TypeScript interfaces to align with project requirements
- Enhanced search service to use normalized vendor data instead of mock data
- Improved text normalization for better search matching

### Infrastructure

- Added environment variable configuration (.env.example)
- Set up local development data structure (public/data/dev/)
- Added repository hygiene files (CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE)
- Created taxonomy and synonym mapping files

## [Previous Versions]

The codebase was initially created with a comprehensive React + Vite + TypeScript + Tailwind + shadcn/ui implementation including:

- Complete search functionality with filters and facets
- Responsive UI with mobile-first design
- Admin panel and authentication flows
- I18n support (Romanian/English)
- Product pages, wishlists, and combos functionality
