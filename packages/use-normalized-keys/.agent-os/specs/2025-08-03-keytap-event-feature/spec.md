# Spec Requirements Document

> Spec: Keytap Event Feature
> Created: 2025-08-03
> Status: Planning

## Overview

Add a new "keytap" event that fires when a keydown occurs within a configurable threshold (default 200ms) of its corresponding keyup, providing a simplified API for detecting quick key presses versus long holds. This feature will operate alongside existing keydown/keyup events to eliminate the need for consumers to manually track timing relationships.

## User Stories

### Quick Action Detection

As a game developer, I want to detect quick key taps separately from long key holds, so that I can implement different behaviors for rapid inputs versus sustained actions.

The developer can listen for keytap events to trigger quick actions like weapon firing, while using existing keydown/keyup events or the duration properties for sustained actions like movement. The keytap event will include the same normalized key information as other events, along with the actual duration between keydown and keyup.

### Simplified Input Handling

As an application developer, I want to avoid manually tracking keydown/keyup timing relationships, so that I can focus on application logic rather than low-level input timing.

The keytap event will automatically handle the timing logic and fire only when the key press duration is below the configured threshold, reducing boilerplate code and potential timing bugs in consumer applications.

## Spec Scope

1. **Keytap Event Generation** - Add a new event type that fires when keyup occurs within the configured threshold after keydown
2. **Configurable Threshold** - Allow consumers to configure the tap threshold via hook options (default 200ms)
3. **Event Data Consistency** - Ensure keytap events contain the same normalized key data as existing events
4. **Backward Compatibility** - Maintain all existing keydown/keyup event behavior without changes
5. **Duration Information** - Include actual measured duration in keytap event data

## Out of Scope

- Modifying existing keydown/keyup event behavior or timing
- Adding keytap detection to sequence detection system in this phase
- Creating separate hook options for different keys having different thresholds

## Expected Deliverable

1. Keytap events fire consistently when key presses are shorter than the configured threshold
2. The hook options include a keytapThreshold property that defaults to 200ms and is configurable
3. Existing keydown/keyup events continue to fire normally with no behavioral changes