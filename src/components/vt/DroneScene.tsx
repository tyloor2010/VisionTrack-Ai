import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

type Props = { selected: string; exploded: boolean; flying: boolean; spinning: boolean; angle: "perspective" | "top" | "front"; reset: number; onSelect: (part: string) => void };
/** Three is loaded after hydration. This is a concept model, not CAD or live hardware. */
export function DroneScene(props: Props) {
  const host = useRef<HTMLDivElement>(null); const latest = useRef(props); latest.current = props;
  const [failed, setFailed] = useState(false); const [ready, setReady] = useState(false); const { t } = useLang();
  useEffect(() => {
    const container = host.current; if (!container) return;
    let disposed = false; let cleanup = () => {};
    void Promise.all([import("three"), import("three/examples/jsm/controls/OrbitControls.js")]).then(([THREE, { OrbitControls }]) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6)); renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-label", "VTX-1 interactive 3D concept");
      const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100); camera.position.set(5, 4.5, 6.5);
      const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 5; controls.maxDistance = 13; controls.maxPolarAngle = Math.PI * 0.78; controls.target.set(0, 0.15, 0);
      const css = getComputedStyle(document.documentElement);
      const color = (token: string) => { const probe = document.createElement("span"); probe.style.color = css.getPropertyValue(token); document.body.appendChild(probe); const value = getComputedStyle(probe).color; probe.remove(); const match = value.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)\)/); if (match) return new THREE.Color().setRGB(Number(match[1]), Number(match[2]), Number(match[3]), THREE.SRGBColorSpace); const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1; const ctx = canvas.getContext("2d"); if (!ctx) return new THREE.Color(); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); const pixel = ctx.getImageData(0, 0, 1, 1).data; return new THREE.Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, THREE.SRGBColorSpace); };
      const primary = color("--primary"), cyan = color("--det-cyan"), green = color("--det-green"), ink = color("--background"), silver = color("--muted-foreground"), bright = color("--foreground");
      const material = (c: InstanceType<typeof THREE.Color>, metallic = 0.5, roughness = 0.4) => new THREE.MeshStandardMaterial({ color: c, metalness: metallic, roughness });
      const carbon = material(ink, 0.65, 0.3), yellow = material(primary), metal = material(silver, 0.9, 0.23), board = material(green, 0.25), dark = material(ink, 0.3), glass = new THREE.MeshPhysicalMaterial({ color: cyan, metalness: 0.7, roughness: 0.1, clearcoat: 1 });
      scene.add(new THREE.HemisphereLight(bright, ink, 3)); const key = new THREE.DirectionalLight(bright, 5); key.position.set(3, 6, 4); scene.add(key); const rim = new THREE.DirectionalLight(cyan, 4); rim.position.set(-4, 2, -3); scene.add(rim); const warm = new THREE.DirectionalLight(primary, 2); warm.position.set(2, -1, -2); scene.add(warm);
      const drone = new THREE.Group(); scene.add(drone); const groups: Record<string, InstanceType<typeof THREE.Group>> = {};
      for (const id of ["frame", "motors", "controller", "link", "battery", "camera"]) { const g = new THREE.Group(); g.userData.part = id; drone.add(g); groups[id] = g; }
      const mesh = (g: InstanceType<typeof THREE.Group>, geo: InstanceType<typeof THREE.BufferGeometry>, mat: InstanceType<typeof THREE.MeshStandardMaterial>, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.part = g.userData.part; g.add(m); return m; };
      const box = (g: InstanceType<typeof THREE.Group>, w: number, h: number, d: number, mat: InstanceType<typeof THREE.MeshStandardMaterial>, x = 0, y = 0, z = 0) => mesh(g, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
      const frame = groups.frame, motors = groups.motors, controller = groups.controller, link = groups.link, battery = groups.battery, payload = groups.camera;
      if (!frame || !motors || !controller || !link || !battery || !payload) return;
      box(frame, 1.45, 0.08, 1.25, carbon, 0, 0.1); box(frame, 1.2, 0.06, 1.05, yellow, 0, 0.42);
      const rotors: InstanceType<typeof THREE.Group>[] = [];
      for (const [x, z] of [[-1.65, -1.65], [1.65, -1.65], [-1.65, 1.65], [1.65, 1.65]]) {
        if (x === undefined || z === undefined) continue;
        const length = Math.hypot(x, z); const arm = box(frame, 0.25, 0.13, length, carbon, x / 2, 0.1, z / 2); arm.rotation.y = Math.atan2(x, z);
        const stripe = box(frame, 0.07, 0.015, length * 0.75, yellow, x / 2, 0.177, z / 2); stripe.rotation.y = arm.rotation.y;
        mesh(motors, new THREE.CylinderGeometry(0.24, 0.21, 0.28, 24), metal, x, 0.28, z); mesh(motors, new THREE.CylinderGeometry(0.26, 0.26, 0.045, 24), yellow, x, 0.4, z);
        const rotor = new THREE.Group(); rotor.position.set(x, 0.48, z); motors.add(rotor); rotors.push(rotor); rotor.userData.part = "motors";
        const prop = box(rotor, 1.55, 0.035, 0.13, x < 0 ? yellow : carbon); prop.rotation.y = x * z > 0 ? 0.4 : -0.4; mesh(rotor, new THREE.CylinderGeometry(0.09, 0.09, 0.09, 16), dark);
        box(frame, 0.08, 0.68, 0.08, metal, x * 0.37, -0.25, z * 0.37);
      }
      for (const x of [-0.64, 0.64]) { box(frame, 0.1, 0.09, 1.95, carbon, x, -0.6, 0); for (const z of [-0.85, 0.85]) mesh(frame, new THREE.SphereGeometry(0.09, 12, 8), yellow, x, -0.6, z); }
      box(controller, 0.63, 0.06, 0.85, board, 0, 0.56, 0); box(controller, 0.2, 0.05, 0.25, dark, 0, 0.62, 0); box(controller, 0.18, 0.1, 0.16, metal, 0, 0.63, 0.36);
      for (let i = 0; i < 10; i++) for (const x of [-0.27, 0.27]) box(controller, 0.035, 0.07, 0.035, metal, x, 0.61, -0.34 + i * 0.07);
      for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) { if (x === undefined || z === undefined) continue; mesh(frame, new THREE.CylinderGeometry(0.035, 0.035, 0.27, 10), metal, x, 0.29, z); }
      box(battery, 0.57, 0.27, 0.96, dark, 0, -0.12, 0.04); box(battery, 0.59, 0.015, 0.3, yellow, 0, 0.02, 0.04);
      box(link, 0.23, 0.04, 0.55, board, 0.44, 0.55, -0.05); mesh(link, new THREE.CylinderGeometry(0.027, 0.027, 0.62, 10), dark, 0.44, 0.9, -0.23); mesh(link, new THREE.SphereGeometry(0.04, 12, 8), cyanMaterial(), 0.44, 0.57, 0.18);
      function cyanMaterial() { return new THREE.MeshStandardMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 1.5 }); }
      box(payload, 0.38, 0.18, 0.18, metal, 0, -0.25, 0.7); mesh(payload, new THREE.SphereGeometry(0.25, 24, 16), carbon, 0, -0.45, 0.85); const lens = mesh(payload, new THREE.CylinderGeometry(0.15, 0.15, 0.12, 24), glass, 0, -0.45, 1.05); lens.rotation.x = Math.PI / 2;
      for (const x of [-0.2, 0.2]) { const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.6, 0.2), new THREE.Vector3(x, 0.8, 0.5), new THREE.Vector3(x, 0.15, 0.68)]); mesh(controller, new THREE.TubeGeometry(curve, 16, 0.015, 6, false), x < 0 ? yellow : metal); }
      const floor = new THREE.GridHelper(16, 32, silver, ink); floor.position.y = -1.28; const floorMaterials = Array.isArray(floor.material) ? floor.material : [floor.material]; floorMaterials.forEach((m) => { m.transparent = true; m.opacity = 0.16; }); scene.add(floor);
      const halo = new THREE.Mesh(new THREE.RingGeometry(2.65, 2.67, 96), new THREE.MeshBasicMaterial({ color: primary, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })); halo.rotation.x = -Math.PI / 2; halo.position.y = -1.25; scene.add(halo);
      const resize = () => { const width = container.clientWidth, height = container.clientHeight; renderer.setSize(width, height); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); };
      const observer = new ResizeObserver(resize); observer.observe(container); resize();
      const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let down = { x: 0, y: 0 };
      const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
      const onUp = (e: PointerEvent) => { if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return; const r = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(drone.children, true)[0]; if (hit?.object.userData.part) latest.current.onSelect(String(hit.object.userData.part)); };
      renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointerup", onUp);
      let frameId = 0, lastAngle = "", lastReset = -1; const reduced = window.matchMedia("(prefers-reduced-motion: reduce)"); const positions: Record<string, number> = { frame: 0, motors: 0.85, controller: 1.4, link: 1.95, battery: -0.7, camera: -1.1 }; const start = performance.now(); let visible = true;
      const intersection = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; }); intersection.observe(container);
      const render = () => { frameId = requestAnimationFrame(render); if (!visible) return; const p = latest.current; const elapsed = (performance.now() - start) / 1000;
        if (lastAngle !== p.angle || lastReset !== p.reset) { lastAngle = p.angle; lastReset = p.reset; if (p.angle === "top") camera.position.set(0.01, 9, 0.01); else if (p.angle === "front") camera.position.set(0, 1.5, 9); else camera.position.set(5, 4.5, 6.5); controls.target.set(0, 0.15, 0); }
        drone.position.y = p.flying && !reduced.matches ? 0.32 + Math.sin(elapsed * 1.7) * 0.07 : 0; drone.rotation.z = p.flying && !reduced.matches ? Math.sin(elapsed) * 0.025 : 0;
        for (const [id, g] of Object.entries(groups)) { const target = p.exploded ? positions[id] ?? 0 : 0; g.position.y += (target - g.position.y) * (reduced.matches ? 1 : 0.09); g.traverse((o) => { if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) { const base = o.userData.baseMaterial as InstanceType<typeof THREE.MeshStandardMaterial> | undefined; if (!base) { o.userData.baseMaterial = o.material; o.material = o.material.clone(); } o.material.emissive.copy(id === p.selected ? primary : ink); o.material.emissiveIntensity = id === p.selected ? 0.18 : 0; } }); }
        if (p.spinning && !reduced.matches) rotors.forEach((r, i) => { r.rotation.y = elapsed * (p.flying ? 34 : 9) * (i % 2 ? 1 : -1); });
        controls.update(); renderer.render(scene, camera);
      }; render(); setReady(true);
      cleanup = () => { cancelAnimationFrame(frameId); observer.disconnect(); intersection.disconnect(); controls.dispose(); renderer.domElement.removeEventListener("pointerdown", onDown); renderer.domElement.removeEventListener("pointerup", onUp); scene.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); const mats = Array.isArray(o.material) ? o.material : [o.material]; mats.forEach((m) => m.dispose()); } }); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; cleanup(); };
  }, []);
  return <div ref={host} className="drone-scene relative w-full" role="img" aria-label={t("Interactive VTX-1 quadcopter concept model", "نموذج تفاعلي تصوّري للطائرة رباعية المراوح VTX-1")}>
    {!ready && <div className="absolute inset-0 grid place-items-center font-mono text-sm text-primary" role="status">{failed ? t("3D unavailable on this device — component explanations remain available below.", "العرض ثلاثي الأبعاد غير متاح على هذا الجهاز؛ شروح المكوّنات متاحة أدناه.") : t("Preparing VTX-1…", "جارٍ إعداد VTX-1…")}</div>}
  </div>;
}