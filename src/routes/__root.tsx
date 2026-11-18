import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { LangProvider } from "@/lib/i18n";
import { Navbar, Footer } from "@/components/vt/Shell";
import { btnClass } from "@/components/vt/ui";
import { Toaster } from "@/components/ui/sonner";
import { StoreSync } from "@/components/vt/OpsBar";
import { CommandPalette, PrefsSync } from "@/components/vt/CommandPalette";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 hud-grid">
      <div className="relative w-full max-w-lg border border-dashed border-muted-foreground/40 p-12 text-center">
        <span dir="ltr" className="absolute -top-[18px] start-[-1px] bg-muted-foreground px-1 font-mono text-[11px] font-semibold leading-[18px] text-ink">object 0%</span>
        <p dir="ltr" className="font-pixel text-7xl text-primary text-glow">404</p>
        <h1 dir="ltr" className="mt-2 font-mono text-xl font-bold uppercase tracking-widest">No Object Detected</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you're scanning for doesn't exist.</p>
        <Link to="/" className={`${btnClass("primary")} mt-8`}>Return to base</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-xl font-semibold uppercase tracking-widest text-det-red">⚠ Signal lost</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className={btnClass("primary")}>Try again</button>
          <a href="/" className={btnClass("outline")}>Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VisionTrack AI — Every Minute Counts" },
      { name: "description", content: "VisionTrack AI turns live camera feeds into searchable evidence: face and clothing matching, search-radius prediction and potential-match alerts reviewed by a human — built for the first golden hours of a missing person case." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "VisionTrack AI" },
      { property: "og:title", content: "VisionTrack AI — Every Minute Counts" },
      { property: "og:description", content: "Camera-feed search with confidence scores, predicted search radius and human review, built for the golden hours of a missing person case." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "HIxjlc9FvpQQnhhRLElNSD2uw94QBAPe_dlj-Yc38Ug" },

    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&family=Inter+Tight:wght@400;500;700;800&family=Caveat+Brush&family=VT323&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", type: "image/png", href: "/apple-touch-icon.png" },

    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
      <LangProvider>
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
        <StoreSync />
        <PrefsSync />
        <CommandPalette />
        <Toaster position="bottom-left" theme="dark" />
      </LangProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
