---
name: anti-ai-slop
description: Create or refine frontend interfaces so they feel intentional, distinctive, and human-made instead of generic AI-generated UI. Use when a user asks for anti-slop design, a less AI-looking interface, or a strict visual critique and implementation pass. Includes a curated toolbox of vetted UI, motion, icon, typography, color, and data-viz libraries.
---

# Anti-AI Slop

Design and implement a coherent frontend with visible authorship. Preserve the product's purpose, content, existing brand assets, and working behavior while removing predictable, template-like visual decisions.

## Hard rules

These requirements bind every run of this skill. Adapt a rule only when it is genuinely impossible to satisfy, and report the adaptation and its reason in the handoff. Silently skipping a rule is a failed task.

- Work through the sections above in order. Complete inspection before editing.
- Touch only what the request requires. Justify any scope expansion explicitly.
- Never claim a check ran when it did not, cite a file, line, or result not actually observed, or describe unverified behavior as verified.
- Re-read the final diff before handoff. Remove debug artifacts, temporary probes, and unrelated changes.
- Name every added dependency, environment variable, and configuration change in the handoff with the reason for it.
- Enforce every hard visual rule against compiled output and component-library defaults, not only the styles you write. A banned font, gradient, or blanket letter spacing that returns through a fallback or utility class still counts as a violation.
- Run lint, typecheck, tests, and the build for every affected project before handoff. A visual-only change does not excuse skipping them.
- Inspect the rendered interface at narrow, medium, and wide viewports, and exercise hover, focus-visible, active, keyboard, and reduced-motion states on touched components.

## Stop and ask

Ask before proceeding when the requested direction conflicts with a hard visual rule, when an existing design system conflicts with these rules and no precedence is stated, or when a required brand asset is missing and inventing one would be the only way forward.

## Establish the direction

1. Read repository instructions, inspect the existing stack, and identify the real routes, components, tokens, assets, and content before editing.
2. Write a short internal art direction: mood, hierarchy, density, type voice, surface treatment, and motion character.
3. Prefer a small, reusable visual system over isolated decoration. Fix shared typography, spacing, color, shape, and motion primitives before patching individual components.
4. Treat common AI patterns as suspects: generic gradient heroes, purple/blue glow blobs, glass cards, excessive pills, identical rounded cards, arbitrary letter spacing, default dashboard grids, and unconsidered icon or font choices. Keep any such pattern only when the product or brand gives it a clear job.

## Hard visual rules

- **No gradients by default.** Do not add CSS gradients, gradient text, or decorative gradient blobs unless the user explicitly asks for them or they are absolutely necessary for a concrete readability, focus, or product requirement. Prefer flat color, tonal contrast, texture, imagery, borders, or restrained shadows. If an existing gradient is retained, state its job and why a simpler treatment would fail.
- **Use intentional geometry.** Choose rectangular corners, a modest and consistent radius, or true circles when the component is circular by nature. Avoid applying large, identical corner radii to every surface and avoid arbitrary rounding that makes the interface look like a component library demo. Pills are reserved for compact tags, filters, statuses, and controls whose shape communicates their function.
- **Keep letter spacing natural.** Use normal or near-zero tracking by default. Do not add blanket positive `letter-spacing`, especially to headings, labels, navigation, or buttons. Adjust tracking only when a specific typeface, case, size, or logo visibly benefits from it, and confirm the result at the actual rendered size.
- **Do not use monospace as a generic tech signal.** Reserve monospace for code, data where alignment is meaningful, or an art direction that genuinely depends on it.
- **Never choose these fonts:** `Inter`, `Space Grotesk`, `Poppins`, or `Geist`. Do not load or specify them as primary fonts or fallbacks in the resulting interface. Select a more distinctive, readable alternative that fits the art direction.
- **Use no more than two font families.** One family is preferred when it is expressive and readable. A second is allowed for a deliberate display role, such as a cursive-ish/editorial face paired with a modern sans-serif text face. Assign clear roles, load only the needed weights, and protect readable line length and hierarchy.
- **Make clickable controls look clickable.** Set `cursor: pointer` on buttons, links, and custom clickable controls. Keep appropriate `default`, `not-allowed`, or other state-specific cursors for noninteractive and disabled elements; do not apply pointer cursors to decorative containers. Cursor feedback complements, never replaces, keyboard focus and other visible interaction states.
- **Give visual changes motion.** Define a consistent duration and easing system, then apply it to relevant interactive and state-changing elements: links, buttons, inputs, menus, dialogs, cards, accordions, validation, loading, hover, focus, active, and page or section reveals. Use transform and opacity where possible; avoid `transition: all`, random durations, perpetual motion, and motion that delays access to content. A static element does not need gratuitous animation, but every meaningful visual state change should have a considered transition or an equally clear reduced-motion treatment.
- **Honor reduced motion.** Respect `prefers-reduced-motion`. Remove or substantially reduce nonessential movement while keeping state changes, focus, loading, and hierarchy understandable. Never make essential information depend on an animation completing.

## Choose the tools

Prefer the platform before any dependency. Modern CSS already covers most needs at zero bundle cost: transitions and keyframes, `linear()` spring-like easing, scroll-driven `animation-timeline`, View Transitions API, container queries, `color-mix()`, and OKLCH color. Add a library only when hand-rolling would cost accessibility, correctness, or quality; match the stack already present in the repository before importing anything new; name every added dependency in the handoff. Picks tagged React assume React 18+; everything else is multi-framework or vanilla.

### Headless primitives

Unstyled accessible behavior that you style is the default over themed kits whose stock look reads as template.

- **Base UI** — MUI-maintained, most actively developed primitive layer today, current shadcn/ui foundation. React.
- **Radix UI** — the battle-tested standard; ubiquitous though slower-moving since the WorkOS acquisition. React.
- **React Aria Components / hooks** — deepest WAI-ARIA and i18n coverage; use when accessibility is contractual. React.
- **Ark UI** — Zag.js state machines shared across React, Vue, and Solid from one codebase.
- **Ariakit** — small bundles, component/hook hybrid. React.
- **Headless UI** — small official Tailwind Labs set. React and Vue.
- **shadcn/ui** — copy-in components over Base UI/Radix plus Tailwind styles. Accept only as scaffolding restyled to the art direction; its stock zinc-neutral palette and uniform rounded cards are themselves slop tells.

### Motion

Order of preference: CSS first, one engine second, never two engines doing the same job.

- **CSS** — hover/focus/state transitions and keyframe reveals; `linear()` easing for spring feel; native scroll-driven animations where the browser matrix allows.
- **GSAP** — timelines, ScrollTrigger, SplitText, Draggable, CustomEase; free including plugins since 3.13. The choice when choreography defines the page. All frameworks.
- **Motion** (`motion/react`; formerly Framer Motion) — variants, `AnimatePresence` enter/exit, layout animation inside React trees.
- **anime.js v4** — modular lightweight tweens. All frameworks.
- **react-spring** — physics-based motion. React.
- **Lenis** — momentum smooth-scroll layer beneath GSAP ScrollTrigger; animates nothing itself.
- **Rive / Lottie** — designer-authored animation; Rive for interactive state machines, Lottie for self-contained loops.
- Vet every choice against `prefers-reduced-motion` before adopting it. A library without a reduced-motion story fails this skill's rules.

### Icons

One family per project, no emoji as interface icons, no mixing stroke and fill families.

- **Lucide** — ~1,700 stroke icons, cleanest tree-shaking, most active maintenance.
- **Phosphor** — six weights usable as a design token from Thin to Bold plus Duotone.
- **Tabler** — ~5,000 icons for wide domain coverage.
- **Heroicons**, **Iconoir**, **Radix Icons** — coherent smaller sets; Heroicons suits Tailwind projects.
- **Iconify** — meta-access to every major set when one family cannot cover the domain; treat as an exception, not a default.

### Typography

Never the banned faces (`Inter`, `Space Grotesk`, `Poppins`, `Geist`). At most two families with clear roles; load only needed weights, preferably variable.

- **Fontshare** (free): Satoshi, General Sans, Switzer for text sans; Cabinet Grotesk and Clash Display for display; Gambetta and Zodiak for serif or editorial voice.
- Distinctive Google Fonts: Bricolage Grotesque, Instrument Serif, Instrument Sans, Fraunces, Newsreader, Source Serif 4, Sora, Schibsted Grotesk, Hanken Grotesk, Archivo.
- Monospace only when code or data justifies it: JetBrains Mono, IBM Plex Mono, Fragment Mono.
- Self-host through **Fontsource** rather than runtime font CDN requests.

### Color and tokens

- Work in **OKLCH**: perceptually even scales, hue stable under lightness changes, Baseline across browsers. Derive ramps from one base token with `color-mix(in oklch, ...)`.
- **Tailwind v4** — CSS-first `@theme` tokens; override the default palette, whose stock hues are themselves a slop tell.
- **Open Props** — framework-agnostic token sets including easings, sizes, and borders.
- **Radix Colors** — accessible step scales when rolling your own would be wasteful.
- Validate foreground/background pairs against WCAG AA minimum; use APCA where precision matters.

### Interaction utilities

- **Floating UI** — tooltip and popover positioning when no primitive library is present. Vanilla core with framework adapters.
- **Embla** — unstyled carousel you skin entirely. JavaScript core with React, Vue, and Svelte packages.
- **Vaul** — drawer primitive. React. Restyle before shipping.

### Data visualization

Charts must be themed into the system; any chart-library default look is slop.

- **visx** — composable low-level charting primitives over D3. React.
- **Observable Plot** — concise declarative plots. Vanilla.
- **ECharts** — feature-complete canvas charts when theming depth is required.
- **D3** directly — full control at the highest effort.

### Spatial and 3D

Use only when the art direction genuinely calls for depth. Generic particle fields, floating blobs, and glow scenes remain banned patterns regardless of implementation quality.

- **Three.js**, or **React Three Fiber** as its React renderer, for real 3D scenes.
- **OGL** for a lighter WebGL abstraction.
- Degrade to static imagery under reduced motion, touch-only, and low-power contexts.

### Slop tells that return through defaults

Enforce the hard visual rules against compiled output even after your own CSS is clean: stock shadcn/ui palettes and radii, unthemed Material UI or Ant Design chrome, Tailwind default-palette hues, chart-library default colors, icon families mixed through Iconify convenience, and WebGL particle or glow backdrops.

## Implement the system

- Establish tokens for color roles, spacing rhythm, type scale, corner shapes, shadows, and motion before applying one-off values.
- Use contrast and composition to create hierarchy instead of gradients, glow, blur, or oversized rounded containers.
- Give each surface a reason to exist. Remove redundant cards, borders, badges, decorative icons, and visual noise that do not improve scanning or interaction.
- Select icons from one coherent family or the project's existing icon system. Do not use emoji as interface icons and do not mix unrelated stroke and fill styles.
- Define hover, focus-visible, active, disabled, loading, empty, error, and success states for the components touched by the work. Motion must not replace visible focus or status communication.
- Keep the composition responsive at narrow, medium, and wide viewports. Preserve essential content, comfortable touch targets, readable measure, keyboard access, and visible focus.
- Do not introduce a new dependency for a visual effect that existing CSS, the current design system, or a small component can handle. Keep expensive animation compositor-friendly and degrade it on touch, low-power, or reduced-motion contexts.

## Review for slop

Before handing off, inspect the actual rendered interface and ask:

- Is every color, typeface, radius, shadow, icon, and animation doing a specific job?
- Did any banned font, blanket letter spacing, generic gradient, excessive rounding, or unjustified monospace return through a fallback, component library, or utility class?
- Do repeated components feel related without becoming identical blobs?
- Do interactions have clear feedback, coherent easing, and accessible reduced-motion behavior?
- Does the design still feel authored when the content is long, empty, loading, invalid, viewed on mobile, or navigated by keyboard?

Run lint, typecheck, tests, and the build for every affected project. Exercise the primary interaction path at representative viewport sizes and, when possible, inspect hover, focus, active, loading, error, and reduced-motion states. Report any browser, device, or state that could not be verified. Verification is a completion gate: this work is not done until these checks ran and their actual outcomes are recorded, with failures reported verbatim.

## Handoff

Structure the handoff in four labeled parts: (1) What changed: the visual direction and the anti-slop decisions applied, including motion and reduced-motion behavior. (2) Evidence: the exact commands run with their real outcomes, plus the states and viewports inspected. (3) Gaps: any browser, device, or state that could not be verified and why. (4) Follow-ups: deliberately deferred issues. Do not claim polish or functionality that was not exercised.
