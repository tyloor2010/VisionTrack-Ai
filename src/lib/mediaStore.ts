import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Box, GeoPos } from "@/data/mock";
import type { DetFilter } from "@/lib/media";
import { DEFAULT_FILTER } from "@/lib/media";

/** Persisted state for the media lab: annotations, privacy mode, managed cameras, detection filters. */

export type Annotation = Box & { id: string; verdict?: "correct" | "incorrect" };
export type ManagedCam = {
  id: string;
  name: { en: string; ar: string };
  zone: string;
  pos: GeoPos;
  disabled?: boolean;
  custom?: boolean;
};

type MediaState = {
  /** annotations keyed by image/camera id */
  annotations: Record<string, Annotation[]>;
  privacyOn: boolean;
  privacyExempt: string | null; // box key allowed to stay clear
  customCams: ManagedCam[];
  disabledCams: string[];
  filters: DetFilter;
  addAnnotation: (img: string, a: Annotation) => void;
  setVerdict: (img: string, id: string, v: "correct" | "incorrect") => void;
  removeAnnotation: (img: string, id: string) => void;
  setPrivacy: (on: boolean) => void;
  setPrivacyExempt: (key: string | null) => void;
  addCamera: (c: ManagedCam) => void;
  toggleCamera: (id: string) => void;
  setFilters: (f: Partial<DetFilter>) => void;
  resetMedia: () => void;
};

const fresh = () => ({
  annotations: {} as Record<string, Annotation[]>,
  privacyOn: false,
  privacyExempt: null as string | null,
  customCams: [] as ManagedCam[],
  disabledCams: [] as string[],
  filters: { ...DEFAULT_FILTER },
});

export const useMedia = create<MediaState>()(
  persist(
    (set) => ({
      ...fresh(),
      addAnnotation: (img, a) =>
        set((s) => ({ annotations: { ...s.annotations, [img]: [...(s.annotations[img] ?? []), a] } })),
      setVerdict: (img, id, v) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [img]: (s.annotations[img] ?? []).map((a) => (a.id === id ? { ...a, verdict: v } : a)),
          },
        })),
      removeAnnotation: (img, id) =>
        set((s) => ({
          annotations: { ...s.annotations, [img]: (s.annotations[img] ?? []).filter((a) => a.id !== id) },
        })),
      setPrivacy: (on) => set({ privacyOn: on, privacyExempt: on ? null : null }),
      setPrivacyExempt: (key) => set({ privacyExempt: key }),
      addCamera: (c) => set((s) => ({ customCams: [...s.customCams, c] })),
      toggleCamera: (id) =>
        set((s) => ({
          disabledCams: s.disabledCams.includes(id) ? s.disabledCams.filter((x) => x !== id) : [...s.disabledCams, id],
        })),
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetMedia: () => set(fresh()),
    }),
    { name: "vt-media-v1" },
  ),
);
