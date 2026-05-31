# Tissint Mobile

Application mobile industrielle Expo / React Native pour Tissint.

## Commandes

```bash
npm install
npm run mobile
npm run mobile:android
npm run typecheck:mobile
```

## Modes API

- `EXPO_PUBLIC_TISSINT_API_MODE=mock` utilise les scenarios deterministes A/B/C/D.
- `EXPO_PUBLIC_TISSINT_API_MODE=http` appelle le serveur FastAPI existant.

## Production

Avant publication Android, remplacer `extra.eas.projectId`, configurer les secrets EAS,
activer l'auth serveur, et utiliser une URL API HTTPS.

La build production doit utiliser:

```bash
EXPO_PUBLIC_TISSINT_ENV=production
EXPO_PUBLIC_TISSINT_API_MODE=http
EXPO_PUBLIC_TISSINT_API_BASE_URL=https://api.tissint.ma
```

Le CI mobile execute `npm run typecheck` sur tous les workspaces. Le lint complet reste a normaliser separement car les types generes OpenAPI ne suivent pas encore le format Prettier du repo.
