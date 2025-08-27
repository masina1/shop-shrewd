# Contributing to PriceCompare

Thank you for your interest in contributing to PriceCompare! This document provides guidelines for contributing to this Romanian supermarket price comparison platform.

## Development Setup

### Prerequisites

- Node.js LTS (18+ recommended)
- npm or pnpm package manager
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/masina1/shop-shrewd.git
cd shop-shrewd

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── lib/                # Utilities and core logic
├── services/           # API and data services
├── types/              # TypeScript type definitions
├── data/               # Static data (taxonomy, synonyms)
└── lib/normalization/  # Data normalization pipeline
```

## Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages following Conventional Commits

### Conventional Commits

```
feat: add price history charts
fix: resolve mobile filter overlay issue
docs: update API documentation
chore: upgrade dependencies
```

## Data Normalization

When working with vendor data:

1. Add new normalizers in `src/lib/normalization/`
2. Update type definitions in `src/types/product.ts`
3. Test with sample data in `public/data/dev/`
4. Ensure canonical ID generation works correctly

## Testing

Run the test suite:

```bash
npm test
```

For manual testing:

1. Test search functionality with diacritics
2. Verify price comparison accuracy
3. Check mobile responsiveness
4. Test accessibility with screen readers

## Accessibility

- Ensure ARIA labels are present
- Test keyboard navigation
- Maintain contrast ratios ≥ 4.5:1
- Add alt text for images

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit using conventional commit format
6. Push to your fork
7. Create a Pull Request

### Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Reference related issues
- Ensure all tests pass
- Update documentation if needed

## Data Privacy

- Handle vendor data responsibly
- Don't commit real API keys
- Respect robots.txt when scraping
- Follow GDPR guidelines for user data

## Questions?

- Check existing issues first
- Create a new issue for bugs/features
- Reach out to maintainers for architectural questions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
