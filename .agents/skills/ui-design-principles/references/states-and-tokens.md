# UI States, Tokens, and Accessibility

Implementation-ready state specs, design tokens, and a11y baselines. Read when documenting components or tokens.

## Every state documented

| State | Must Define |
|-------|-------------|
| Default | Base appearance |
| Hover | Desktop interaction |
| Focus | Keyboard navigation (MUST be visible) |
| Active/Pressed | Click/tap feedback |
| Disabled | Unavailable state |
| Loading | Async operations |
| Error | Validation failures |
| Empty | No data state |

### WRONG: Missing states

```
Button design shows only default appearance
Form shows only filled state
List shows only populated state
```

### CORRECT: Complete specification

```
Button states:
- Default: bg-blue-600 text-white
- Hover: bg-blue-700
- Focus: ring-2 ring-blue-400 ring-offset-2
- Active: bg-blue-800
- Disabled: bg-gray-300 text-gray-500 cursor-not-allowed
- Loading: spinner icon, pointer-events-none

Form field states:
- Empty: placeholder visible, border-gray-300
- Filled: value visible, border-gray-300
- Focus: border-blue-500, ring
- Error: border-red-500, error message below
- Disabled: bg-gray-100, cursor-not-allowed
```

## Design system tokens

Required categories: colors (primary, secondary, semantic), typography (scale, weights, line heights), spacing (4/8/12/16/24/32/48), borders, shadows, motion (duration, easing).

```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-error: #dc2626;
  --color-success: #16a34a;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

## Accessibility (non-negotiable)

| Requirement | Standard |
|-------------|----------|
| Text contrast | 4.5:1 normal, 3:1 large |
| Interactive contrast | 3:1 for UI components |
| Focus visible | Always visible focus indicator |
| Keyboard navigation | All interactions keyboard accessible |
| Color independence | Never rely on color alone |

```
WRONG: Error = red border only; Success = green checkmark only
CORRECT: Error = red border + icon + message; Success = checkmark + "Saved successfully"
```

## Component checklist

- [ ] Interactive states (hover, focus, active, disabled)
- [ ] Data states (empty, loading, error, populated)
- [ ] Responsive behavior
- [ ] Accessibility requirements
- [ ] Spacing, typography, color (light/dark if applicable)
