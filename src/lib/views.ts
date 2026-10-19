import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedView } from "@/lib/search";

/** Saved filter views, persisted. */
type ViewsState = {
  views: SavedView[];
  saveView: (v: Omit<SavedView, "id" | "pinned">) => void;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  togglePin: (id: string) => void;
};

let seq = 1;
export const useViews = create<ViewsState>()(
  persist(
    (set) => ({
      views: [],
      saveView: (v) => set((s) => ({ views: [...s.views, { ...v, id: `SV-${Date.now()}-${seq++}`, pinned: false }] })),
      renameView: (id, name) => set((s) => ({ views: s.views.map((v) => (v.id === id ? { ...v, name } : v)) })),
      deleteView: (id) => set((s) => ({ views: s.views.filter((v) => v.id !== id) })),
      togglePin: (id) => set((s) => ({ views: s.views.map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v)) })),
    }),
    { name: "vt-views-v1" },
  ),
);
