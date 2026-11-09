# StorePulse Web Application

Web application of **StorePulse**, the IoT platform of VanguardTech for commercial galleries in Lima: safety
monitoring, utility consumption and billing information for gallery administrators and their tenants.

This application is the workspace of the **Gallery Administrator**. The tenant uses the
[mobile application](https://github.com/VanguardTechIot/storepulse-mobile); safety incidents and utility meters
are therefore attended from the mobile application and no longer have views here.

| Repository | Role |
|---|---|
| [storepulse-platform](https://github.com/VanguardTechIot/storepulse-platform) | REST API (Spring Boot) consumed by this application |
| [storepulse-edge](https://github.com/VanguardTechIot/storepulse-edge) | Edge API that receives the telemetry of the IoT nodes |
| [storepulse-mobile](https://github.com/VanguardTechIot/storepulse-mobile) | Tenant application (Flutter) |
| [storepulse-landing-page](https://github.com/VanguardTechIot/storepulse-landing-page) | Public landing page |
| [storepulse-report](https://github.com/VanguardTechIot/storepulse-report) | Project report (DDD, architecture, user stories) |

## Stack

- Angular 22 (standalone components, signals, lazy routes) and Angular Material 22.
- TypeScript 5, Vitest for unit tests.
- Own i18n layer (`TranslationService`) with `en-US` and `es-419` dictionaries in `public/i18n/`.
- [StorePulse REST API](https://github.com/VanguardTechIot/storepulse-platform) (Spring Boot) as the only data source.

## Getting started

Start the REST API first (`storepulse-platform`, http://localhost:8080/api/v1), then:

```bash
npm install
npm start          # http://localhost:4200
```

| Script | Purpose |
|---|---|
| `npm start` | Development server with the `development` configuration (`src/environments/environment.development.ts`, API at `localhost:8080`). |
| `npm run build` | Production build into `dist/storepulse-web-application` (API URL from `src/environments/environment.ts`). |
| `npm test` | Unit tests with Vitest. |

The REST API base URL and every endpoint path live in the environment files; no component builds a URL by itself.
The IAM interceptor sends the JWT of the session to the API, and a `401` answer closes the session and goes back
to sign-in.

## Architecture

The application is organised by **Bounded Context**, following the strategic design of the project report
(section 4.1). Every context is a folder of `src/app/` with the same four layers:

```
<context>/
  domain/          entities, value objects, commands, enums and the repository contract (no Angular)
  application/     stores (signals) that run the use cases and hold the state of the views
  infrastructure/  HTTP repositories, response models, assemblers and ACL facades to other contexts
  presentation/    views (routed), components, validators and styles
  <context>.routes.ts
```

| Folder | Bounded Context | Responsibility |
|---|---|---|
| `iam/` | Identity and Access Management | Sign-up, sign-in, password recovery, session, guards and the HTTP interceptor. |
| `profiles-preferences/` | Profiles and Preferences | Profile of the signed-in user, photo and subscription summary. |
| `property-management/` | Property Management | Commercial gallery, its units (stores and common areas), floor layout and tenant invitations. |
| `property-communication/` | Property Communication | Conversations with tenants, notifications and announcements, communication logs and tenant assignments. |
| `resource-asset-management/` | Resource and Asset Management | IoT devices installed in the gallery. |
| `monitoring/` | Service Execution and Monitoring | Telemetry and consumption received from the devices. |
| `dashboard-analytics/` | Dashboard and Analytics | Consolidated dashboard and alert center. |
| `utility-billing/` | Utility Billing | Utility bills and billing disputes. |
| `subscriptions-payments/` | Subscriptions and Payments | Plan catalog, subscription of the gallery and payment history. |
| `shared/` | Shared kernel | Base entity, HTTP helpers, i18n, layout (toolbar, sidebar), reusable components and page styles. |

Rules the code follows:

- A context never imports the domain of another context. It reads what it needs through an **ACL facade** in
  its `infrastructure/acl/` folder (for example `property-communication/infrastructure/acl/property-context-facade.ts`),
  and navigates to other contexts only through `shared/routing/app-nav.ts`.
- The domain validates its business rules and throws a typed error (`PropertyError`, `CommunicationError`, ...)
  whose code is also the i18n key of the message shown to the user.
- Views read and write state only through the store of their context; stores call the repository contract,
  never `HttpClient`.
- Every text shown to the user is an i18n key; route titles are keys too, translated by `TranslatedTitleStrategy`.

## Property Management

Workspace of the administrator over the property (`/commercial-units`).

| Route | View | Purpose |
|---|---|---|
| `/commercial-units` | Unit list | Stores and common areas with filters, KPIs and the actions of each unit. |
| `/commercial-units/floors` | Floor layout | Map of the units per floor with their occupancy status. |
| `/commercial-units/invitations` | Lease management | Tenant invitations sent per store and their status. |
| `/commercial-units/gallery` | Gallery detail | Registration and general data of the gallery (continues the sign-up). |
| `/commercial-units/:unitId` | Unit detail | Data of a unit, its tenant and its linked devices. |

Business rules kept in the domain: a gallery per administrator; unit codes unique within the gallery (common
areas by name); a store is removed only when it has no tenant and no devices; invitations are valid for 7 days,
only for available stores, and a pending invitation can be revoked or resent.

REST API endpoints used: `GET/POST /galleries`, `PUT /galleries/{id}`, `GET/POST /galleries/{galleryId}/units`,
`GET/PATCH /units/{id}`, `POST /units/{unitId}/invite`, `GET /tenant-invitations`,
`PATCH /tenant-invitations/{id}/revoke`.

## Property Communication

Communication between the administration and the tenants (`/communication`).

| Route | View | Purpose |
|---|---|---|
| `/communication/conversations` | Conversation list | Open and resolved conversations with tenants. |
| `/communication/conversations/:id` | Conversation detail | Thread of messages with attachments; resolve the conversation. |
| `/communication/notifications` | Tenant notifications | Notifications sent, with their channel and delivery status; announcements and incident notices. |
| `/communication/logs` | Communication logs | Trace of every communication for audit. |
| `/communication/assignments` | Tenant assignments | Which tenant occupies each store; assign and terminate. |

Business rules kept in the domain: a conversation accepts messages only while it is open; a message has between
1 and 2000 characters and attachments of up to 2 MB (PDF, JPEG, PNG, WebP); a store has at most one active
assignment; a failed notification can be retried.

REST API endpoints used: `/conversations`, `/conversations/{id}/messages`, `/conversations/{id}/resolve`,
`/tenant-notifications`, `/tenant-notifications/announcements`, `/tenant-notifications/{id}/retry`,
`/communication-logs`, `/tenant-assignments`, `/tenant-assignments/{id}/terminate`. The platform registers the
communication logs, occupies or frees the store and notifies the tenant on assignment.

## Styles

Design tokens (`--sp-*`) are defined in `shared/presentation/styles/storepulse-theme.css` and applied to Material
through the `--mat-*` variables. Views of Property Management and Property Communication share the page layout of
`shared/presentation/styles/data-page.css` (header, KPI cards, filters, tables and states) and keep only their own
rules in `property.css` and `communication.css`. New styles use the tokens; hard-coded colours are avoided.

## Conventions

- Branches: `feature/<name>` from `develop`; releases through `release/x.y.z` into `main`.
- Commits: Conventional Commits with the context as scope, for example `feat(property-management): ...`.
- Code, identifiers and comments in English; user-facing texts through i18n.
