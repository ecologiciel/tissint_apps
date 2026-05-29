# Contrats API Mobile / Serveur

## Contrat deja supporte par le client mobile

### Scan exterieur

```txt
POST /api/v1/scan/exterior
Content-Type: multipart/form-data
Header: X-API-Key
```

Champs:

- `client_uuid`
- `user_id` temporaire, a remplacer par le user id issu du JWT
- `files_exterior` repete minimum 3 fois
- `file_interior` optionnel
- `weight` optionnel
- `magnetic` optionnel
- `latitude` optionnel
- `longitude` optionnel

### Ajout de coupe

```txt
PATCH /api/v1/scan/{scan_id}/interior
Content-Type: multipart/form-data
Header: X-API-Key
```

Champ:

- `file_interior`

### Marketplace

```txt
GET /api/v1/marketplace/listings
POST /api/v1/marketplace/publish/{scan_id}
```

Le serveur actuel renvoie un marketplace minimal. Le client mobile le normalise vers
`MarketplaceListing`.

## Contrats production a ajouter au serveur

### Auth

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Obligatoire:

- JWT court;
- refresh token rotatif;
- roles `free`, `premium`, `admin`;
- device id signe;
- rate limiting.

Reponse attendue par le mobile:

```json
{
  "access_token": "jwt",
  "refresh_token": "rotating-token",
  "expires_at": "2026-05-29T12:00:00Z",
  "user": {
    "id": "usr_123",
    "first_name": "Ali",
    "last_name": "Tissint",
    "phone": "+212600000000",
    "email": "ali@example.com",
    "role": "free"
  },
  "quota": {
    "role": "free",
    "daily_limit": 5,
    "remaining_today": 5
  }
}
```

### Quota

```txt
GET /api/v1/quota/me
```

Doit retourner:

```json
{
  "role": "free",
  "daily_limit": 5,
  "remaining_today": 4,
  "resets_at": "2026-05-29T23:59:59Z"
}
```

### Collection

```txt
GET    /api/v1/collection
GET    /api/v1/collection/{scan_id}
POST   /api/v1/collection/{scan_id}
DELETE /api/v1/collection/{scan_id}
```

### Marketplace production

```txt
POST  /api/v1/marketplace/listings
PATCH /api/v1/marketplace/listings/{listing_id}
POST  /api/v1/marketplace/listings/{listing_id}/archive
POST  /api/v1/marketplace/listings/{listing_id}/sold
GET   /api/v1/marketplace/listings/{listing_id}
GET   /api/v1/marketplace/favorites
POST  /api/v1/marketplace/favorites/{listing_id}
DELETE /api/v1/marketplace/favorites/{listing_id}
GET   /api/v1/marketplace/alerts
POST  /api/v1/marketplace/alerts
```

Statuts:

```txt
draft
pending_admin
institutional_hold_24h
published
admin_reserved
sold
rejected
archived
```

Payload creation attendu:

```json
{
  "scan_id": "scn_123",
  "title": "Chondrite H5",
  "description": "Description sans telephone",
  "price_mode": "fixed_total",
  "price_value": 4500,
  "weight_gram": 120,
  "region": "Tata"
}
```

Le serveur doit refuser toute description contenant telephone, WhatsApp ou email.

### Favoris

Reponse attendue:

```json
[
  {
    "listing_id": "lst_123",
    "created_at": "2026-05-29T12:00:00Z"
  }
]
```

Regle serveur:

- accessible aux roles `premium` et `admin`;
- refuser `free` avec `403 PREMIUM_REQUIRED`.

### Alertes

Payload creation:

```json
{
  "class_name": "Chondrite",
  "region": "Tata",
  "min_score": 0.85,
  "rare_only": false,
  "frequency": "instant"
}
```

Reponse:

```json
{
  "id": "alr_123",
  "class_name": "Chondrite",
  "region": "Tata",
  "min_score": 0.85,
  "rare_only": false,
  "frequency": "instant",
  "active": true,
  "created_at": "2026-05-29T12:00:00Z"
}
```

Regle serveur:

- accessible aux roles `premium` et `admin`;
- notifications push/email seront branchees plus tard sur ces regles.

### Premium

```txt
POST /api/v1/billing/checkout
POST /api/v1/billing/webhook
GET  /api/v1/billing/subscription
```

Le mobile ne doit jamais decider seul qu'un compte est premium.

### Admin

```txt
GET  /api/v1/admin/radar
POST /api/v1/admin/radar/{scan_id}/reserve
POST /api/v1/admin/radar/{scan_id}/publish
POST /api/v1/admin/radar/{scan_id}/reject
```
