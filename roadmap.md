# Roadmap

- [x] Build VisionTrack AI site
- [x] Hero background video (user's clip)
- [x] Theme from the user's computer-vision street photos
- [x] Real satellite map for search radius, cameras and the report pin
- [x] Every section background is a live clip (GIF or video), not a still photo
- [x] Hero flips through all the user's photos and clips one after another
- [x] Site icon (browser tab) + proper page titles and descriptions
- [ ] Real content to replace placeholders: pilot numbers, contact email
- [x] Team credits at the end of the homepage (year two in a row: Mohamed Nasser, Youssef Salama, Mohamed Sayyad, Ahmed Yasser, Ahmed Walid)
- [x] Kidnapping response mode (legal gate, telecom, vehicles, fusion)
- [x] Safe registry, security page, case file, planner, command board, public alert, simulation, photo authenticity check

## "Make everything functional" brief (10 stages)
- [x] 1. Shared live data, event log, seeded demo data, roles, reset, notifications (dashboard, case page, command board connected)
- [ ] 2. Real in-browser object detection (upload/webcam), clothing colours, computed matching, threshold chart, photo tamper check
- [ ] 3. Geo engine: radius formula, probability grid, planner with real assignment, checkpoint routes, wandering simulation, hospital check
- [ ] 4. Remaining case workflow polish, live charts, printable after-action report
- [ ] 5. Simulation engine with 3 scenarios and presenter mode, driving the shared data
- [ ] 6. Legal gate with supervisor approval from own view, expiry timer, tamper-proof audit chain, computed telecom/ANPR/fusion
- [ ] 7. Chat channels, public alert polygon + sensitive-word blocker, notification polish
- [ ] 8. Report wizard with case ID/QR, registry edit/delete + map, pattern detection
- [ ] 9. Interactive security page and settings (deployment modes, retention timer)
- [ ] 10. More tests, Demo Guide (?), Judge Mode (Shift+J)

## Modules brief (10 modules, in order)
- [x] 1. Command palette (Ctrl+K), dashboard search, saved views/filter builder, shortcuts cheat sheet, settings & accessibility center
- [x] 2. Case tools: notes/@mentions, priority scoring, SLA timers, duplicate merge, handover, watchlist, flyer generator, share links
- [x] 3. Detection & media tools: video analysis, photo compare, annotation, enhancement, privacy blur, detection filters, camera management
- [x] 4. Map options: layer switcher, drawing/measuring, route replay, coordinates, weather overlay
- [x] 5. Alert rules builder, notification channels, escalation, notification center polish
- [x] 6. Analytics, model quality page, feedback loop, exports, model card
- [x] Make the public homepage drone showcase prominent and interactive using the team's prototype photo
- [x] 7. Admin: users/sessions/MFA display, proposed role matrix + different-role approval, audit search/export/checksum verification, seven integration sandboxes, scoped demo API identifiers/webhooks, retention/legal-hold previews, consent withdrawal and subject requests — demo-only; no real credentials, external requests or operational permission changes; verified EN/AR, phone layouts and end-to-end actions
- [ ] 8. Citizen/family/volunteer portals, offline PWA, French scaffold
- [ ] 9. Help, onboarding tour, training mode, changelog, status, feedback, transparency
- [ ] 10. Tests and polish

## Speed brief (optimize pass)
- [x] Lazy/async images, debounced saving, reduced-motion, hover preloading
- [ ] Offline/app caching (service worker) — needs user OK; never runs in preview
- [ ] Lighthouse mobile numbers — measure on the published site

## Polish brief
- [ ] Look-and-read polish pass (see uploaded brief)
- [x] Responsive: top bar fits 320px+ (no sideways scroll on any page, EN/AR); tablets use menu button
- [x] Polish: sharper 4px corners, flat buttons, aligned numbers, cleaner wording
- [ ] Larger redesign items (bento home layout, full copy rewrite, phone bottom tab bar, drag alternatives) — waiting for user to pick priorities
