# use-normalized-keys Library Roadmap

## Phase 1: Package Metadata & Legal (Foundation)

**Goal:** Establish proper package identity and legal framework
**Success Criteria:** Package has complete metadata and is legally ready for open source

### Features

- [ ] Update package.json with complete metadata - Add description, author, keywords, repository URL `S`
- [ ] Create comprehensive package README.md - Usage examples, API docs, installation guide `M`
- [ ] Add LICENSE file - MIT license for open source compatibility `XS`
- [ ] Add .npmignore file - Exclude unnecessary files from npm package `XS`
- [ ] Update package version strategy - Decide on initial version (0.1.0 or 1.0.0) `XS`

### Dependencies

- None (foundation phase)

## Phase 2: Monorepo Structure (Architecture)

**Goal:** Set up proper monorepo architecture for library + docs
**Success Criteria:** Workspace configuration allows shared development of library and docs

### Features

- [ ] Create root package.json with workspace configuration - Enable npm/pnpm workspaces `S`
- [ ] Move current package to packages/use-normalized-keys - Restructure directories `S`
- [ ] Create root README.md - Repository overview and development instructions `S`
- [ ] Update all relative paths - Ensure builds work in new structure `S`
- [ ] Add root-level scripts - Coordinate builds across workspaces `S`

### Dependencies

- Phase 1 completion (need proper package metadata first)

## Phase 3: Documentation Site (VitePress)

**Goal:** Create comprehensive documentation site with live demos
**Success Criteria:** Full documentation site running locally with all content

### Features

- [ ] Initialize VitePress in docs/ directory - Set up documentation framework `S`
- [ ] Configure VitePress for GitHub Pages - Set base URL and build settings `S`
- [ ] Create documentation structure - Index, guide, API reference, demo pages `M`
- [ ] Integrate interactive demo - Port existing demo to VitePress `M`
- [ ] Add code examples and playground - Interactive examples for each feature `L`
- [ ] Write comprehensive guides - Getting started, advanced usage, troubleshooting `L`

### Dependencies

- Phase 2 completion (need monorepo structure)

## Phase 4: CI/CD & Deployment (Automation)

**Goal:** Automate documentation deployment and quality checks
**Success Criteria:** Push to main automatically deploys docs, all checks pass

### Features

- [ ] Create GitHub Actions workflow for docs - Auto-deploy to GitHub Pages `S`
- [ ] Add CI workflow for tests - Run tests on PR/push `S`
- [ ] Add build verification - Ensure library builds correctly `S`
- [ ] Configure GitHub Pages settings - Enable Pages, set source branch `XS`
- [ ] Add status badges to README - Build status, npm version, coverage `XS`

### Dependencies

- Phase 3 completion (need docs to deploy)

## Phase 5: Polish & Launch (Release)

**Goal:** Final polish and public release
**Success Criteria:** Library published to npm and announced

### Features

- [ ] Final API review - Ensure API is stable and well-designed `M`
- [ ] Performance optimization - Bundle size, tree-shaking verification `M`
- [ ] Cross-browser testing - Verify all platform quirks work correctly `L`
- [ ] npm publish preparation - Final checks, npm account setup `S`
- [ ] Create GitHub release - Tag version, write release notes `S`
- [ ] Announcement preparation - Blog post, social media, dev.to article `M`

### Dependencies

- All previous phases complete

## Current Status

**Current Phase:** Between development and Phase 1
**Completed:** Core library functionality, interactive demo, platform quirks
**Next Steps:** Begin Phase 1 with package metadata updates

## Notes

- Each phase builds on the previous one
- Phases 1-2 can be completed quickly (1-2 days)
- Phase 3 is the largest effort (documentation writing)
- Phases 4-5 are mostly configuration and polish
- Total estimated time: 1-2 weeks for full GitHub release