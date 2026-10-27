<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Maps use Leaflet with Esri World Imagery satellite tiles (+ World_Transportation overlay), loaded via dynamic import inside useEffect in `src/components/vt/SearchMap.tsx` (Leaflet is browser-only; SSR must not import it). Why: real map imagery replaced the abstract SVG map; CARTO tiles now require an API key.
- Camera locations and last-seen points are real Cairo coordinates in `src/data/mock.ts` (`pos` / `lastSeenPos`); map radii are in km.
- All demo state (cases, alerts, units, tasks, audit, notifications, role) lives in one persisted Zustand store in `src/lib/store.ts`; every action goes through store actions and `emit()` so dashboard, board, bell and audit stay in sync. Why: features must be interconnected, not isolated mockups.
- Store starts from a fixed seed epoch (SSR-safe) and re-seeds to the real clock after hydration in `StoreSync`. Why: Date.now() during SSR caused hydration mismatches.

- Analytics evaluation uses seeded Alert.truth only in clearly labeled demo quality reports; human-review feedback, evaluation settings and mock schedules live in the shared store. Why: evaluation must not be presented as validated identity accuracy or silently alter operational rules.
- The public drone showcase preserves the uploaded prototype photo and separates it from explicitly labeled aerial footage and patrol simulations. Why: presentation must not imply verified live hardware telemetry.
- Administration is a sandbox slice of the shared store; its permission matrix, accounts, sessions, API identifiers and connections do not enforce or change real authentication or operational permissions. Why: the demo has no authenticated service and must not imply client-side checks are security.
- Every shared event also appends to the unbounded administration checksum journal; its checksum is explicitly non-cryptographic, and administration reset preserves the journal. Why: demo audit exploration needs continuity without claiming tamper-proof legal evidence.
- Retention is preview-only and consent withdrawal clears only linked sandbox records, never unrelated operational cases. Why: demonstration privacy tools must not silently delete other pages' data.
- The drone 3D concept uses Three.js and OrbitControls loaded after hydration, with disposal and offscreen rendering pause; its camera is a labeled proposed payload and its geometry is not measured CAD. Why: the showcase must be interactive without implying verified hardware specifications or live flight.
