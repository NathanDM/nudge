# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-09-13

### Added
- « Ils t'ont ajouté » : quand quelqu'un t'ajoute dans sa famille sans que tu l'aies, une section en tête de la page Famille te le propose, avec « Ajouter » (ou « Passer en famille » si tu l'avais en amis) et « Ignorer »
- Badge sur l'onglet Famille avec le nombre de personnes en attente
- Un refus est mémorisé côté serveur : la personne ne réapparaît sur aucun de tes appareils ; retirer ou rétrograder un contact vaut refus
- Nouveaux endpoints `GET /api/users/family/suggestions`, `POST …/:contactId/accept`, `POST …/:contactId/dismiss` (403 si la personne ne t'a pas en famille, 400 si l'id n'est pas un uuid)

### Changed
- Le port du backend se configure avec `PORT` (3000 par défaut)
- Les jeux de données de démo lient les membres d'une même famille par des contacts réciproques

### Fixed
- Accepter un lien d'invitation ne rétrograde plus un contact déjà en « famille » vers « amis »
- Se déconnecter vide le cache de l'app : un second compte sur le même téléphone ne voit plus les données du premier
- Un contact ajouté avec son propre numéro ne peut plus s'apparaître à lui-même en suggestion

### Removed
- Tables `families` et `user_families`, jamais utilisées par l'app, et le code mort associé (`findAll`, `findContacts`, `useUsersCollection`)

## [0.1.0.0] - 2026-04-14

### Added
- Separate Famille and Amis tabs in the bottom navigation — family contacts and friends are now two distinct views
- FamillePage showing your own children plus family-type contacts (and their children)
- AmisPage showing friend-type contacts with an add-by-phone drawer
- ProfilePage now lists your managed children with add and delete actions
- Children (managed accounts) support: parents can create named child accounts without a phone or PIN
- Invitation link system: generate a 7-day join link, share it, and the recipient is added as a mutual contact on accept
- JoinPage for accepting invitations — works both when already logged in and when not yet registered
- Auth guard blocks managed (child) accounts from logging in directly

### Changed
- Navigation split from a single home view into Famille / Amis / Ma liste / Profil tabs
- Family view propagates children of family contacts automatically (read-time UNION query)
- HTTP exception mapping moved from the repository layer to the service layer

### Fixed
- Own children now appear in the Famille view
- Current user no longer appears in their own Amis list
- Second child creation no longer fails with a duplicate-phone error (partial unique index on phone)
- Invitation tokens are single-use — consumed on accept to prevent replay
- Invitation token entropy increased from 48 bits to 256 bits

### Security
- Invitation tokens: 6-byte → 32-byte random (`randomBytes(32)`)
- Tokens deleted after first use
- Child accounts blocked from JWT login
- Missing DB indexes added: `managed_by`, `(user_id, contact_type)`
