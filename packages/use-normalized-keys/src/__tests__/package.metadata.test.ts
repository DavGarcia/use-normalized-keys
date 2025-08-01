import { describe, it, expect } from 'vitest';
import packageJson from '../../package.json';
import fs from 'fs';
import path from 'path';

describe('Package Metadata', () => {
  describe('package.json validation', () => {
    it('should have required metadata fields', () => {
      expect(packageJson.name).toBe('use-normalized-keys');
      expect(packageJson.description).toBeTruthy();
      expect(packageJson.description.length).toBeGreaterThan(10);
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(packageJson.license).toBe('MIT');
    });

    it('should have proper author information', () => {
      expect(packageJson.author).toBeTruthy();
      expect(typeof packageJson.author === 'string' || typeof packageJson.author === 'object').toBe(true);
    });

    it('should have repository information', () => {
      expect(packageJson.repository).toBeTruthy();
      expect(packageJson.repository.type).toBe('git');
      expect(packageJson.repository.url).toBeTruthy();
      expect(packageJson.repository.directory).toBe('packages/use-normalized-keys');
    });

    it('should have homepage and bugs URLs', () => {
      expect(packageJson.homepage).toBeTruthy();
      expect(packageJson.bugs).toBeTruthy();
      if (typeof packageJson.bugs === 'object') {
        expect(packageJson.bugs.url).toBeTruthy();
      }
    });

    it('should have appropriate keywords', () => {
      expect(packageJson.keywords).toBeTruthy();
      expect(Array.isArray(packageJson.keywords)).toBe(true);
      expect(packageJson.keywords.length).toBeGreaterThan(3);
      expect(packageJson.keywords).toContain('react');
      expect(packageJson.keywords).toContain('hooks');
      expect(packageJson.keywords).toContain('keyboard');
    });

    it('should have proper exports configuration', () => {
      expect(packageJson.main).toBeTruthy();
      expect(packageJson.module).toBeTruthy();
      expect(packageJson.types).toBeTruthy();
      expect(packageJson.files).toBeTruthy();
      expect(Array.isArray(packageJson.files)).toBe(true);
    });

    it('should have proper peer dependencies', () => {
      expect(packageJson.peerDependencies).toBeTruthy();
      expect(packageJson.peerDependencies.react).toBeTruthy();
      expect(packageJson.peerDependencies['react-dom']).toBeTruthy();
    });
  });

  describe('LICENSE file validation', () => {
    it('should have a LICENSE file', () => {
      const licensePath = path.join(__dirname, '../../LICENSE');
      expect(fs.existsSync(licensePath)).toBe(true);
    });

    it('should have MIT license content', () => {
      const licensePath = path.join(__dirname, '../../LICENSE');
      if (fs.existsSync(licensePath)) {
        const licenseContent = fs.readFileSync(licensePath, 'utf-8');
        expect(licenseContent).toContain('MIT License');
        expect(licenseContent).toContain('Copyright');
        expect(licenseContent.length).toBeGreaterThan(100);
      }
    });
  });

  describe('README file validation', () => {
    it('should have a README.md file', () => {
      const readmePath = path.join(__dirname, '../../README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    it('should have comprehensive README content', () => {
      const readmePath = path.join(__dirname, '../../README.md');
      if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        expect(readmeContent).toContain('# use-normalized-keys');
        expect(readmeContent).toContain('## Installation');
        expect(readmeContent).toContain('## Quick Start');
        expect(readmeContent).toContain('## API Reference');
        expect(readmeContent.length).toBeGreaterThan(500);
      }
    });
  });

  describe('npm package configuration', () => {
    it('should have .npmignore file', () => {
      const npmignorePath = path.join(__dirname, '../../.npmignore');
      expect(fs.existsSync(npmignorePath)).toBe(true);
    });

    it('should exclude development files from npm package', () => {
      const npmignorePath = path.join(__dirname, '../../.npmignore');
      if (fs.existsSync(npmignorePath)) {
        const npmignoreContent = fs.readFileSync(npmignorePath, 'utf-8');
        expect(npmignoreContent).toContain('src/');
        expect(npmignoreContent).toContain('demo/');
        expect(npmignoreContent).toContain('.agent-os/');
        expect(npmignoreContent).toContain('*.test.*');
      }
    });
  });
});