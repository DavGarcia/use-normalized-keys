# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-03-keytap-event-feature/spec.md

## Technical Requirements

- Add new "keytap" event type to the NormalizedKeyEvent type system that includes duration, key, and timing information
- Extend UseNormalizedKeysOptions interface to include optional keytapThreshold property (number, default 200ms) 
- Modify the updateKeyState function to emit keytap events when keyup occurs within threshold time of keydown
- Ensure keytap events contain the same normalized key data structure as existing keydown/keyup events
- Implement keytap event emission logic that fires after keyup processing but before sequence processing
- Add keytap event support to the event listener callback system without disrupting existing event flow
- Include actual measured duration in keytap event data to allow consumers to access precise timing
- Maintain all existing keydown/keyup event behavior and timing without modifications
- Ensure keytap events are suppressed for auto-repeat key events (only fire for discrete press-release cycles)
- Apply the same platform quirk handling and input field exclusion logic to keytap events as other events