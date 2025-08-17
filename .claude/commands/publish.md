---
description: Publish a new version following the project's documented publishing guidelines
allowed-tools:
  - Read
  - Bash(npm version:*)
  - Bash(npm test:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git tag:*)
  - Bash(git status)
  - Bash(git branch:*)
---

# Publishing New Version

Follow the exact publishing workflow documented in README.md:

## Step 1: Pre-flight Checks
1. Read README.md to confirm current publishing guidelines
2. Verify we're in the correct project directory
3. Check git status to ensure clean working directory
4. Confirm we're on the main branch

## Step 2: Version Management
1. Move to `packages/use-normalized-keys/` directory
2. Check current version in package.json
3. Ask user what type of version bump: patch/minor/major
4. Run `npm version [type]` to bump version

## Step 3: Quality Assurance  
1. Run `npm test` to ensure all tests pass
2. Verify TypeScript compilation with `npx tsc --noEmit`
3. Only proceed if all checks pass

## Step 4: Git Operations
1. Ask user for descriptive commit message
2. Stage all changes with `git add .`
3. Commit with descriptive message including version bump
4. Create git tag for the new version
5. **DO NOT PUSH** - user will push via GitHub Desktop

## Step 5: Instructions for User
Provide clear instructions for:
- How to push via GitHub Desktop (commits + tags)
- Links to monitor GitHub Actions workflow
- Links to verify npm publication
- Links to check GitHub releases

## Important Notes
- Never run `npm publish` manually
- GitHub Actions handles the actual publishing
- The automated workflow ensures consistent production builds
- User must push both commits and tags to trigger release

Follow this workflow exactly as documented in the README.md publishing guidelines.