# Tissint Mobile - Checklist Routes Production

Date: 2026-05-30

Cette checklist gele les 45 ecrans MVP comme reference visuelle et sert de base QA avant publication Android.

## Auth et onboarding

- [ ] `/onboarding` affiche le choix de langue MVP et conduit vers login/register.
- [x] `/auth/login` utilise des champs vides en production et ne connecte jamais via raccourci demo.
- [x] `/auth/register` cree un compte via serveur et ne marque pas premium/admin localement.
- [ ] `/forgot-password` appelle le serveur de recuperation quand l'endpoint est disponible.
- [x] `/verify-otp` ne montre aucun code demo et exige un OTP complet.
- [ ] `/reset-password` exige mot de passe + confirmation valides.

## Navigation principale

- [ ] `/dashboard` conserve la parite visuelle MVP et ouvre scan, profil, guide, premium.
- [ ] `/scan` reste fullscreen et hors tab bar.
- [ ] `/collection` ouvre la collection MVP.
- [ ] `/market` est la route marketplace canonique.
- [ ] `/premium` ouvre le paywall MVP.
- [ ] `/profile` ouvre le profil MVP.

## Scan et resultats

- [ ] `/scan` demande la camera si necessaire et interdit l'upload galerie.
- [ ] `/scan/result` affiche l'etat vide si aucun resultat local n'existe.
- [ ] `/scan/result/[scanId]`, `/scan/success/[scanId]`, `/scan/failed/[scanId]` gardent les fallbacks MVP.
- [ ] `/certificate/[scanId]` affiche le certificat reel ou l'etat introuvable MVP.

## Collection et marketplace

- [ ] `/collection/[scanId]` affiche detail, coupe, vente, certificat selon statut.
- [ ] `/compare` compare deux echantillons.
- [ ] `/market/[listingId]` masque les contacts pour free et affiche selon serveur pour premium/admin.
- [ ] `/market/my-listings` liste les annonces du vendeur.
- [ ] `/market/publish/[scanId]` bloque les contacts dans description et respecte l'eligibilite.
- [ ] Les anciennes routes `/marketplace/*` restent seulement des alias temporaires.

## Compte, paiement et support

- [x] `/checkout`, `/checkout/success`, `/checkout/failed` ne changent jamais le role sans confirmation serveur.
- [ ] `/billing` affiche abonnement, moyens de paiement et factures serveur.
- [ ] `/wallet` affiche solde et transactions serveur.
- [ ] `/notifications`, `/messages`, `/messages/[threadId]` utilisent les donnees serveur ou un etat vide coherent.
- [ ] `/settings`, `/offline`, `/help`, `/legal/*` gardent la parite MVP.

## Admin

- [x] `/admin` ne donne jamais le role admin localement.
- [x] `/admin/radar` est accessible uniquement si `user.role === "admin"` dans la session serveur.
- [ ] Les actions admin passent toutes par API serveur et generent un audit log cote serveur.
