import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'useNormalizedKeys',
  description: 'A React hook for normalized keyboard input handling',
  base: '/use-normalized-keys/',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'API Reference', link: '/api' },
      { text: 'Demo', link: '/demo' },
      { text: 'GitHub', link: 'https://github.com/username/use-normalized-keys' }
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Installation', link: '/installation' },
          { text: 'Quick Start', link: '/quick-start' }
        ]
      },
      {
        text: 'Documentation',
        items: [
          { text: 'API Reference', link: '/api' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'Interactive',
        items: [
          { text: 'Live Demo', link: '/demo' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/username/use-normalized-keys' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025'
    }
  },
  
  // Enable Vue components in markdown
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes('-')
      }
    }
  }
});