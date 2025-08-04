#!/usr/bin/env node

/**
 * Simple test to verify workspace configuration is working correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing workspace configuration...\n');

// Test 1: Verify root package.json has workspace configuration
console.log('1. Checking root package.json workspace configuration...');
const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!rootPackageJson.workspaces || !rootPackageJson.workspaces.includes('packages/*')) {
  console.error('❌ Root package.json missing workspace configuration');
  process.exit(1);
}
console.log('✅ Root package.json has correct workspace configuration');

// Test 2: Verify packages exist
console.log('\n2. Checking workspace packages exist...');
const packages = ['packages/use-normalized-keys', 'docs'];
for (const pkg of packages) {
  if (!fs.existsSync(pkg) || !fs.existsSync(path.join(pkg, 'package.json'))) {
    console.error(`❌ Package directory ${pkg} missing or invalid`);
    process.exit(1);
  }
}
console.log('✅ All workspace packages exist');

// Test 3: Verify npm can list workspaces
console.log('\n3. Testing npm workspace commands...');
try {
  const workspaces = execSync('npm ls --workspaces --depth=0', { encoding: 'utf8' });
  if (!workspaces.includes('use-normalized-keys@') || !workspaces.includes('use-normalized-keys-docs@')) {
    console.error('❌ npm workspaces not properly recognized');
    process.exit(1);
  }
  console.log('✅ npm recognizes all workspaces');
} catch (error) {
  console.error('❌ npm workspace command failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All workspace configuration tests passed!');