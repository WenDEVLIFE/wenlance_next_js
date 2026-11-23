---
name: ui-design-principles
description: >-
  Applies UI visual hierarchy, spacing, typography, and interaction clarity for
  product interfaces. Use this skill when designing or critiquing UI layout and
  visual design quality. Do not use when/for data-chart encoding choices (use
  data-visualization) or React state architecture (use react-development).
version: 1.2.0
---

# UI Design Principles

## Critical rules

- Design with distinctive identity — reject generic Bootstrap / AI-aesthetic defaults.
- Context before design: product, users, goals, constraints first.
- Show, don't tell — visual artifacts, not prose-only specs.
- Implementation-ready: every interactive and data state documented.
- Explore completely diverse directions (opposite spectrum ends), not color swaps.
- Accessibility is non-negotiable: contrast, visible focus, keyboard, never color alone.
- Before discovery/exploration examples or state/token catalogs, read the matching resource below.

## Workflow

1. Research product type, users, strategic goal, and constraints.
2. Before proposing directions, read [references/exploration.md](references/exploration.md).
3. Produce ≥3 genuinely diverse visual directions; pick with the user.
4. Before documenting tokens and states, read [references/states-and-tokens.md](references/states-and-tokens.md).
5. Specify tokens (color, type, space, border, shadow, motion) and full state sets.
6. Deliver visuals that unblock developers — no "figure it out in code."

## Resources

- [references/exploration.md](references/exploration.md) — discovery, diverse directions, anti-patterns. Read before designing.
- [references/states-and-tokens.md](references/states-and-tokens.md) — state specs, tokens, a11y, checklist. Read when documenting.

## Validation

- [ ] Context researched before pixels
- [ ] Directions are genuinely diverse
- [ ] All interactive and data states documented
- [ ] Accessibility built in (contrast, focus, keyboard, multi-cue status)
- [ ] Developers can implement without unanswered questions
- [ ] Delivered visual artifacts, not descriptions only

## Constraints

- Implementing already-specified UI → `react-development`. Browser verification → `agent-browser`. Charts → `data-visualization`.
- Adjacent: `storybook-journeys`, `design-principles`, `documentation-standards`.
