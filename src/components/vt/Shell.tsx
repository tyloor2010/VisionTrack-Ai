import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./HudText";
import { btnClass } from "./ui";
import { useLang } from "@/lib/i18n";
import { RoleSwitch, NoteBell } from "./OpsBar";

export function Navbar() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("Overview", "نظرة عامة") },
    { to: "/demo", label: t("Live Demo", "عرض حي") },
    { to: "/devices", label: t("Our Devices", "أجهزتنا") },
    { to: "/dashboard", label: t("Command", "مركز القيادة") },
    { to: "/report", label: t("Report", "إبلاغ") },
    { to: "/registry", label: t("Registry", "السجل الآمن") },
    { to: "/security", label: t("Security", "الأمان") },
  ] as const;
  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-6 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="VisionTrack AI home">
          <Logo />
          <span className="hidden text-lg font-bold tracking-tight min-[400px]:inline">VisionTrack<span className="text-primary"> AI</span></span>
          <span dir="ltr" className="rounded-sm border border-primary/50 px-1 font-mono text-[10px] uppercase leading-4 text-primary">v2</span>
        </Link>
        <nav className="ms-auto hidden items-center gap-1 xl:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to !== "/dashboard" }} className="whitespace-nowrap px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex min-w-0 items-center gap-2 sm:gap-3 xl:ms-0">
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-success lg:flex">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-success animate-ping-soft" /><span className="relative h-2 w-2 rounded-full bg-success" /></span>
            {t("System Online", "النظام متصل")}
          </div>
          <div className="hidden sm:block"><RoleSwitch /></div>
          <NoteBell />
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className={btnClass("outline", "sm")} aria-label="Toggle language">
            {lang === "en" ? "عربي" : "EN"}
          </button>
          <button className="grid h-11 w-11 shrink-0 place-items-center xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm xl:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              initial={{ x: lang === "ar" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className={`fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col border-border bg-background shadow-2xl xl:hidden ${lang === "ar" ? "left-0 border-e" : "right-0 border-s"}`}
              aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("Menu", "القائمة")}</span>
                <button className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground" activeProps={{ className: "border-s-2 border-primary bg-primary/5 text-primary" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-border p-5 sm:hidden"><RoleSwitch /></div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2"><Logo /><span className="font-bold">VisionTrack AI</span><span dir="ltr" className="rounded-sm border border-primary/50 px-1 font-mono text-[10px] uppercase leading-4 text-primary">v2</span></div>
          <p className="mt-3 text-sm text-muted-foreground">{t("Computer vision for the Golden Hours.", "رؤية حاسوبية في خدمة الساعات الأولى الحاسمة.")}</p>
        </div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground space-y-2">
          <Link to="/demo" className="block hover:text-primary">{t("Live Demo", "عرض حي")}</Link>
          <Link to="/devices" className="block hover:text-primary">{t("Our Devices", "أجهزتنا")}</Link>
          <Link to="/dashboard" className="block hover:text-primary">{t("Command Dashboard", "لوحة القيادة")}</Link>
          <Link to="/report" className="block hover:text-primary">{t("Report", "إبلاغ")}</Link>
          <Link to="/registry" className="block hover:text-primary">{t("Safe registry", "السجل الآمن")}</Link>
          <Link to="/security" className="block hover:text-primary">{t("Security", "الأمان")}</Link>
        </div>
        <div className="text-sm">
          <p className="border-s-2 border-warning ps-3 text-muted-foreground">
            {t("VisionTrack AI assists authorities; it never replaces human judgment.", "VisionTrack AI أداة مساندة للجهات المختصة، ولا تحلّ محل التقدير البشري بأي حال.")}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-primary">{t("Built for ISEF", "طُوِّر لمسابقة آيسف")} · 2026</p>
        </div>
      </div>
    </footer>
  );
}

export function Intro() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("vt-intro")) { setShow(false); return; }
    const id = setTimeout(() => { setShow(false); sessionStorage.setItem("vt-intro", "1"); }, 1900);
    return () => clearTimeout(id);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-background hud-grid" exit={{ opacity: 0 }} transition={{ duration: 0.5 }} aria-live="polite">
          <div className="relative flex h-56 w-56 items-center justify-center">
            {[
              "top-0 start-0 border-t-2 border-s-2",
              "top-0 end-0 border-t-2 border-e-2",
              "bottom-0 start-0 border-b-2 border-s-2",
              "bottom-0 end-0 border-b-2 border-e-2",
            ].map((c, i) => (
              <motion.span key={i} className={`absolute h-10 w-10 border-primary ${c}`} initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} />
            ))}
            <Logo className="h-14 w-14" />
          </div>
          <p dir="ltr" className="absolute bottom-[30%] font-pixel text-2xl tracking-widest text-primary text-glow">
            INITIALIZING VISIONTRACK<span className="animate-blink">…</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
