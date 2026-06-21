# Align Sidebar User Menu Height

## User Request

Continue converging the Claude Console clone using OBU comparisons and focus on visible sidebar fidelity.

## Changes

- Adjusted the full sidebar user menu button from 44px to the source 48px height.
- Used a small negative vertical margin so the button matches source geometry without changing the surrounding footer layout.
- Verified the local button rect against Claude Console with Open Browser Use.

## Intent

Match the source sidebar footer sizing more closely while keeping behavior and navigation unchanged.

## Files

- `apps/console/src/App.tsx`
