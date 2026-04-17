# MSK Suggestions Board

An admin dashboard for viewing and managing musculoskeletal (MSK) wellbeing suggestions given to employees by VIDA.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running the Application

From the project root:

```bash
npm run dev
```

This starts both the Express API (port 3001) and the Next.js frontend (port 3000) concurrently.

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Individual Services

```bash
npm run dev:server   # Express API only (port 3001)
npm run dev:client   # Next.js frontend only (port 3000)
```

## Features

- **View suggestions** — paginated table of MSK suggestions enriched with employee data
- **Filter** — filter by status, suggestion type, or employee (server-side)
- **Update status** — click a suggestion to open its detail panel, change status and add notes
- **Responsive** — side panel on desktop, bottom sheet on mobile

## Assumptions

- No authentication is required; the dashboard is for a single admin user
- Data is held in-memory and resets on server restart, which is acceptable for a demo
- The sample dataset is representative of the data shape; the API supports pagination and filtering for larger datasets
- The `overdue` status in the sample data is treated as a valid status alongside `pending`, `in_progress`, and `completed`
- No real-time updates are needed (single user context)

## Architecture

### Overview

The application is split into two packages:

- **`server/`** — Express REST API with in-memory data store
- **`client/`** — Next.js App Router frontend

The client proxies API requests to the Express server via Next.js rewrites, so both run on separate ports during development but the frontend only makes requests to its own origin.

### Backend

- **Express** serves a small REST API with three endpoints: list suggestions (with filtering and pagination), update a suggestion, and list employees
- **Zod** validates all incoming request data (query parameters and request bodies)
- **In-memory store** is seeded from `data/sample-data.json` on startup. The store interface is designed so it could be swapped for a real database without changing the API layer
- Consistent error response format across all endpoints

### Frontend

- **TanStack Query** manages all server state — caching, refetching on filter changes, and optimistic updates on status changes
- **shadcn/ui** provides the component foundation (table, select, sheet, badge, etc.)
- **URL search params** store filter state, making filtered views shareable and bookmarkable
- **Responsive detail panel** uses shadcn Sheet: opens from the right on desktop, from the bottom on mobile

### Types

TypeScript types are defined once in `server/src/types/` and imported by the client via a path alias (`@server/types`). This avoids duplication without adding monorepo tooling.

## Trade-offs

### Separate Express server vs Next.js API routes

I chose a standalone Express API over Next.js API routes to make the frontend/backend separation explicit. This demonstrates clear full-stack thinking: the API is independently testable, deployable, and could serve other clients (mobile, other services). The trade-off is additional setup (two processes, a proxy rewrite, CORS config) and slightly more complexity for what could be a simpler single-process app.

### In-memory store vs database

An in-memory store keeps the project easy to run with zero external dependencies, which is appropriate for a demo. The store exposes a clean interface (`getSuggestions`, `updateSuggestion`) that mirrors what a database repository would look like, so swapping in SQLite/Postgres would only require changing the store internals. The trade-off is that data resets on every server restart and there is no concurrency safety, which would be unacceptable in production.

### Server-side filtering and pagination vs client-side

With only 13 sample records, client-side filtering would be simpler and eliminate several API query parameters. I chose server-side to demonstrate how this would work at real scale, where sending thousands of records to the client is not viable. The trade-off is more code on both sides (Zod query validation, pagination metadata, URL param sync) for a benefit that is only visible with larger datasets.

### TypeScript path alias vs shared package

Importing types directly from the server via a `tsconfig.json` path alias is the simplest way to share types without a monorepo tool (Turborepo, Nx) or a third `shared/` package. The trade-off is that the client has a direct filesystem dependency on the server, which would not work if the two were in separate repositories. For a single-repo project of this size, the simplicity is worth it.

### URL search params for filter state vs component state

Storing filters in URL search params makes filtered views shareable and survives page refreshes. The trade-off is slightly more wiring (reading/writing URLSearchParams, syncing with React state) compared to a simple `useState`. For an admin dashboard where users might share links to specific filtered views, this is the right default.

### shadcn Sheet for detail panel vs custom drawer

shadcn's Sheet component provides an accessible, animated slide-in panel with minimal code. Using `side="right"` on desktop and `side="bottom"` on mobile gives the responsive behaviour we need. The trade-off is that detecting the viewport to switch sides requires a resize listener and a `useState`, which is a small amount of imperative code in an otherwise declarative component. A more robust approach would use a CSS-only solution or a dedicated responsive sheet library, but this works well for the scope.

### Scope: two slices vs broader coverage

The brief explicitly asks for "one or two small, well-chosen slices." I chose viewing (with filtering/pagination) and status updates because together they demonstrate a complete read-write flow through the full stack. Creating new suggestions was a close alternative but would have added form validation complexity without showing much new thinking. The trade-off is that the dashboard is not feature-complete, but completeness was explicitly not the goal.
