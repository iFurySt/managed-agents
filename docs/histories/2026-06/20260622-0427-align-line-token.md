# Align Line Token

## User Request

Converge the Claude Console visual clone quickly without expanding functional scope, focusing on obvious typography and spacing differences.

## Changes

- Updated the console Tailwind `line` color token to match Claude Console's black 10% alpha border color.
- Verified the token now drives visible sidebar, footer, and Skills list borders against the source page.

## Intent

Use a shared design token instead of page-by-page patches so the remaining visible border differences converge consistently across the console.

## Files

- `apps/console/tailwind.config.ts`
