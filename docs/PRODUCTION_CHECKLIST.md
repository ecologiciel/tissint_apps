# Checklist Production

## Mobile

- [ ] `npm install` termine sans conflit workspace.
- [x] `npm run typecheck` vert.
- [x] `npx expo install --check` vert.
- [x] Session Secure Store ajoutee.
- [x] Routes login/register ajoutees.
- [x] Client API auth/quota/collection/listing ajoute.
- [x] Details collection et marketplace ajoutes.
- [x] Favoris et alertes Premium ajoutes en mode mock/http.
- [ ] Ecrans principaux testes en RTL sur Android.
- [ ] Camera testee sur appareil reel.
- [ ] Upload multipart teste contre staging.
- [ ] Permissions Android verifiees.
- [ ] Build EAS `preview` fonctionnel.
- [ ] Build EAS `production` en AAB.
- [ ] Crash reporting configure.
- [ ] Politique confidentialite et CGU ajoutees.

## Backend

- [ ] Dockerfile present.
- [ ] Alembic active.
- [ ] Auth JWT active.
- [ ] Quotas 5/10 cote serveur.
- [ ] OpenAPI stable publie.
- [ ] Stockage S3 configure en staging/prod.
- [ ] Tests API critiques.
- [ ] Monitoring et logs structures.
- [ ] Backups PostgreSQL et images.
- [ ] Secrets hors depot.

## Securite

- [ ] JWT + refresh rotation.
- [ ] RBAC admin/premium/free.
- [ ] Rate limit.
- [ ] Ownership checks.
- [ ] Validation MIME reelle.
- [ ] Suppression EXIF.
- [ ] Anti contact leak description.
- [ ] Audit logs admin.
- [ ] HTTPS uniquement.

## Marketplace

- [ ] Statuts production implementes.
- [ ] Prix total/par gramme/negociable/sur demande.
- [ ] Contact premium verrouille pour free.
- [ ] Rare hold 24h.
- [ ] Signalement annonce.
