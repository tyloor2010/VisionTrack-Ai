import { useEffect, useRef } from "react";

/**
 * Faint moving backdrop behind a section: a looping muted video, an animated
 * GIF, or a photo sits at low opacity under a dark gradient so headlines stay
 * readable. Videos only play while their section is actually on screen.
 */
export function SectionBg({
  src,
  video,
  poster,
  alt,
  position,
  opacityClass = "opacity-[0.16]",
}: {
  src?: string;
  video?: string;
  poster?: string;
  alt?: string;
  position?: string;
  opacityClass?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={alt ? undefined : true}>
      {video ? (
        <video
          ref={ref}
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className={`absolute inset-0 h-full w-full object-cover ${opacityClass} ${position ?? ""}`}
        />
      ) : (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover ${opacityClass} ${position ?? ""}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/85" />
    </div>
  );
}
