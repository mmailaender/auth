---
trigger: always_on
---

# Code Rules

## Priorities

1. Preserve and improve the existing architecture, DX, and UX.
2. Stay consistent with the existing codebase and conventions.
3. Keep changes minimal, focused, and easy to review.

## Implementation

- Write clean, maintainable, and well-documented code.
- Use TypeScript for all new code.
- Never use `any`.
- Prefer existing patterns, utilities, and types over introducing new ones.
- Do not refactor unrelated code unless it is necessary for the task.

## Documentation

If you add a feature or change the API, update:

- `README.md`
- `CHANGELOG.md`

## Multi-Framework Parity

This repo ships two jsrepo registries: `@auth/svelte` and `@auth/react`.
Every feature, fix, or component change must be applied to **both** `svelte/` and `react/`.

- **New UI component?** Create in both `svelte/src/lib/` and `react/src/lib/`.
- **Convex change?** Only touch `shared/convex/` — both frameworks pick it up via symlinks.
- **New primitive?** Add an Ark UI Svelte wrapper (`@ark-ui/svelte`) AND an Ark UI React wrapper (`@ark-ui/react`).
- **Navigation/routing change?** Update via `RouterAdapter` in React; SvelteKit-specific in Svelte.
- **New jsrepo item?** Add to BOTH `svelte/jsrepo.config.ts` and `react/jsrepo.config.ts`.

### Shared code location

- `shared/convex/` — Single source of truth for all Convex backend code (framework-agnostic).
- `shared/themes/` — CSS themes shared across all frameworks.
- `svelte/src/convex` and `react/src/convex` are **symlinks** to `../../shared/convex`.
- Each framework generates its own `_generated/` directory inside the symlinked location.

## jsrepo Registry

After every change, check if jsrepo configs need updating:

- **Svelte registry:** `svelte/jsrepo.config.ts`
- **React registry:** `react/jsrepo.config.ts`
- **New file in a convex item?** Add it with `dependencyResolution: 'manual'` + explicit `dependencies` for any npm packages it imports. Add to BOTH configs.
- **New npm import in a manual file?** Add the package to that file's `dependencies` array.
- **New file in a lib/routes item?** Ensure it's covered by an existing directory entry or add it explicitly.

Verify with `jsrepo build` from both directories (must exit 0).

Update `CHANGELOG.md` with affected jsrepo items so users know what to update, e.g.:

```md
- `users/lib`: Fixed avatar upload validation
  → `jsrepo update 'users/lib'`
```

## Testing and Validation

Ensure all new code is covered by tests.

Before finishing, run:

```bash
# Svelte
cd svelte && pnpm test && pnpm check 2>&1 && pnpm format && pnpm lint && jsrepo build
# React
cd ../react && pnpm test && pnpm tsc --noEmit && pnpm format && pnpm lint && jsrepo build
# Convex (from either framework dir)
cd ../svelte && timeout 30 npx convex dev --once 2>&1 || true
```

Fix all errors and warnings related to your changes.
