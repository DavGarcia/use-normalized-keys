# Spec Summary (Lite)

Add a new "keytap" event that fires when keyup occurs within a configurable threshold (default 200ms) of keydown, simplifying detection of quick key presses versus long holds. This operates alongside existing events without modifying their behavior, providing consumers with an easy way to distinguish rapid taps from sustained key presses.