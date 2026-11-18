import { useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/** In-site image viewer: opens a large version of an image above the page instead of a new tab. */
export function Lightbox({ src, alt, onClose }: { src: string | null; alt?: string; onClose: () => void }) {
  const { t } = useLang();

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || t("Enlarged image", "صورة مكبّرة")}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("Close", "إغلاق")}
        className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:bg-accent"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt || ""}
        className="max-h-full max-w-full rounded-sm border border-border object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
