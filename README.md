# Cutframe — Browser Video Editor

Cutframe is a production-quality, browser-based, local-first video editor built with Next.js, TypeScript, and Web APIs.

## Product Purpose

Cutframe allows users to edit multi-track videos, trim clips, adjust audio/text overlays, and export high-quality WebM and MP4 videos directly inside the web browser—without requiring cloud uploads or server-side video processing.

## Architecture

Cutframe runs entirely on the client side using modern Web APIs and local browser persistence:

- **Framework**: Next.js App Router with TypeScript (strict mode) & Tailwind CSS
- **State Management**: Zustand & Immer
- **Local Persistence**: Dexie.js (IndexedDB) for storing project metadata and media binary blobs locally
- **Real-Time Preview**: HTML5 2D Canvas rendering pipeline & Web Audio API engine
- **Video Export**: Browser-native `MediaRecorder` / Canvas Stream for WebM export, and client-side `@ffmpeg/ffmpeg` for optional MP4 conversion

## Development Commands

```bash
# Start local development server with Turbopack
pnpm dev

# Build production bundle
pnpm build

# Start production server
pnpm start

# Run ESLint check
pnpm lint

# Fix linting errors automatically
pnpm lint:fix

# Run TypeScript type check
pnpm typecheck

# Format files using Prettier
pnpm format

# Check formatting using Prettier
pnpm format:check
```

## Folder Boundaries & Architectural Rules

The codebase follows a strict module-based structure:

```
src/
├── app/                  # Next.js App Router routes & page layouts
│   ├── (marketing)/      # Landing page (warm off-white editorial theme)
│   └── studio/           # Editor dashboard & workspace (charcoal dark studio theme)
├── modules/              # Core domain modules
│   ├── marketing/        # Landing page logic & components
│   ├── projects/         # Project management, creation & schemas
│   └── editor/           # Multitrack video editor engine & features
│       └── features/     # Feature-level modules (canvas, timeline, inspector, etc.)
└── shared/               # Reusable UI primitives, hooks, & helpers
```

### Dependency Rules

1. `app/` can import from `modules/` and `shared/`.
2. `modules/` can import from `shared/`.
3. `shared/` must **never** import from `modules/`.
4. Feature modules (`editor/features/*`) must not reach into private implementation files of other features; all public contracts are exported through feature-level `index.ts` files.

## Local Browser Storage Approach

All imported user media (videos, audio, images) remain strictly on the user's local device. Media assets are read via the File API and stored as binary `Blob` objects inside IndexedDB using **Dexie.js**. Projects, track configurations, and clip keyframes are persisted to IndexedDB so edits survive browser refreshes.
