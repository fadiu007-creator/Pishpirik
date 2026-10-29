# Pishpirik 🃏

A responsive Albanian-language Pishpirik card-game MVP. Static frontend, designed for GitHub Pages.

## What's included
- Playable two-player, pass-and-play game on one device.
- Shuffled 52-card deck, four-card hands, face-up table, capture turns and a Pishpirik bonus (+10 when capturing a single table card of the same rank).
- Jack captures the table and scores 1 point.
- Scoreboard, responsive mobile layout, keyboard-accessible cards, restart and end-of-game summary.
- Online lobby UI with room-code creation/joining and Supabase Realtime presence/broadcast connection scaffold.

## Run locally
Open `index.html` in a browser, or serve this folder with any static HTTP server.

## Publish with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
3. Wait for the Pages deployment workflow and open the URL shown by GitHub.

## Enable online rooms
The online lobby currently connects to a Supabase Realtime channel for room presence and notifications; it does **not yet synchronize the card-game state**, so it should not be advertised as fully playable online multiplayer yet.

1. Create/use a Supabase project.
2. Set `supabaseUrl` and the public anon/publishable key in `config.js`.
3. Enable Realtime for your project and ensure the project's Realtime access policies suit your intended room privacy.
4. Never put a service-role key in browser code.

## Rules note
Pishpirik has regional variants. This MVP uses rank-matching captures, J captures the table, +10 for a Pishpirik, and a simple point for a captured J. Confirm desired local scoring rules before a competitive release.

## Current status
**Playable local MVP. Online multiplayer is a scaffold, not finished.** No accounts, anti-cheat, server-authoritative game state, automated tests, or production security guarantees yet.
