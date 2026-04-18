"use client";

import { openCalendly } from "@/lib/calendly";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      {/* Large decorative watermark - full width
      <div className="mb-8 px-6 sm:px-10 lg:px-16">
        <div
          className="font-mono font-bold text-foreground select-none leading-none whitespace-nowrap w-full"
          style={{
            fontSize: "11.5vw",
            letterSpacing: "-0.04em",
            maskImage: "linear-gradient(to bottom, white 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, white 0%, transparent 100%)",
          }}
        >
          mesh_api
        </div>
      </div>
      */}

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/mesh_api_logo_icon.svg" alt="Mesh API" className="w-5 h-5" />
              <span className="font-mono text-sm tracking-tight text-foreground">
                mesh_api
              </span>
            </div>
            <p className="text-[14px] leading-[1.7] max-w-[320px] mb-4 text-muted-foreground/80">
              300+ AI LLMs through one unified API. Discounted pricing, ₹ billing,
              and dedicated support.
            </p>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span>by</span>
              <a
                href="https://aifiesta.ai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AI Fiesta"
                className="inline-flex items-center transition-opacity hover:opacity-80"
              >
                <img
                  src="/ai_fiesta_logo.png"
                  alt="AI Fiesta"
                  className="h-6 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://developers.meshapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://meshapi.ai/models"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Models
                </a>
              </li>
              <li>
                <a
                  href="https://meshapi.ai/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              {/*
              <li>
                <a
                  href="https://meshapi.ai/ambassador"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ambassador Program
                </a>
              </li>
              */}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://x.com/meshapi_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    void openCalendly();
                  }}
                  className="text-left text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <a
                  href="https://chat.aifiesta.ai/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://chat.aifiesta.ai/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms &amp; Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60">
          <span className="font-mono text-[12px] text-muted-foreground/60">
            © {new Date().getFullYear()} Mesh API. All rights reserved.
          </span>
          <span className="font-mono text-[12px] text-muted-foreground/60 flex items-center gap-1.5">
            Built in India <span>🇮🇳</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
