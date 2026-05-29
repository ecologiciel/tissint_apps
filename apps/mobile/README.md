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
