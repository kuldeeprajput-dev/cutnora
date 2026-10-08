# Contributing to Cutnora

Contributions to Cutnora's browser video editor are welcome: bug fixes,
accessibility improvements, documentation, and focused editor improvements.
Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Search [existing issues](https://github.com/kuldeeprajput-dev/cutnora/issues)
  and pull requests before opening a new one.
- For a new feature, dependency, or substantial redesign, open an issue first
  so the scope can be discussed before implementation.
- Keep each pull request focused. Avoid unrelated refactoring or formatting.

## Local setup

Use Node.js 24 and pnpm 11.20.0, the package manager version specified in
`package.json`.

1. Fork [Cutnora](https://github.com/kuldeeprajput-dev/cutnora) on GitHub.
2. Clone your fork and create a branch:

   ```bash
   git clone https://github.com/YOUR-USERNAME/cutnora.git
   cd cutnora
   git switch -c fix/short-description
   pnpm install --frozen-lockfile
   pnpm dev
   ```

3. Open <http://localhost:3000>. Stop the development server with `Ctrl+C`.

Use sample media and disposable projects when investigating storage or editing
bugs. Clearing browser site data can delete locally stored projects and media.
Do not include private recordings, personal data, or credentials in reports.

## Reporting bugs and suggesting features

For security vulnerabilities, follow [SECURITY.md](SECURITY.md) and report
privately instead of opening a public issue.

For a bug report, include:

- Steps to reproduce, expected behavior, and actual behavior.
- Browser version, operating system, and device or viewport size.
- Relevant console errors and screenshots, with private information removed.
- For media bugs: file format, codec if known, dimensions, duration, and a small
  sample you have permission to share.
- For export bugs: output format, resolution, frame rate, quality setting, and
  whether the issue occurs in the preview, the exported file, or both.

For a feature request, describe the editing problem it solves and the proposed
behavior. Include mobile and desktop expectations when relevant.

## Project structure and coding conventions

- `src/app/`: routes and layouts, including `(landing)`, `projects`, and `editor`.
- `src/modules/landing/`: the public landing page.
- `src/modules/projects/`: project management and schemas.
- `src/modules/editor/`: editor components, state, and editing features.
- `src/modules/core/`: shared persistence and media storage services.
- `src/shared/`: reusable components and utilities.

Follow the existing TypeScript, ESLint, and Prettier conventions. Read
`AGENTS.md` and the relevant installed Next.js documentation in
`node_modules/next/dist/docs/` before changing framework behavior.

Preserve module boundaries: `app` composes modules and shared components;
modules may use shared components; shared components should not introduce
dependencies on editor or project internals. Use feature exports through
`index.ts` where available instead of reaching into another feature's private
implementation.

Reuse existing theme tokens and UI components. Preserve desktop behavior for
mobile-only changes and mobile behavior for desktop-only changes. Consider
keyboard access, touch targets, focus behavior, and reduced motion preferences.

Keep project media on the user's device. Discuss changes that introduce media
uploads, tracking, or additional external requests before implementing them.
Release object URLs, audio resources, decoded video samples, and other owned
resources when they are no longer needed.

## Checking your changes

For code changes, use the existing checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Use focused checks while developing. Documentation-only changes do not require
an application build. Format changed files with
`pnpm exec prettier --write path/to/file`; avoid repository-wide formatting in
an unrelated pull request.

There is currently no automated test script in `package.json`. Describe the
checks you performed in your pull request and distinguish build or static
checks from browser and physical-device testing. If an existing check fails
outside your changes, report the command and failure rather than hiding it.

For editor changes, verify the affected interaction with a small sample project.
For storage changes, check persistence after reloading and preserve existing
data. For export changes, check the downloaded file, duration, frame pacing,
audio synchronization, and cancellation for the formats your change affects.

## Opening a pull request

Push your branch to your fork and open a pull request against the repository's
default branch. Include:

- A clear title and a summary of what changed and why.
- A related issue, if there is one; use `Closes #123` only when the PR resolves it.
- Reproduction or verification steps and the checks you actually ran.
- Screenshots or a short recording for visible UI changes when useful.
- Any compatibility, storage migration, licensing, or performance implications.

Maintainers may request changes before merging. Keep discussion respectful and
respond to review feedback. Do not commit generated build files, `node_modules`,
local databases, or secrets. Update `pnpm-lock.yaml` when dependencies change.

## Licensing

By submitting original code or documentation, you agree that your contribution
may be distributed under Cutnora's [MIT License](LICENSE). Submit only work you
have the right to contribute. Third-party dependencies, fonts, images, icons,
and sample media retain their own licenses; preserve required notices and
identify their sources when adding them.
