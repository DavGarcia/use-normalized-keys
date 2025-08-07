#!/bin/bash

# Publish script for use-normalized-keys
# Runs tests, builds, and publishes with OTP prompt

set -e  # Exit on any error

echo "🔍 Running tests..."
npm run test

echo "🏗️  Building package..."
npm run build

echo "📋 Package ready for publishing!"
echo ""
echo "Current version: $(node -p "require('./packages/use-normalized-keys/package.json').version")"
echo "Name: $(node -p "require('./packages/use-normalized-keys/package.json').name")"
echo ""

# Prompt for version bump type
echo "Select version bump type:"
echo "1) patch (x.x.X) [default]"
echo "2) minor (x.X.0)"
echo "3) major (X.0.0)"
read -p "Enter choice (1-3) or press Enter for patch: " version_type

case $version_type in
    1|"") bump_type="patch" ;;
    2) bump_type="minor" ;;
    3) bump_type="major" ;;
    *) echo "❌ Invalid choice"; exit 1 ;;
esac

echo "🔢 Bumping $bump_type version..."
cd packages/use-normalized-keys
npm version $bump_type --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Go back to root and commit version bump
cd ../..
git add packages/use-normalized-keys/package.json
git commit -m "Bump version to $NEW_VERSION"

echo "📋 New version: $NEW_VERSION"
echo ""

# Prompt for OTP
read -p "Enter your npm OTP (One-Time Password): " otp

if [ -z "$otp" ]; then
    echo "❌ OTP is required for publishing"
    exit 1
fi

echo ""
echo "🚀 Publishing v$NEW_VERSION to npm..."

# Change to package directory and publish with OTP
cd packages/use-normalized-keys
npm publish --otp="$otp"

echo "✅ Published successfully!"

# Go back to root for git operations
cd ../..

echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

echo "📤 Pushing commit and tag to origin..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Complete!"
echo "🌐 Package available at: https://www.npmjs.com/package/use-normalized-keys"
echo "🏷️  Tagged as: v$NEW_VERSION"