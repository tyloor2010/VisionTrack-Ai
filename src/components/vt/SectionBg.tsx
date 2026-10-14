/**
 * Faint photographic backdrop behind a section: the image sits at low
 * opacity under a dark gradient so headlines stay readable.
 */
export function SectionBg({ src, alt, position }: { src: string; alt?: string; position?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={alt ? undefined : true}>
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover opacity-[0.16] ${position ?? ""}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/85" />
    </div>
  );
}
