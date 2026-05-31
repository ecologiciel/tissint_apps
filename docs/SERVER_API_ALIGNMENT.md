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
| Exterior scan | `POST /api/v1/scan/exterior` | `tissintClient.scanExterior()` |
| Interior cut | `PATCH /api/v1/scan/{scan_id}/interior` | `tissintClient.addInterior()` |
| Marketplace publish | `POST /api/v1/marketplace/publish/{scan_id}` with optional `{ price }` | `tissintClient.createListing()` / `publishListing()` |
| Marketplace list | `GET /api/v1/marketplace/listings` | `tissintClient.listMarketplace()` |
| Marketplace detail | `GET /api/v1/marketplace/listings/{listing_id}` | `tissintClient.getListing()` |

## Still Mocked Or Future Server Work

These client methods still reference routes not implemented by the current FastAPI server:

- Auth: `/api/v1/auth/*`
- Quota: `/api/v1/quota/me`
- Collection: `/api/v1/collection*`
- Favorites: `/api/v1/marketplace/favorites*`
- Alerts: `/api/v1/marketplace/alerts*`
- Billing: `/api/v1/billing/*`

Keep `EXPO_PUBLIC_TISSINT_API_MODE=mock` for flows above until the server exposes those endpoints.
