# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-02-normalize-remaining-keys/spec.md

## Technical Requirements

- Extend the existing `SYMBOL_TO_DIGIT_MAP` in keyMappings.ts to include additional punctuation symbols
- Create a new comprehensive mapping table `SYMBOL_TO_BASE_MAP` that includes both number and punctuation normalizations  
- Update the `normalizeKey()` function to use the expanded mapping table
- Maintain backward compatibility with existing number key normalization
- Add comprehensive test cases for all new punctuation key normalizations
- Update TypeScript types if needed to reflect the expanded functionality
- Ensure the normalization works consistently across different browsers
- Handle edge cases where event.key might be undefined or unexpected
- Document the US QWERTY layout assumption in code comments
- Performance should remain O(1) lookup time using hash map approach