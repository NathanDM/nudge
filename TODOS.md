# TODOS

## Backend

### Régénérer les snapshots Drizzle avant tout `db:generate`

**What:** Remettre `migrations/meta/*_snapshot.json` en phase avec le schéma (dernier snapshot : 0005), puis ajouter un check CI `drizzle-kit check`.

**Why:** Tant que les snapshots s'arrêtent à 0005, `npm run db:generate` produit des `CREATE TABLE` / `ALTER TABLE` / `DROP TABLE` sans `IF [NOT] EXISTS` pour tout ce qui a été écrit à la main depuis (0006→0010). Appliqué par `entrypoint.sh` au démarrage du conteneur, ça crash-loop le backend.

**Context:** Les migrations 0006→0010 ont été écrites à la main (voir learnings `drizzle_generate_stale_snapshot`). Les fichiers orphelins `0004_drop_child_name_unique.sql` et `0005_fix_phone_unique_partial.sql` ne sont pas dans le journal (rejoués seulement par `backend/src/test/test-db.ts`) ; la base locale ne les a jamais reçus non plus (`users_managed_by_name_unique` existe encore). À faire après l'audit prod de `drizzle.__drizzle_migrations`. Point de départ : `backend/drizzle.config.ts`, `backend/package.json` (`db:generate`).

**Effort:** M
**Priority:** P1
**Depends on:** Audit prod des migrations (voir PR 0.2.0.0)

### Aligner les anciennes routes contacts sur 204 + ParseUUIDPipe

**What:** `DELETE /api/users/contacts/:contactId` et `PATCH /api/users/contacts/:contactId` renvoient 200 sans valider l'id ; les routes suggestions renvoient 204 avec `ParseUUIDPipe` (400 sinon).

**Why:** Deux conventions cohabitent sous `api/users` ; un id non-uuid sur les anciennes routes finit en 500 Postgres.

**Context:** `backend/src/infrastructure/http/user/user.controller.ts` vs `family-suggestion.controller.ts`. Le frontend consomme les deux ; vérifier `FamillePage`/`AmisPage` (`removeMutation`) ne dépendent pas du 200.

**Effort:** S
**Priority:** P3
**Depends on:** None

### Refus non réciproque : 403 ou 404 ?

**What:** `accept`/`dismiss` renvoient 403 quand la personne ne m'a pas (ou plus) en famille ; les routes contacts utilisent 404 pour un contact absent.

**Why:** Le frontend code en dur `status === 403 → invalidate` (`useFamilySuggestions.ts`). Changer le code plus tard casse silencieusement le client.

**Context:** Décision explicite de l'eng review du 2026-09-13 (1A : refus = « pas autorisé »). À revoir seulement si l'API gagne un second consommateur.

**Effort:** S
**Priority:** P4
**Depends on:** None

### Ajout par numéro = canal de suggestion sans consentement

**What:** N'importe quel compte connaissant les 8 derniers chiffres d'un numéro peut pousser une suggestion (avec un nom choisi) dans la page Famille de la cible, sans limite de débit.

**Why:** Surface pré-existante (`addContactByPhone`), rendue visible par la section « Ils t'ont ajouté ». Aujourd'hui limité par le cercle d'usage (familles), mais sans rate-limit.

**Context:** `backend/src/application/user/user.service.ts` (`addContactByPhone`). Pistes : `ThrottlerGuard` (déjà utilisé sur `public-share.controller.ts`) sur `POST /api/users/contacts`, ou ne suggérer que si l'ajouteur est déjà dans mes contacts (tout type).

**Effort:** S
**Priority:** P3
**Depends on:** None

## Completed
