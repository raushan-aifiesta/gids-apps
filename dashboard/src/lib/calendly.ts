const CALENDLY_URL = "https://calendly.com/mesh_api-by-aifiesta/discovery";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

let loaderPromise: Promise<void> | null = null;

function loadAssets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector(
      `script[src="${WIDGET_JS}"]`,
    ) as HTMLScriptElement | null;

    if (existing && (window as { Calendly?: unknown }).Calendly) {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = WIDGET_JS;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => resolve(), { once: true });
  });

  return loaderPromise;
}

export async function openCalendly(): Promise<void> {
  if (typeof window === "undefined") return;
  await loadAssets();
  const calendly = (window as { Calendly?: { initPopupWidget: (opts: { url: string }) => void } })
    .Calendly;
  if (!calendly) {
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    return;
  }
  calendly.initPopupWidget({ url: CALENDLY_URL });
}
