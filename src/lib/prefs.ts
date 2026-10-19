import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Personal display & accessibility preferences. Persisted per browser, never part of demo case data. */

export type Density = "compact" | "comfortable";
export type TextSize = 0 | 1 | 2 | 3; // 4 steps
export type Palette = "standard" | "deuteranopia" | "protanopia" | "tritanopia";
export type LabelStyle = "full" | "confidence" | "hidden";
export type Units = "km" | "mi";
export type HourFormat = "24" | "12";
export type DateFormat = "dmy" | "mdy" | "iso";

export type Prefs = {
  density: Density;
  textSize: TextSize;
  scanlines: number; // 0..100 intensity
  boxThickness: number; // 1..4 px
  labelStyle: LabelStyle;
  palette: Palette;
  highContrast: boolean;
  reduceMotion: boolean;
  srAnnounce: boolean;
  units: Units;
  hourFormat: HourFormat;
  dateFormat: DateFormat;
  arabicDigits: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  density: "comfortable",
  textSize: 1,
  scanlines: 40,
  boxThickness: 2,
  labelStyle: "full",
  palette: "standard",
  highContrast: false,
  reduceMotion: false,
  srAnnounce: true,
  units: "km",
  hourFormat: "24",
  dateFormat: "dmy",
  arabicDigits: false,
};

type PrefsActions = {
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  resetPrefs: () => void;
};

export const usePrefs = create<Prefs & PrefsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setPref: (key, value) => set({ [key]: value }),
      resetPrefs: () => set({ ...DEFAULT_PREFS }),
    }),
    { name: "vt-prefs-v1" },
  ),
);

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Locale-aware number formatting; Arabic-Indic digits when enabled. */
export function fmtNum(n: number, arabicDigits: boolean): string {
  const s = String(n);
  if (!arabicDigits) return s;
  return s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]!);
}

/** Distance in the user's preferred unit. Input is kilometres. */
export function fmtDist(km: number, units: Units): string {
  if (units === "mi") return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

export function fmtTime(at: number, hourFormat: HourFormat): string {
  return new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: hourFormat === "12" });
}

export function fmtDate(at: number, dateFormat: DateFormat): string {
  const d = new Date(at);
  const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0"), yy = d.getFullYear();
  if (dateFormat === "mdy") return `${mm}/${dd}/${yy}`;
  if (dateFormat === "iso") return `${yy}-${mm}-${dd}`;
  return `${dd}/${mm}/${yy}`;
}
