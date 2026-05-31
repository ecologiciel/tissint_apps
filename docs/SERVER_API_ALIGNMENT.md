# Server API Alignment

The mobile API client is now aligned with the current Tinssit server contract.

## Source Of Truth

- Server OpenAPI: `Tinssit_serveur/docs/openapi.json`
- Server-generated TypeScript contract copied into mobile: `packages/api-client/src/generated/server-types.ts`
- Runtime mobile client: `packages/api-client/src/tissint-client.ts`

## Confirmed Server Endpoints

| Flow | Endpoint | Mobile client method |
| --- | --- | --- |
| Health check | `GET /health` | `tissintClient.health()` |
| Register | `POST /api/v1/auth/register` | `tissintClient.register()` |
| Login | `POST /api/v1/auth/login` | `tissintClient.login()` |
| Current user | `GET /api/v1/auth/me` | `tissintClient.me()` |
| Refresh session | `POST /api/v1/auth/refresh` | `tissintClient.refresh()` |
| Logout | `POST /api/v1/auth/logout` | `tissintClient.logout()` |
| Quota snapshot | `GET /api/v1/quota/me` with `X-User-Id` | `tissintClient.quota()` |
| Exterior scan | `POST /api/v1/scan/exterior` | `tissintClient.scanExterior()` |
| Interior cut | `PATCH /api/v1/scan/{scan_id}/interior` | `tissintClient.addInterior()` |
| Collection list | `GET /api/v1/collection` with `X-User-Id` | `tissintClient.listCollection()` |
| Collection add/detail | `POST/GET /api/v1/collection/{scan_id}` with `X-User-Id` | `tissintClient.addToCollection()` / `getCollectionItem()` |
| Marketplace publish | `POST /api/v1/marketplace/publish/{scan_id}` with `{ price?, title?, description?, price_mode?, region? }` | `tissintClient.createListing()` / `publishListing()` |
| Marketplace list | `GET /api/v1/marketplace/listings` | `tissintClient.listMarketplace()` |
| Marketplace detail | `GET /api/v1/marketplace/listings/{listing_id}` | `tissintClient.getListing()` |
| Admin radar | `GET /api/v1/admin/radar` | `tissintClient.listAdminRadar()` |
| Admin radar actions | `POST /api/v1/admin/radar/{listing_id}/reserve|release|reject` | `reserveAdminListing()` / `releaseAdminListing()` / `rejectAdminListing()` |
| Admin audit | `GET /api/v1/admin/audit` | `tissintClient.listAuditLogs()` |
| Billing checkout | `POST /api/v1/billing/checkout` | `tissintClient.createCheckout()` |
| Billing subscription | `GET /api/v1/billing/subscription` | `tissintClient.getSubscription()` |
| Billing cancel | `POST /api/v1/billing/cancel` | `tissintClient.cancelSubscription()` |
| Billing invoices | `GET /api/v1/billing/invoices` | `tissintClient.listInvoices()` |

## Still Mocked Or Future Server Work

These client methods still reference routes not implemented by the current FastAPI server:

- Favorites: `/api/v1/marketplace/favorites*`
- Alerts: `/api/v1/marketplace/alerts*`

Keep `EXPO_PUBLIC_TISSINT_API_MODE=mock` for flows above until the server exposes those endpoints.

Marketplace publish now relies on the server to reject direct contact leakage with `CONTACT_LEAK_DETECTED`, while the mobile app keeps its local pre-check for faster feedback.
Billing is now server-authored: the mobile app reads role, subscription status, checkout status, and invoices from the backend contract instead of trusting local premium elevation.
