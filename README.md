# VisionTrack AI

AI-assisted missing-person search and rescue coordination platform — second generation (v2), built for ISEF 2026.

**Live app**: https://visiontrackai.site

## What it does

VisionTrack AI helps coordinate the search for missing persons: a report comes in, AI-assisted camera search scans a live satellite map of Cairo, drones extend the search from above, and a command center keeps every lead, alert and unit in sync — with human review at every step and privacy controls built in.

## Hardware

- **Vision Box** — a wall-mounted smart vision unit (ESP32-CAM) that watches a street corner around the clock.
- **VTX-1** — a team-built micro drone prototype that carries a miniaturised Vision Box for aerial search.
- **Nano Tracker** — a coin-sized GPS + Bluetooth tag design concept that stays with the person.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
