# Windows Shift+Numpad Phantom Event Analysis

## Critical Discovery

**`getModifierState('Shift')` returns `false` for phantom events!**

This completely invalidates our initial approach which assumed phantom keyup events would have `getModifierState('Shift') === true`.

## Observed Behavior

### Your Timeline:
```
19:53:38.987 keydown Shift (real)          getModifierState: true
19:53:39.769 keyup   Shift (PHANTOM)       getModifierState: false ← Problem!
19:53:39.771 keydown 1     (real)          
19:53:39.844 keyup   1     (real)
19:53:39.845 keydown Shift (PHANTOM)       getModifierState: true
19:53:40.502 keyup   Shift (real)          getModifierState: false
```

### Console Debug Output:
```
[PHANTOM DEBUG] Shift keydown - getModifierState: true, tracked: undefined
[PHANTOM DEBUG] Shift keyup - getModifierState: false, tracked: true  ← First keyup
[PHANTOM DEBUG] Shift keydown - getModifierState: true, tracked: false
[PHANTOM DEBUG] Shift keyup - getModifierState: false, tracked: true  ← Second keyup
```

## Why Our Detection Failed

1. **Assumption**: Phantom keyup would have `getModifierState: true` while real keyup has `false`
2. **Reality**: Both phantom and real keyup events have `getModifierState: false`
3. **Result**: We can't use modifier state to distinguish phantom from real events

## Pattern-Based Detection Options

### Option 1: Suppress First Shift Keyup When Followed by Numpad
- If Shift keyup occurs and numpad keydown follows within 2-5ms, suppress the keyup
- Problem: Requires lookahead or delayed processing

### Option 2: Track Shift Hold Duration
- Real Shift presses are typically 200ms+ 
- Phantom keyup happens much faster after keydown
- Problem: Users might actually tap Shift quickly

### Option 3: Numpad State Machine
- When Shift is down and numpad is pressed, enter "phantom suppression mode"
- Suppress the next Shift up/down pair
- Exit mode after real Shift keyup (longer time gap)

### Option 4: Event Reordering Buffer
- Buffer all events for 10ms
- Reorder to put numpad events before phantom Shift events
- Process in corrected order

## Next Steps

The most reliable approach seems to be Option 3 - a state machine that:
1. Detects Shift+Numpad combination
2. Suppresses the bracketing phantom events
3. Exits suppression after sufficient time gap

This avoids relying on unreliable `getModifierState` and instead uses the predictable pattern of phantom events around numpad activity.