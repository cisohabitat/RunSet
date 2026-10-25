# Online multiplayer: backend work pending workspace access

Status: not implemented or enabled. Local play, matches, timers, and offline
practice work independently. No placeholder Online Play control is shown.

## Current blocker

The connected Vercel account cannot access the `cfusion2k-7277s-projects`
workspace: integration inspection returns HTTP 403, “Not authorized”. The
public game URL is reachable, but that does not grant project or database access.
The CLI also has no authenticated session. Its catalog command entered a login
flow rather than returning discovery results; that flow was stopped.

Workspace authorization is required before inspecting the actual project,
selecting/provisioning a shared store, or integrating against its real credentials.
Do not add an in-memory server store or pretend that localStorage synchronizes
players across devices.

## Proposed first online release

- Private invitation-only rooms for 2–4 human players, with a lobby and an explicit
  host Start game action. No accounts, matchmaking, chat, or public lobby initially.
- Join codes and copyable invite URLs. Invites identify a room, never a seat's
  private credential. Each participant receives a cryptographically random guest
  session credential that lets that browser reclaim only its own seat.
- Server-authoritative moves using the existing pure rules engine. All participants
  share table edits, turn order, scores, and optional server-controlled deadlines.
- Reconnection and refresh restore the same seat and authoritative revision.
  Network loss disables online actions; it does not create a parallel local game.
- A clear leave/forfeit flow; deleting a local bot game cannot delete an online
  room or another player's progress.

## Architecture to validate after provisioning

Use Vercel Functions for the API and provision a supported persistent store through
Vercel Marketplace. Upstash Redis is a candidate for expiring room/session state,
atomic revision checks, and rate limits; confirm the live integration catalog,
available plan, and existing resources before choosing or installing it.

Keep authoritative room state server-side. The client receives its own rack,
opponent counts, public table, log, timer, and score information only. Never send
opponent racks, the pool order, shuffle seed, credentials belonging to other seats,
or private turn snapshots. Define a separate public view model instead of
serializing the existing full `GameState` to every participant.

Each command must authenticate a seat, verify that it may act, validate the action
shape and ownership, and execute through the engine. A revision and idempotency
key protect against stale or retried commands. Persist by an atomic compare-and-set
so simultaneous requests cannot duplicate tiles or draw twice. Only the server
sets time and applies timeout draws. Expiring rooms must have an explicit retention
policy, shown in the UI, and rate limits for room creation and join attempts.

Start with visibility-aware polling and revision-based updates; evaluate a push
transport against the chosen provider after correctness is established. Local-only
features remain usable when the online backend is unavailable. Cache no `/api/`
responses in the service worker. Credentials stay server-side in Vercel-managed
environment variables, never in `VITE_*` variables or Git.

## Required implementation and verification

1. Authorize the Vercel workspace, inspect the RunSet project and existing stores,
   discover/provision the selected integration, and verify its real connection.
2. Implement and test room creation, join/start, authenticated commands, revision
   conflicts, idempotent retries, expiration, and seat restoration.
3. Add lobby/invite/reconnect/leave UI using the device layouts. Add a public game
   view that cannot reveal hidden state and keeps all moves engine-validated.
4. Exercise actual two-browser/two-device games against the provisioned backend,
   including simultaneous requests, disconnects, expired sessions, and shared
   timeout handling. Inspect API responses for hidden tiles and credentials.
5. Run tile-conservation, legality, score, build, and browser tests; publish this
   phase to `main` only after the real integration works. Update documentation
   with configured behavior and retention limits.

No backend resource has been provisioned, no environment variables have been
added, and no live multiplayer test has been claimed.
