# Architecture Tissint Production

Ce depot contient maintenant deux couches:

- le prototype web existant a la racine, conserve comme reference UX;
- le nouveau socle industriel mobile dans `apps/mobile` et `packages/*`.

## Structure cible

```txt
apps/mobile/          Expo React Native Android
packages/shared/      types, statuts, quotas, verdicts, regles anti-fraude
packages/api-client/  client API compatible serveur FastAPI
docs/                 decisions techniques et checklist production
```

Le serveur reel reste dans `ecologiciel/Tissint_serveur`. Il doit etre durci et expose via OpenAPI.

## Principe de dependances

L'app mobile ne doit pas connaitre les details internes du backend. Elle parle au client
`@tissint/api-client`, qui normalise les reponses existantes du serveur.

Les decisions metier partagees vivent dans `@tissint/shared`:

- seuils de verdict;
- statuts marketplace;
- quotas par role;
- regles de masquage contact;
- detection de fuite telephone/email dans les descriptions.

## Modes API

`EXPO_PUBLIC_TISSINT_API_MODE=mock`

- scenarios deterministes A/B/C/D;
- developpement UI sans serveur;
- aucun appel reseau.

`EXPO_PUBLIC_TISSINT_API_MODE=http`

- appels au serveur FastAPI;
- upload multipart des photos;
- header `X-API-Key`;
- pret pour JWT quand le serveur sera durci.

## Parcours prioritaire

1. Dashboard.
2. Scanner camera obligatoire.
3. Resultat IA.
4. Collection.
5. Marketplace.
6. Premium.
7. Admin rare radar.

Les modules doivent rester independants pour pouvoir tester, remplacer ou durcir chaque domaine.

## Tranche 2 implementee

La deuxieme tranche ajoute le socle applicatif necessaire avant le branchement serveur complet:

- session utilisateur nullable et persistante via Secure Store;
- tokens access/refresh stockes dans une enveloppe `AuthSession`;
- injection du bearer token dans le client API;
- routes `/auth/login` et `/auth/register`;
- hydratation de session au demarrage;
- contrats `LoginInput`, `RegisterInput`, `AuthSession`, `CreateListingInput`;
- client API pour auth, quota, collection et creation d'annonce;
- fallback mock deterministe lorsque `EXPO_PUBLIC_TISSINT_API_MODE=mock`;
- ecran de publication marketplace avec anti-fuite telephone/email;
- dashboard et modules existants compatibles avec session authentifiee.

Le serveur existant ne fournit pas encore tous ces endpoints. Le client mobile est donc pret pour
les endpoints production, tout en restant testable en mode mock.

## Tranche 3 implementee

La troisieme tranche ajoute les workflows acheteur/collection qui manquaient au socle:

- detail d'annonce marketplace avec verrou Premium et hold institutionnel 24h;
- actions contact telephone et WhatsApp quand le role le permet;
- favoris Premium avec navigation depuis dashboard et marketplace;
- alertes Premium par classe, region, score et rarete;
- detail collection avec actions coupe et publication;
- contrats partages pour `FavoriteListing`, `AlertRule`, `MarketplaceListingDetail`;
- client API prepare pour `/marketplace/favorites`, `/marketplace/alerts`, detail annonce et detail collection;
- mode mock local pour continuer les tests sans backend durci.

Ces ecrans sont volontairement connectes aux memes services que le mode HTTP, afin que le basculement
vers le serveur production soit limite a l'implementation des endpoints manquants.
