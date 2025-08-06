# Key Reference Guide

A complete reference for normalized key values in use-normalized-keys based on the actual `Keys` constants.

## 🚨 Common Mistakes to Avoid

```typescript
// ❌ WRONG - These will NOT work
holdSequence('scroll', ' ', 500)         // Use Keys.SPACE not ' '
comboSequence('navigate', ['↓', '→', 'p'])   // Use Keys.ARROW_DOWN, Keys.ARROW_RIGHT not unicode
isKeyPressed('ctrl')                      // Use Keys.CONTROL not 'ctrl'
isKeyPressed('cmd')                       // Use Keys.META not 'cmd'

// ✅ CORRECT - These WILL work  
import { Keys } from 'use-normalized-keys';
holdSequence('scroll', Keys.SPACE, 500)
comboSequence('navigate', [Keys.ARROW_DOWN, Keys.ARROW_RIGHT, Keys.p])
isKeyPressed(Keys.CONTROL) 
isKeyPressed(Keys.META)
```

## 🎯 Best Practice: Use Key Constants

Import the `Keys` constant for type safety and autocompletion:

```typescript
import { Keys, CommonSequences, holdSequence, comboSequence } from 'use-normalized-keys';

// ✅ Type-safe with IntelliSense
holdSequence('scroll', Keys.SPACE, 500)
comboSequence('save-file', [Keys.CONTROL, Keys.s], { timeout: 500 })
comboSequence('vim-escape', [...CommonSequences.VIM_ESCAPE])
```

## 📋 Complete Key Reference

All constants are organized by category as defined in `keyConstants.ts`:

### Special Keys

| Key | Keys Constant | Normalized Value | Notes |
|-----|---------------|------------------|-------|
| Space bar | `Keys.SPACE` | `'Space'` | **NOT** `' '` (space character) |
| Enter/Return | `Keys.ENTER` | `'Enter'` | |
| Tab | `Keys.TAB` | `'Tab'` | |
| Escape | `Keys.ESCAPE` | `'Escape'` | |
| Backspace | `Keys.BACKSPACE` | `'Backspace'` | |
| Delete | `Keys.DELETE` | `'Delete'` | |

### Arrow Keys (Navigation)

| Key | Keys Constant | Normalized Value | Visual | Notes |
|-----|---------------|------------------|--------|-------|
| Up Arrow | `Keys.ARROW_UP` | `'ArrowUp'` | ↑ | **NOT** `'↑'` or `'Up'` |
| Down Arrow | `Keys.ARROW_DOWN` | `'ArrowDown'` | ↓ | **NOT** `'↓'` or `'Down'` |
| Left Arrow | `Keys.ARROW_LEFT` | `'ArrowLeft'` | ← | **NOT** `'←'` or `'Left'` |
| Right Arrow | `Keys.ARROW_RIGHT` | `'ArrowRight'` | → | **NOT** `'→'` or `'Right'` |

#### Diagonal Arrow Combinations

For advanced directional input:

| Direction | Keys Constant | Normalized Value | Visual |
|-----------|---------------|------------------|--------|
| Up-Left | `Keys.ARROW_UP_LEFT` | `'ArrowUp+ArrowLeft'` | ↖ |
| Up-Right | `Keys.ARROW_UP_RIGHT` | `'ArrowUp+ArrowRight'` | ↗ |
| Down-Left | `Keys.ARROW_DOWN_LEFT` | `'ArrowDown+ArrowLeft'` | ↙ |
| Down-Right | `Keys.ARROW_DOWN_RIGHT` | `'ArrowDown+ArrowRight'` | ↘ |

### Modifier Keys

| Key | Keys Constant | Normalized Value | Alternative Names |
|-----|---------------|------------------|-------------------|
| Shift | `Keys.SHIFT` | `'Shift'` | |
| Control | `Keys.CONTROL` | `'Control'` | **NOT** `'Ctrl'` or `'ctrl'` |
| Alt | `Keys.ALT` | `'Alt'` | |
| Windows/Cmd | `Keys.META` | `'Meta'` | **NOT** `'Windows'`, `'Cmd'`, or `'Command'` |
| Caps Lock | `Keys.CAPS_LOCK` | `'CapsLock'` | |

### Function Keys

| Key | Keys Constant | Normalized Value | Key | Keys Constant | Normalized Value |
|-----|---------------|------------------|-----|---------------|------------------|
| F1 | `Keys.F1` | `'F1'` | F7 | `Keys.F7` | `'F7'` |
| F2 | `Keys.F2` | `'F2'` | F8 | `Keys.F8` | `'F8'` |
| F3 | `Keys.F3` | `'F3'` | F9 | `Keys.F9` | `'F9'` |
| F4 | `Keys.F4` | `'F4'` | F10 | `Keys.F10` | `'F10'` |
| F5 | `Keys.F5` | `'F5'` | F11 | `Keys.F11` | `'F11'` |
| F6 | `Keys.F6` | `'F6'` | F12 | `Keys.F12` | `'F12'` |

### Numbers (Top Row)

| Key | Keys Constant | Normalized Value | Key | Keys Constant | Normalized Value |
|-----|---------------|------------------|-----|---------------|------------------|
| 1 | `Keys.DIGIT_1` | `'1'` | 6 | `Keys.DIGIT_6` | `'6'` |
| 2 | `Keys.DIGIT_2` | `'2'` | 7 | `Keys.DIGIT_7` | `'7'` |
| 3 | `Keys.DIGIT_3` | `'3'` | 8 | `Keys.DIGIT_8` | `'8'` |
| 4 | `Keys.DIGIT_4` | `'4'` | 9 | `Keys.DIGIT_9` | `'9'` |
| 5 | `Keys.DIGIT_5` | `'5'` | 0 | `Keys.DIGIT_0` | `'0'` |

### Letters (Lowercase normalized)

All letters are normalized to **lowercase**:

| Key | Keys Constant | Value | Key | Keys Constant | Value | Key | Keys Constant | Value | Key | Keys Constant | Value |
|-----|---------------|-------|-----|---------------|-------|-----|---------------|-------|-----|---------------|-------|
| A/a | `Keys.a` | `'a'` | H/h | `Keys.h` | `'h'` | O/o | `Keys.o` | `'o'` | V/v | `Keys.v` | `'v'` |
| B/b | `Keys.b` | `'b'` | I/i | `Keys.i` | `'i'` | P/p | `Keys.p` | `'p'` | W/w | `Keys.w` | `'w'` |
| C/c | `Keys.c` | `'c'` | J/j | `Keys.j` | `'j'` | Q/q | `Keys.q` | `'q'` | X/x | `Keys.x` | `'x'` |
| D/d | `Keys.d` | `'d'` | K/k | `Keys.k` | `'k'` | R/r | `Keys.r` | `'r'` | Y/y | `Keys.y` | `'y'` |
| E/e | `Keys.e` | `'e'` | L/l | `Keys.l` | `'l'` | S/s | `Keys.s` | `'s'` | Z/z | `Keys.z` | `'z'` |
| F/f | `Keys.f` | `'f'` | M/m | `Keys.m` | `'m'` | T/t | `Keys.t` | `'t'` | | | |
| G/g | `Keys.g` | `'g'` | N/n | `Keys.n` | `'n'` | U/u | `Keys.u` | `'u'` | | | |

### Punctuation & Symbols (Base form)

Punctuation keys are normalized to their **base form** (unshifted):

| Key | Keys Constant | Normalized Value | Shifted Symbol |
|-----|---------------|------------------|----------------|
| - | `Keys.MINUS` | `'-'` | _ (underscore) |
| = | `Keys.EQUALS` | `'='` | + (plus) |
| [ | `Keys.BRACKET_LEFT` | `'['` | { (left brace) |
| ] | `Keys.BRACKET_RIGHT` | `']'` | } (right brace) |
| \ | `Keys.BACKSLASH` | `'\\'` | \| (pipe) |
| ; | `Keys.SEMICOLON` | `';'` | : (colon) |
| ' | `Keys.QUOTE` | `"'"` | " (quote) |
| , | `Keys.COMMA` | `','` | < (less than) |
| . | `Keys.PERIOD` | `'.'` | > (greater than) |
| / | `Keys.SLASH` | `'/'` | ? (question) |
| ` | `Keys.BACKTICK` | `'`'` | ~ (tilde) |

### Numpad Keys

When NumLock is **ON**, numpad keys return digit values:

| Key | Keys Constant | Normalized Value | Notes |
|-----|---------------|------------------|-------|
| Numpad 0 | `Keys.NUMPAD_0` | `'0'` | When NumLock is on |
| Numpad 1 | `Keys.NUMPAD_1` | `'1'` | When NumLock is on |
| Numpad 2 | `Keys.NUMPAD_2` | `'2'` | When NumLock is on |
| Numpad 3 | `Keys.NUMPAD_3` | `'3'` | When NumLock is on |
| Numpad 4 | `Keys.NUMPAD_4` | `'4'` | When NumLock is on |
| Numpad 5 | `Keys.NUMPAD_5` | `'5'` | When NumLock is on |
| Numpad 6 | `Keys.NUMPAD_6` | `'6'` | When NumLock is on |
| Numpad 7 | `Keys.NUMPAD_7` | `'7'` | When NumLock is on |
| Numpad 8 | `Keys.NUMPAD_8` | `'8'` | When NumLock is on |
| Numpad 9 | `Keys.NUMPAD_9` | `'9'` | When NumLock is on |
| Numpad . | `Keys.NUMPAD_DECIMAL` | `'.'` | When NumLock is on |

**Note**: When NumLock is **OFF**, numpad keys map to navigation keys:
- NUMPAD_2 → `Keys.ARROW_DOWN` (`'ArrowDown'`)
- NUMPAD_4 → `Keys.ARROW_LEFT` (`'ArrowLeft'`)
- NUMPAD_6 → `Keys.ARROW_RIGHT` (`'ArrowRight'`)
- NUMPAD_8 → `Keys.ARROW_UP` (`'ArrowUp'`)

### Common Productivity Keys

Special constants for frequently used keys:

| Key | Keys Constant | Normalized Value | Usage |
|-----|---------------|------------------|-------|
| W | `Keys.W` / `Keys.w` | `'w'` | Navigation (up) |
| A | `Keys.A` / `Keys.a` | `'a'` | Navigation (left) |
| S | `Keys.S` / `Keys.s` | `'s'` | Navigation (down) |
| D | `Keys.D` / `Keys.d` | `'d'` | Navigation (right) |

## 🎨 Productivity Examples

### Text Editor Shortcuts

```typescript
import { Keys, CommonSequences, comboSequence, chordSequence } from 'use-normalized-keys';

// ✅ Using Keys constants for reliability
const shortcuts = [
  // Vim escape sequence: j + k
  comboSequence('vim-escape', [Keys.j, Keys.k]),
  
  // Or use pre-defined common sequences
  comboSequence('vim-escape-predefined', CommonSequences.VIM_ESCAPE),
  
  // Standard productivity shortcuts
  chordSequence('save', CommonSequences.SAVE_FILE),    // Ctrl+S
  chordSequence('copy', CommonSequences.COPY),         // Ctrl+C  
  chordSequence('paste', CommonSequences.PASTE),       // Ctrl+V
  chordSequence('undo', CommonSequences.UNDO),         // Ctrl+Z
  
  // Drawing tool shortcuts
  comboSequence('brush-tool', CommonSequences.BRUSH_TOOL),     // B
  comboSequence('eraser-tool', CommonSequences.ERASER_TOOL),   // E
  comboSequence('pen-tool', CommonSequences.PEN_TOOL),         // P
];
```

### Arrow Key Navigation

```typescript
import { Keys, useNormalizedKeys } from 'use-normalized-keys';

function NavigationComponent() {
  const keys = useNormalizedKeys();
  
  // ✅ Correct arrow key detection
  const isMovingUp = keys.isKeyPressed(Keys.ARROW_UP);
  const isMovingDown = keys.isKeyPressed(Keys.ARROW_DOWN);
  const isMovingLeft = keys.isKeyPressed(Keys.ARROW_LEFT);
  const isMovingRight = keys.isKeyPressed(Keys.ARROW_RIGHT);
  
  // Alternative WASD navigation
  const isWASDUp = keys.isKeyPressed(Keys.w);
  const isWASDDown = keys.isKeyPressed(Keys.s);
  const isWASDLeft = keys.isKeyPressed(Keys.a);
  const isWASDRight = keys.isKeyPressed(Keys.d);
  
  return (
    <div>
      <p>Arrow Navigation: {isMovingUp ? '↑' : ''}{isMovingDown ? '↓' : ''}{isMovingLeft ? '←' : ''}{isMovingRight ? '→' : ''}</p>
      <p>WASD Navigation: {isWASDUp ? 'W' : ''}{isWASDDown ? 'S' : ''}{isWASDLeft ? 'A' : ''}{isWASDRight ? 'D' : ''}</p>
    </div>
  );
}
```

### Modifier Combinations  

```typescript
import { Keys, chordSequence } from 'use-normalized-keys';

// ✅ Correct modifier combinations using Keys constants
const shortcuts = [
  chordSequence('save', [Keys.CONTROL, Keys.s]),        // Ctrl+S
  chordSequence('copy', [Keys.CONTROL, Keys.c]),        // Ctrl+C  
  chordSequence('new-tab', [Keys.CONTROL, Keys.t]),     // Ctrl+T
  chordSequence('cmd-save', [Keys.META, Keys.s]),       // Cmd+S (Mac)
  chordSequence('select-all', [Keys.CONTROL, Keys.a]),  // Ctrl+A
  chordSequence('force-refresh', [Keys.CONTROL, Keys.SHIFT, Keys.r]), // Ctrl+Shift+R
];
```

## 🔧 CommonSequences Reference

Pre-defined sequence arrays for common patterns:

```typescript
import { CommonSequences } from 'use-normalized-keys';

// Text editor shortcuts
CommonSequences.SAVE_FILE        // ['Control', 's']
CommonSequences.COPY            // ['Control', 'c']
CommonSequences.PASTE           // ['Control', 'v']
CommonSequences.UNDO            // ['Control', 'z']

// Drawing tool sequences  
CommonSequences.BRUSH_TOOL      // ['b']
CommonSequences.ERASER_TOOL     // ['e']
CommonSequences.PEN_TOOL        // ['p']

// Navigation sequences
CommonSequences.NAVIGATE_UP     // ['ArrowUp']  
CommonSequences.NAVIGATE_DOWN   // ['ArrowDown']

// Vim-style sequences
CommonSequences.VIM_ESCAPE      // ['j', 'k']

// Quick access sequences
CommonSequences.COMMAND_PALETTE // ['Control', 'Shift', 'p']
```

## 🔍 Debugging Key Issues

### Check Key Names in Browser

Open your browser's developer console and run:

```javascript
document.addEventListener('keydown', (e) => {
  console.log({
    key: e.key,           // Raw key value
    code: e.code,         // Physical key code
    // This is what use-normalized-keys will use:
    normalized: e.key === ' ' ? 'Space' : e.key
  });
});
```

### Use Debug Mode

Enable debug mode to see exactly what keys are being processed:

```typescript
import { useNormalizedKeys, NormalizedKeysProvider } from 'use-normalized-keys';

// With direct hook
const keys = useNormalizedKeys({ debug: true });

// Or with Provider:
<NormalizedKeysProvider debug={true}>
  <YourComponent />
</NormalizedKeysProvider>
```

### Validate Keys

Use the validation helper from keyConstants.ts:

```typescript
import { isValidNormalizedKey, getKeyDescription } from 'use-normalized-keys';

const testKey = 'Space';
if (isValidNormalizedKey(testKey)) {
  console.log('✅ Valid key:', getKeyDescription(testKey));
} else {
  console.log('❌ Invalid key - check the reference guide');
}

// Test with Keys constant
import { Keys } from 'use-normalized-keys';
console.log(isValidNormalizedKey(Keys.SPACE)); // true
console.log(getKeyDescription(Keys.SPACE));    // "Space Bar"
```

## 💡 Pro Tips

1. **Always use the `Keys` constants** for type safety and autocompletion
2. **Use `CommonSequences`** for standard keyboard shortcuts
3. **Test your sequences** with debug mode enabled  
4. **Remember**: Space is `Keys.SPACE` (`'Space'`), not `' '`
5. **Remember**: Arrows are `Keys.ARROW_UP` (`'ArrowUp'`), not `'↑'` or `'Up'`
6. **Remember**: Control is `Keys.CONTROL` (`'Control'`), not `'Ctrl'`
7. **Remember**: Windows/Cmd key is `Keys.META` (`'Meta'`)
8. **Use helper functions**: `isValidNormalizedKey()` and `getKeyDescription()`

## 🆘 Still Having Issues?

If you're still having trouble with key detection:

1. **Check the console** with debug mode enabled
2. **Use the browser test** above to see raw vs normalized keys  
3. **Verify your key names** against this reference
4. **Use `isValidNormalizedKey()`** to test keys programmatically
5. **Test with simple sequences first** before complex combinations
6. **File an issue** with the exact key combination that isn't working

The most common issues are:
- Using `' '` instead of `Keys.SPACE` (`'Space'`)
- Using unicode arrows `↑↓←→` instead of `Keys.ARROW_UP` etc.
- Using `'ctrl'` instead of `Keys.CONTROL` (`'Control'`)  
- Case sensitivity issues with letters (use lowercase: `Keys.a` not `Keys.A`)
- Not importing `Keys` constants for type safety