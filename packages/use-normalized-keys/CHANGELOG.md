# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-XX

### Added
- **🆕 Unified Hook API**: New `useHoldSequence` hook combines functionality from `useHoldProgress`, `useHoldAnimation`, and `useSequence` into a single optimized hook
- **🔄 Context Provider**: New `NormalizedKeysProvider` component for simplified setup and automatic state management
- **🚀 60fps Animations**: Converted from `setInterval` to `requestAnimationFrame` for perfectly smooth 60fps visual effects
- **⚡ Enhanced Performance**: RAF-based animation system eliminates timing conflicts and stuttering issues
- **🎯 Real-time Animation Properties**: Scale, opacity, glow, and shake effects calculated directly from progress data
- **🎮 Game Event Flags**: `justStarted`, `justCompleted`, `justCancelled` events with 100ms timing windows
- **📊 Extended Timing Information**: `timeSinceStart`, `timeSinceLastEvent`, and comprehensive event history
- **🔧 Simplified Exports**: Helper functions and context provider exported from main index

### Changed
- **BREAKING**: Recommended migration to unified `useHoldSequence` hook for new projects
- **BREAKING**: `NormalizedKeysProvider` now accepts `sequences` as direct array instead of nested object
- **🏗️ Architecture**: Main hook now uses `requestAnimationFrame` instead of `setInterval` for progress updates
- **📈 Animation Quality**: Eliminated double-timing conflicts between RAF and setInterval systems
- **⏱️ Timing Precision**: RAF loop automatically starts/stops based on active holds for optimal performance
- **📝 Documentation**: Complete rewrite of README and docs to showcase unified API

### Fixed
- **🐛 Stuttering Issue**: Completely eliminated animation stuttering at the beginning of hold sequences
- **🔄 Progress Accuracy**: Fixed progress bars stopping at 86% instead of reaching 100%
- **⚡ RAF Conflicts**: Removed timing conflicts between multiple animation systems
- **🧪 Test Coverage**: Updated all tests to match new RAF-based architecture

### Deprecated
- `useHoldProgress` - Use `useHoldSequence` instead for comprehensive functionality
- `useHoldAnimation` - Use `useHoldSequence` instead for built-in smooth animations  
- `useSequence` - Use `useHoldSequence` instead for game event flags

### Technical Details
- **🔧 Core Architecture**: Converted main progress update loop from `setInterval(updateHoldProgress, 16)` to `requestAnimationFrame(updateHoldProgress)`
- **🎯 Animation System**: Unified hook calculates properties directly from Context data, synchronized with 60fps updates
- **🏃‍♂️ Performance**: RAF loop only runs when holds are active, automatically terminates when idle
- **🧪 Testing**: 247 tests passing, including 5 updated RAF integration tests
- **📦 Bundle**: No increase in bundle size despite significant functionality expansion

### Migration Guide

**Old approach:**
```tsx
const keys = useNormalizedKeys({ sequences: { sequences: [...] } });
const progress = useHoldProgress('ability');
const animation = useHoldAnimation('ability');
const sequence = useSequence('ability');
```

**New unified approach:**
```tsx
<NormalizedKeysProvider sequences={[...]}>
  const ability = useHoldSequence('ability');
  // Now has: progress, scale, opacity, glow, shake, justStarted, justCompleted, etc.
</NormalizedKeysProvider>
```

## [1.0.0] - 2024-XX-XX

### Added
- Initial release with core keyboard input handling
- Cross-platform normalization and quirk handling
- Sequence detection (combos, chords, holds)
- Tap vs hold detection
- preventDefault API
- TypeScript support
- Helper hooks: `useHoldProgress`, `useHoldAnimation`, `useSequence`
- Helper functions: `holdSequence`, `comboSequence`, etc.