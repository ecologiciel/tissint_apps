# Durcissement Securite

## Serveur

- Remplacer `user_id` FormData par l'identite extraite du JWT.
- Garder `X-API-Key` uniquement comme defense applicative supplementaire.
- Ajouter RBAC serveur: `free`, `premium`, `admin`.
- Verifier l'appartenance de chaque `scan_id`, `listing_id`, `conversation_id`.
- Ajouter rate limiting par IP, user id et device id.
- Ajouter quotas journaliers serveur: free 5, premium 10.
- Ajouter Alembic pour migrations DB.
- Ajouter Dockerfile et CI.
- Supprimer les secrets par defaut dans `.env.example`.
- Remplacer les chemins locaux images par des URLs signees.
- Supprimer EXIF et metadonnees GPS des images publiques.
- Ajouter S3 compatible: AWS, Scaleway ou DigitalOcean Spaces.
- Journaliser les actions admin dans un audit log.
- Ajouter tests API pour idempotence, quota, ownership et marketplace.

## Mobile

- Secure Store pour refresh token et device id.
- Access token en memoire ou stockage court.
- Ne jamais hardcoder de secret production dans l'app.
- HTTPS obligatoire en production.
- Gestion stricte permissions camera/localisation.
- Pas d'upload galerie dans le scanner.
- Compression image avant upload.
- Retry idempotent via `client_uuid`.
- Play Integrity API pour V2 anti-abus.
- Crash reporting et logs sans donnees personnelles.

## Marketplace

- Regex anti telephone/email cote mobile et serveur.
- OCR anti-contournement en V2.
- Contacts vendeur exposes seulement aux roles premium/admin.
- GPS exact reserve au serveur/admin, region publique uniquement.
- Images certifiees non modifiables apres validation IA.
