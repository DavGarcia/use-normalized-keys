# use-normalized-keys

A React hook for normalized keyboard input handling, optimized for games and interactive applications.

## Project Structure

This is a monorepo containing:

- `packages/use-normalized-keys/` - The main React hook library
- `docs/` - VitePress documentation site

## Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Available Scripts

- `npm run build` - Build the library
- `npm run build:all` - Build both library and documentation
- `npm run dev` - Build library in watch mode
- `npm run docs:dev` - Start documentation development server
- `npm run docs:build` - Build documentation for production
- `npm run docs:preview` - Preview built documentation

### Workspace Commands

- `npm run build --workspace=packages/use-normalized-keys` - Build library only
- `npm run dev --workspace=docs` - Start docs dev server

### Documentation

The documentation is built with VitePress and available at:
- **Local development**: http://localhost:5173/use-normalized-keys/
- **Production**: Will be deployed to GitHub Pages

## Publishing

The library will be published to npm as `use-normalized-keys`.

## License

MIT