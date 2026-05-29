# Audit Ecrans Mobile

Date: 2026-05-29

Objectif: verifier si l'app Expo reproduit fidelement les ecrans et options du prototype web existant avant d'attaquer le backend.

## Verdict Court

Mise a jour tranche parite UI/UX du 2026-05-29:

La couverture route/ecran du prototype de depart est maintenant tres largement portee dans l'app Expo.

Les ecrans manquants critiques ont ete ajoutes: onboarding, OTP, forgot/reset password, camera-permissions, first-scan, certificate, compare, my-listings, seller profile, price-history, checkout, checkout success/failed, billing, wallet, notifications, search, profile, settings, stats, help, offline, legal, messages et admin dashboard.

Il reste a faire une passe visuelle/emulateur pour confirmer la fidelite pixel/UX exacte sur Android reel, mais la couverture fonctionnelle et navigationnelle est maintenant proche du prototype de depart.

## Couverture Actuelle Expo

Ecrans presents:

- Auth login
- Auth register
- Dashboard
- Scanner camera
- Resultat scan
- Collection
- Detail collection
- Marketplace
- Detail annonce
- Publication annonce
- Premium
- Favoris Premium
- Alertes Premium
- Admin radar

Verification technique:

- TypeScript OK.
- Expo dependencies OK.
- Export web Expo OK.
- Metro OK sur `http://localhost:8083`.

Verification tranche parite:

- TypeScript OK apres ajout des ecrans.
- `expo install --check --npm` OK.
- Export web Expo OK dans `.expo-export-parity-final`.
- `expo` aligne sur `~56.0.7`.
- `expo-router` aligne sur `~56.2.8`.

## Ecrans Ajoutes Dans La Tranche Parite

- `/onboarding`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`
- `/camera-permissions`
- `/first-scan`
- `/certificate/[scanId]`
- `/compare`
- `/marketplace/my-listings`
- `/seller/[name]`
- `/price-history`
- `/checkout`
- `/checkout/success`
- `/checkout/failed`
- `/billing`
- `/wallet`
- `/notifications`
- `/search`
- `/profile`
- `/settings`
- `/stats`
- `/help`
- `/offline`
- `/legal/about`
- `/legal/terms`
- `/legal/privacy`
- `/legal/cookies`
- `/messages`
- `/messages/[threadId]`
- `/admin`

## Ecrans Completes / Renforces

- Dashboard: profil, recherche, favoris, notifications, guide premier scan, metriques collection/marketplace.
- Marketplace: recherche, region chips, filtres MVP, score min, prix, poids, rare only, negociable, tri, liens prix et mes annonces.
- Collection: compare, export, collection mock complete.
- Detail collection: ajout coupe UI fonctionnel, certificat, export, publication.
- Resultat scan: certificat ajoute.
- Premium: plans mensuel/annuel, checkout simule, CMI/Stripe/PayPal prepares.
- Scanner: panneau qualite UI et position GPS simulee.

## Mapping Prototype Web -> App Expo

| Prototype web | Statut Expo | Notes |
| --- | --- | --- |
| `/dashboard` | Present renforce | Profil, recherche, favoris, notifications, guide premier scan, metriques et liens rapides ajoutes. |
| `/onboarding` | Present | Parcours langue, region, features, nom et creation de compte ajoute. |
| `/login` | Present renforce | Forgot password, affichage mot de passe, Google mock et style RTL ajoutes. |
| `/register` | Present renforce | Compte + role, region, acceptation conditions, Google mock et OTP ajoute. |
| `/verify-otp` | Present | OTP 6 chiffres porte. |
| `/forgot-password` | Present | Recuperation portee. |
| `/reset-password` | Present | Reset porte avec indicateur de force. |
| `/camera-permissions` | Present | Ecran dedie porte. |
| `/scan` | Present partiel fort | Camera, 3 photos, coupe, poids, region, magnetisme, qualite UI et GPS simule. Reste preview photo riche/macro avance. |
| `/scan/success/$scanId` | Fusionne | Fusionne dans ResultScreen. |
| `/scan/failed/$scanId` | Fusionne | Fusionne dans ResultScreen. |
| `/scan/result/$scanId` | Present renforce | Score, classe, actions et certificat. |
| `/certificate/$scanId` | Present | Certificat porte. |
| `/collection/` | Present renforce | Liste complete, export UI et comparaison. |
| `/collection/$id` | Present renforce | Detail, vendre, coupe UI fonctionnelle, certificat, export. |
| `/compare` | Present | Comparaison portee. |
| `/market/` | Present renforce | Recherche, filtres MVP, tri, region chips, prix et mes annonces. |
| `/market/$listingId` | Present renforce | Detail annonce + Premium lock + contact + profil vendeur. |
| `/market/publish/$scanId` | Present partiel | Publication + anti-contact leak. Reste edition prix/statut complete apres publication. |
| `/market/my-listings` | Present | Gestion annonces vendeur portee. |
| `/seller/$name` | Present | Profil vendeur porte. |
| `/price-history` | Present | Historique prix porte. |
| `/favorites` | Present | Favoris Premium presents en version locale/mock. |
| `/premium` | Present renforce | Plans, checkout simule et paiement prepare. |
| `/checkout` | Present | Paiement simule porte. |
| `/checkout/success` | Present | Succes paiement porte. |
| `/checkout/failed` | Present | Echec paiement porte. |
| `/billing` | Present | Facturation portee. |
| `/wallet` | Present | Wallet porte. |
| `/messages` | Present | Messagerie prototype portee, meme si non prioritaire MVP. |
| `/messages/$threadId` | Present | Detail conversation porte. |
| `/notifications` | Present | Notifications portees. |
| `/search` | Present | Recherche globale portee. |
| `/profile` | Present | Profil utilisateur complet porte. |
| `/settings` | Present | Reglages portes. |
| `/stats` | Present | Statistiques portees. |
| `/admin` | Present | Dashboard admin porte, radar rare conserve. |
| `/help` | Present | Aide portee. |
| `/first-scan` | Present | Guide premier scan porte. |
| `/offline` | Present | Mode offline/file d'attente porte en UI. |
| `/legal/*` | Present | Pages legales portees. |

## Boutons / Options Cles Deja Presents

- Login: telephone/email, mot de passe, creer compte.
- Register: prenom, nom, telephone, email, region, mot de passe, role free/premium, conditions, OTP.
- Dashboard: scan, profil, recherche, favoris, notifications, guide premier scan, admin, test role, deconnexion.
- Scanner: permission camera, capture, choix angle, retake, coupe optionnelle, poids, region, magnetisme, qualite UI, GPS simule, scenario mock, analyser.
- Resultat: ajout collection, vendre, certificat, nouveau scan, notice scientifique.
- Collection: detail, ajouter coupe visuel fonctionnel, vendre si eligible, certificat, comparaison, export UI.
- Marketplace: recherche, filtres MVP, tri, prix, mes annonces, favoris, alertes, detail annonce, verrou contact, appel/WhatsApp si autorise.
- Publication: titre, poids, region, mode prix, prix, description, anti-contact leak, soumettre.
- Premium: upgrade/simulation, plans, checkout, billing, wallet, liste benefices.
- Admin: dashboard, radar, reserver, contacter, rejeter en boutons UI.

## Ecarts Importants Avant Validation UI Finale

1. Validation visuelle Android reelle.
   Les routes et options sont portees, mais il faut encore une passe emulator/device pour confirmer les espacements, le RTL et les textes sur petits ecrans.

2. Scanner terrain avance.
   Qualite UI et GPS simule sont presents. Restent preview photo riche, macro libre avancee, detection reelle flou/luminosite/stabilite.

3. Actions serveur.
   Beaucoup d'actions sont fonctionnelles en UI/mock. Il faudra les brancher au serveur: edition prix, archivage annonce, statut vendu, admin reserve/publish/reject, ajout coupe reel.

4. Export reel.
   Les boutons export/certificat PDF sont presents en UI. Il reste generation fichier/PDF production.

5. Audit securite final.
   Avant production: revue stockage session, logs, permissions camera/location, anti-contact leak cote serveur et payment webhooks.

## Decision Recommandee

Avant d'attaquer le backend, faire une derniere passe visuelle sur appareil Android:

1. Tester navigation complete route par route.
2. Corriger les debordements de texte RTL.
3. Confirmer scanner sur appareil reel.
4. Valider les parcours checkout/mock, marketplace, collection et admin.

Le backend peut ensuite etre ameliore en sachant exactement quels endpoints l'app consomme.
