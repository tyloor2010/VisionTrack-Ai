import nightStreet from "@/assets/night-street.jpg";
import busStation from "@/assets/bus-station.jpg";
import sidewalk from "@/assets/sidewalk.jpg";
import crosswalk from "@/assets/crosswalk.jpg";
import streetCv from "@/assets/street-cv.jpg.asset.json";
import nightCv from "@/assets/night-cv.jpg.asset.json";
import crowdCv from "@/assets/crowd-cv.jpg.asset.json";
import crosswalkCv from "@/assets/crosswalk-cv.jpg.asset.json";
import nycGif from "@/assets/nyc-walk.gif.asset.json";
import trafficGif from "@/assets/traffic-cv.gif.asset.json";
import streetCam from "@/assets/street-cam.mp4.asset.json";
import visionVideo from "@/assets/vision.mp4.asset.json";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import walkGif from "@/assets/street-walk.gif.asset.json";
import type { DetColor } from "@/components/vt/DetectionBox";

export const media = {
  streetCv: streetCv.url,
  nightCv: nightCv.url,
  crowdCv: crowdCv.url,
  crosswalkCv: crosswalkCv.url,
  nycGif: nycGif.url,
  video: visionVideo.url,
  heroVideo: heroVideo.url,
  crosswalk,
  walkGif: walkGif.url,
  trafficGif: trafficGif.url,
  streetCam: streetCam.url,
};

export type Box = { label: string; conf?: number; color: DetColor; x: number; y: number; w: number; h: number };

export type GeoPos = { lat: number; lng: number };

export type Camera = {
  id: string;
  name: { en: string; ar: string };
  img: string;
  boxes: Box[];
  match?: Box;
  pos: GeoPos;
};

export const cameras: Camera[] = [
  { id: "CAM-014", name: { en: "Tahrir Sq. — Crosswalk", ar: "ميدان التحرير — معبر المشاة" }, img: crosswalk,
    boxes: [ { label: "person", conf: 74, color: "yellow", x: 10, y: 27, w: 8, h: 26 }, { label: "person", conf: 62, color: "yellow", x: 33, y: 40, w: 8, h: 25 }, { label: "person", conf: 48, color: "yellow", x: 60, y: 42, w: 8, h: 24 } ],
    match: { label: "MATCH", conf: 87, color: "red", x: 52, y: 30, w: 7, h: 24 }, pos: { lat: 30.0444, lng: 31.2357 } },
  { id: "CAM-022", name: { en: "Ramses St. — Night", ar: "شارع رمسيس — ليلاً" }, img: nightStreet,
    boxes: [ { label: "person", conf: 81, color: "magenta", x: 22, y: 60, w: 9, h: 28 }, { label: "car", conf: 93, color: "green", x: 36, y: 44, w: 16, h: 22 }, { label: "car", conf: 90, color: "green", x: 46, y: 64, w: 28, h: 34 } ],
    pos: { lat: 30.0535, lng: 31.2452 } },
  { id: "CAM-031", name: { en: "Central Bus Station", ar: "محطة الأتوبيس المركزية" }, img: busStation,
    boxes: [ { label: "person", conf: 77, color: "yellow", x: 39, y: 34, w: 7, h: 22 }, { label: "bus", conf: 95, color: "cyan", x: 47, y: 18, w: 30, h: 26 }, { label: "person", conf: 58, color: "yellow", x: 30, y: 30, w: 6, h: 22 } ],
    match: { label: "MATCH", conf: 71, color: "red", x: 45, y: 42, w: 9, h: 37 }, pos: { lat: 30.0728, lng: 31.3230 } },
  { id: "CAM-047", name: { en: "Corniche Sidewalk", ar: "رصيف الكورنيش" }, img: sidewalk,
    boxes: [ { label: "person", conf: 66, color: "magenta", x: 71, y: 18, w: 4, h: 12 }, { label: "light", color: "yellow", x: 14, y: 46, w: 6, h: 9 }, { label: "bench", conf: 84, color: "green", x: 37, y: 50, w: 11, h: 15 } ],
    pos: { lat: 30.0430, lng: 31.2245 } },
  { id: "CAM-053", name: { en: "Downtown Junction", ar: "تقاطع وسط البلد" }, img: crosswalk,
    boxes: [ { label: "person", conf: 91, color: "yellow", x: 70, y: 52, w: 7, h: 26 }, { label: "person", conf: 42, color: "yellow", x: 20, y: 60, w: 8, h: 26 } ],
    pos: { lat: 30.0505, lng: 31.2450 } },
  { id: "CAM-068", name: { en: "Metro Exit B", ar: "مخرج المترو B" }, img: busStation,
    boxes: [ { label: "person", conf: 69, color: "magenta", x: 20, y: 58, w: 13, h: 26 }, { label: "person", conf: 55, color: "yellow", x: 26, y: 26, w: 5, h: 18 } ],
    pos: { lat: 30.0452, lng: 31.2358 } },
];

export type Profile = {
  id: string;
  name: { en: string; ar: string };
  age: number;
  type: "child" | "elderly" | "adult";
  clothing: { en: string; ar: string };
  lastSeen: { en: string; ar: string };
  time: string;
  condition: { en: string; ar: string };
  speedKmh: number;
  lastSeenPos: GeoPos;
};

export const profiles: Profile[] = [
  { id: "P-1", name: { en: "Subject A (child)", ar: "الحالة أ (طفل)" }, age: 7, type: "child", clothing: { en: "Red hoodie, blue jeans", ar: "هودي أحمر، جينز أزرق" }, lastSeen: { en: "Tahrir Square", ar: "ميدان التحرير" }, time: "14:20", condition: { en: "Autism — may avoid crowds", ar: "توحّد — قد يتجنب الزحام" }, speedKmh: 2.5, lastSeenPos: { lat: 30.0444, lng: 31.2357 } },
  { id: "P-2", name: { en: "Subject B (elderly)", ar: "الحالة ب (مسن)" }, age: 74, type: "elderly", clothing: { en: "Grey coat, white cap", ar: "معطف رمادي، طاقية بيضاء" }, lastSeen: { en: "Ramses Street", ar: "شارع رمسيس" }, time: "09:05", condition: { en: "Alzheimer's — walks in straight lines", ar: "ألزهايمر — يسير في خطوط مستقيمة" }, speedKmh: 2, lastSeenPos: { lat: 30.0535, lng: 31.2452 } },
  { id: "P-3", name: { en: "Subject C (adult)", ar: "الحالة ج (بالغ)" }, age: 31, type: "adult", clothing: { en: "Black jacket, backpack", ar: "جاكيت أسود، حقيبة ظهر" }, lastSeen: { en: "Central Bus Station", ar: "محطة الأتوبيس المركزية" }, time: "21:40", condition: { en: "None reported", ar: "لا يوجد" }, speedKmh: 4.5, lastSeenPos: { lat: 30.0728, lng: 31.3230 } },
];

export const cases = [
  { id: "VT-2041", name: { en: "Subject A", ar: "الحالة أ" }, age: 7, status: "active", elapsed: "02:14", matches: 3, top: 87 },
  { id: "VT-2038", name: { en: "Subject B", ar: "الحالة ب" }, age: 74, status: "review", elapsed: "05:42", matches: 5, top: 71 },
  { id: "VT-2035", name: { en: "Subject C", ar: "الحالة ج" }, age: 31, status: "active", elapsed: "11:03", matches: 1, top: 54 },
  { id: "VT-2029", name: { en: "Subject D", ar: "الحالة د" }, age: 12, status: "resolved", elapsed: "03:30", matches: 4, top: 92 },
  { id: "VT-2027", name: { en: "Subject E", ar: "الحالة هـ" }, age: 68, status: "resolved", elapsed: "08:15", matches: 2, top: 89 },
] as const;

export const alerts = [
  { cam: "CAM-014", case: "VT-2041", conf: 87, time: "14:52:08" },
  { cam: "CAM-031", case: "VT-2038", conf: 71, time: "14:49:31" },
  { cam: "CAM-053", case: "VT-2041", conf: 64, time: "14:41:12" },
  { cam: "CAM-022", case: "VT-2035", conf: 54, time: "14:30:47" },
  { cam: "CAM-068", case: "VT-2038", conf: 46, time: "14:22:03" },
];
