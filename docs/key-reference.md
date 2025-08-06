# Key Reference Guide

A complete reference for normalized key values in use-normalized-keys.

## 🚨 Common Mistakes to Avoid

```typescript
// ❌ WRONG - These will NOT work
holdSequence('scroll', ' ', 500)         // Use 'Space' not ' '
comboSequence('navigate', ['↓', '→', 'p'])   // Use 'ArrowDown', 'ArrowRight' not unicode arrows
isKeyPressed('ctrl')                      // Use 'Control' not 'ctrl'
isKeyPressed('cmd')                       // Use 'Meta' not 'cmd'

// ✅ CORRECT - These WILL work  
holdSequence('scroll', 'Space', 500)
comboSequence('navigate', ['ArrowDown', 'ArrowRight', 'p'])
isKeyPressed('Control') 
isKeyPressed('Meta')
```

## 🎯 Best Practice: Use Key Constants

Import the `Keys` constant for type safety and autocompletion:

```typescript
import { Keys, CommonSequences, holdSequence, comboSequence } from 'use-normalized-keys';

// ✅ Type-safe with IntelliSense
holdSequence('scroll', Keys.SPACE, 500)
comboSequence('format-text', [...CommonSequences.FORMAT_SHORTCUT, Keys.f])
```

## 📋 Complete Key Reference

### Special Keys

| Key | Normalized Value | Notes |
|-----|------------------|-------|
| Space bar | `'Space'` | **NOT** `' '` (space character) |
| Enter/Return | `'Enter'` | |
| Tab | `'Tab'` | |
| Escape | `'Escape'` | |
| Backspace | `'Backspace'` | |
| Delete | `'Delete'` | |

### Arrow Keys

| Key | Normalized Value | Visual | Notes |
|-----|------------------|--------|-------|
| Up Arrow | `'ArrowUp'` | ↑ | **NOT** `'↑'` or `'Up'` |
| Down Arrow | `'ArrowDown'` | ↓ | **NOT** `'↓'` or `'Down'` |
| Left Arrow | `'ArrowLeft'` | ← | **NOT** `'←'` or `'Left'` |
| Right Arrow | `'ArrowRight'` | → | **NOT** `'→'` or `'Right'` |

### Modifier Keys

| Key | Normalized Value | Alternative Names |
|-----|------------------|-------------------|
| Shift | `'Shift'` | |
| Control | `'Control'` | **NOT** `'Ctrl'` or `'ctrl'` |
| Alt | `'Alt'` | |
| Windows/Cmd | `'Meta'` | **NOT** `'Windows'`, `'Cmd'`, or `'Command'` |
| Caps Lock | `'CapsLock'` | |

### Function Keys

| Key | Normalized Value | Key | Normalized Value |
|-----|------------------|-----|------------------|
| F1 | `'F1'` | F7 | `'F7'` |
| F2 | `'F2'` | F8 | `'F8'` |
| F3 | `'F3'` | F9 | `'F9'` |
| F4 | `'F4'` | F10 | `'F10'` |
| F5 | `'F5'` | F11 | `'F11'` |
| F6 | `'F6'` | F12 | `'F12'` |

### Numbers (Top Row)

| Key | Normalized Value | Key | Normalized Value |
|-----|------------------|-----|------------------|
| 1 | `'1'` | 6 | `'6'` |
| 2 | `'2'` | 7 | `'7'` |
| 3 | `'3'` | 8 | `'8'` |
| 4 | `'4'` | 9 | `'9'` |
| 5 | `'5'` | 0 | `'0'` |

### Letters

All letters are normalized to **lowercase**:

| Key | Normalized Value | Key | Normalized Value |
|-----|------------------|-----|------------------|
| A/a | `'a'` | N/n | `'n'` |
| B/b | `'b'` | O/o | `'o'` |
| C/c | `'c'` | P/p | `'p'` |
| D/d | `'d'` | Q/q | `'q'` |
| E/e | `'e'` | R/r | `'r'` |
| F/f | `'f'` | S/s | `'s'` |
| G/g | `'g'` | T/t | `'t'` |
| H/h | `'h'` | U/u | `'u'` |
| I/i | `'i'` | V/v | `'v'` |
| J/j | `'j'` | W/w | `'w'` |
| K/k | `'k'` | X/x | `'x'` |
| L/l | `'l'` | Y/y | `'y'` |
| M/m | `'m'` | Z/z | `'z'` |

### Punctuation & Symbols

Punctuation keys are normalized to their **base form** (unshifted):

| Key | Normalized Value | Shifted Symbol |
|-----|------------------|----------------|
| - | `'-'` | _ (underscore) |
| = | `'='` | + (plus) |
| [ | `'['` | { (left brace) |
| ] | `']'` | } (right brace) |
| \ | `'\\'` | \| (pipe) |
| ; | `';'` | : (colon) |
| ' | `"'"` | " (quote) |
| , | `','` | < (less than) |
| . | `'.'` | > (greater than) |
| / | `'/'` | ? (question) |
| ` | `'`'` | ~ (tilde) |

### Numpad Keys

Numpad keys depend on NumLock state:

| NumLock ON | Normalized Value | NumLock OFF | Normalized Value |
|------------|------------------|-------------|------------------|
| Numpad 0 | `'0'` | Insert | `'Insert'` |
| Numpad 1 | `'1'` | End | `'End'` |
| Numpad 2 | `'2'` | Down Arrow | `'ArrowDown'` |
| Numpad 3 | `'3'` | Page Down | `'PageDown'` |
| Numpad 4 | `'4'` | Left Arrow | `'ArrowLeft'` |
| Numpad 5 | `'5'` | Clear | `'Clear'` |
| Numpad 6 | `'6'` | Right Arrow | `'ArrowRight'` |
| Numpad 7 | `'7'` | Home | `'Home'` |
| Numpad 8 | `'8'` | Up Arrow | `'ArrowUp'` |
| Numpad 9 | `'9'` | Page Up | `'PageUp'` |

## 🎨 Productivity Examples

### Text Editor Shortcuts

```typescript
import { Keys, CommonSequences, comboSequence } from 'use-normalized-keys';

// ✅ Correct productivity shortcuts
const shortcuts = [
  // Vim escape sequence: j + k
  comboSequence('vim-escape', [Keys.j, Keys.k]),
  
  // Quick formatting: Ctrl + Shift + F
  comboSequence('format-document', [Keys.CONTROL, Keys.SHIFT, Keys.f]),
  
  // Or use pre-defined sequences for common patterns
  comboSequence('emoji-shortcut', [...CommonSequences.COLON_WRAP, Keys.p, Keys.a, Keys.r, Keys.t, Keys.y])
];
```

### Arrow Key Navigation

```typescript
import { Keys } from 'use-normalized-keys';

// ✅ Correct navigation checks
if (keys.isKeyPressed(Keys.ARROW_UP)) console.log('Navigate up');
if (keys.isKeyPressed(Keys.ARROW_LEFT)) console.log('Navigate left'); 
if (keys.isKeyPressed(Keys.ARROW_DOWN)) console.log('Navigate down');
if (keys.isKeyPressed(Keys.ARROW_RIGHT)) console.log('Navigate right');
```

### Modifier Combinations  

```typescript
import { Keys, chordSequence } from 'use-normalized-keys';

// ✅ Correct modifier combinations
const shortcuts = [
  chordSequence('save', [Keys.CONTROL, Keys.s]),        // Ctrl+S
  chordSequence('copy', [Keys.CONTROL, Keys.c]),        // Ctrl+C  
  chordSequence('new-tab', [Keys.CONTROL, Keys.t]),     // Ctrl+T
  chordSequence('cmd-save', [Keys.META, Keys.s]),       // Cmd+S (Mac)
];
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
const keys = useNormalizedKeys({ debug: true });
// Or with Provider:
<NormalizedKeysProvider debug={true}>
```

### Validate Keys

Use the validation helper:

```typescript
import { isValidNormalizedKey } from 'use-normalized-keys';

const testKey = 'Space';
if (isValidNormalizedKey(testKey)) {
  console.log('✅ Valid key');
} else {
  console.log('❌ Invalid key - check the reference guide');
}
```

## 💡 Pro Tips

1. **Always use the `Keys` constant** for type safety and autocompletion
2. **Test your sequences** with debug mode enabled  
3. **Remember**: Space is `'Space'`, not `' '`
4. **Remember**: Arrows are `'ArrowUp'`, not `'↑'` or `'Up'`
5. **Remember**: Control is `'Control'`, not `'Ctrl'`
6. **Remember**: Windows/Cmd key is `'Meta'`

## 🆘 Still Having Issues?

If you're still having trouble with key detection:

1. **Check the console** with debug mode enabled
2. **Use the browser test** above to see raw vs normalized keys  
3. **Verify your key names** against this reference
4. **Test with simple sequences first** before complex combinations
5. **File an issue** with the exact key combination that isn't working

The most common issues are:
- Using `' '` instead of `'Space'`
- Using unicode arrows `↑↓←→` instead of `'ArrowUp'` etc.
- Using `'ctrl'` instead of `'Control'`  
- Case sensitivity issues with letters