# Changelog

All notable changes to this project will be documented in this file.

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
