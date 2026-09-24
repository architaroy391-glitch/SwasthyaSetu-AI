# SwasthyaSetu-AI implementation plan

## Goal
Build the complete responsive healthcare resource coordination application described in the attached brief, using the supplied SwasthyaSetu-AI logo throughout. The experience will be clearly labeled as a simulated demo and will keep humans in control of every operational decision.

## Product structure
- Public landing page at `/` with the specified message, animated healthcare-network visual, problem/solution flow, prediction preview, connected-map preview, offline workflow, privacy-preserving AI explanation, and final call to action.
- Authentication pages at `/login` and `/forgot-password`.
- Protected command-center shell with collapsible desktop navigation, mobile drawer and bottom actions, facility/role context, notifications, and online/offline/sync indicators.
- Operational pages: `/dashboard`, `/inventory`, `/predictions`, `/network`, `/resources`, `/emergency`, `/redistribution`, `/analytics`, `/notifications`, and `/settings`.
- Every content page will have unique metadata, responsive layouts, keyboard support, and loading, empty, error, success, and offline states where relevant.

## Visual system and supplied logo
- Use the uploaded logo as the primary identity in the landing page, login, application navigation, and favicon.
- Refine its presentation through careful cropping/background treatment without redrawing or replacing the supplied artwork.
- Build a restrained healthcare command-center system: crisp light surfaces, deep ink text, teal/green brand accents from the logo, blue selection states, amber warnings, red critical states, and gray stale/offline states.
- Favor dense, scannable operational layouts, clear charts, accessible status symbols plus text, stable map/dashboard dimensions, and minimal purposeful motion.

## Working demo foundation
- Enable Lovable Cloud for secure login, persistent operational data, row-level access controls, audit history, and synchronization.
- Create separate role assignments for PHC staff, hospital administrators, district administrators, emergency coordinators, state analysts, and super administrators.
- Model facilities, geography, medicines, inventory and transactions, beds, staff, predictions, redistribution requests, emergencies/responses, notifications, audit events, sync operations, and model versions.
- Seed fictional Indian facility/resource records in migrations so the first authenticated view is populated; prominently mark every value as simulated demo data.
- Adapt the brief’s Prisma/API wording to the project’s supported TanStack Start server functions and Lovable Cloud database while preserving typed validation and access boundaries.

## Core workflows
- Dashboard: KPI overview, network health, risk charts, resource availability, emergency activity, recommendations, notifications, and optional Swasthya AI panel.
- Inventory: searchable/paginated stock table, add/update form, expiry and risk summaries, deterministic days-remaining calculation, and locally queued offline updates.
- Predictions: historical/forecast chart, safety stock and depletion markers, confidence/model/timestamp, contributing factors, nearby surplus, and explicitly labeled AI recommendations.
- Resource network: Google map as the primary workspace, clustered status markers, app-owned search/filter controls, facility detail drawer, inventory links, resource requests, and a useful list fallback.
- Redistribution: source/destination/resource/quantity reasoning, distance and travel time, mapped route, modify/approve/reject actions, mandatory confirmation, role checks, and audit timeline.
- Emergency SOS: validated creation form, mapped incident, eligible nearby facilities, routes and travel times, response state progression, and escalation-ready status history.
- Beds and staff, analytics with date/geographic filters and CSV/PDF exports, notifications with read state, and settings for facility/users/roles/alerts/connectivity/privacy.

## Maps and AI
- Connect Google Maps Platform and use the browser map key only for map rendering; use protected server calls for Places, geocoding, and Routes.
- Keep Maps usage bounded through debounced searches, caching, result limits, marker clustering, and authenticated server operations.
- Provide a mock facility list and deterministic route/resource data whenever Maps is unavailable, never a blank map.
- Implement Swasthya AI as operational assistance over retrieved application data only. Answers will show “AI-generated recommendation,” “Based on available system data,” timestamp, confidence/model details, and “Requires human approval.”
- Keep prediction logic deterministic for the demo: stock divided by forecast daily use, with the specified critical/high/medium/low thresholds and a replaceable service boundary.

## Offline and resilience
- Use IndexedDB for allowed offline inventory changes and a typed synchronization queue.
- Detect connectivity, show pending counts, replay operations after reconnection, surface conflicts/retries, and preserve local changes on failure.
- Add demo controls for stock depletion, predicted shortage, offline facility, SOS responses, redistribution approval, internet loss, queued edits, reconnection, and successful sync.
- Include SMS provider interfaces without invented credentials or automatic sends.

## Verification
- Add focused tests for prediction thresholds, role permissions, validation, offline queue replay, and approval/audit behavior.
- Exercise the full required demonstration: sign in, inspect facility inventory, reduce stock, generate risk, find surplus and route, approve as an authorized role, trigger SOS, simulate offline editing, reconnect, and verify synchronization.
- Verify desktop and mobile layouts, map fallback, keyboard/focus behavior, no overlapping text, and current build/runtime logs.

## Technical notes
- The project remains on its supported React 19 + TanStack Start/Vite stack; TanStack Router replaces the brief’s React Router request while preserving all requested URLs.
- TanStack Query owns server-state caching; React Hook Form and Zod handle forms; Recharts handles operational charts; accessible existing UI primitives are reused.
- No patient records or unnecessary personal information are stored. Predictions remain advisory, supplies are never transferred automatically, and demo information is never presented as live.
