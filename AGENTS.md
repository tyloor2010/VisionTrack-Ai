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
