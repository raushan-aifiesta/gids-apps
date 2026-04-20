"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { ContactFormPanel } from "./ContactFormPanel";

export function StickyNavBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sticky top nav — always visible */}
      <div className="sticky top-0 z-30 flex items-center gap-2 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-4 mb-8 border-b border-border sm:px-10 lg:border-none lg:bg-transparent lg:backdrop-blur-none lg:static lg:pt-16 lg:pb-0 lg:px-14 lg:mb-10 lg:max-w-[820px] lg:mx-auto lg:w-full">
        <a
          href="https://meshapi.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img src="/mesh_api_logo_icon.svg" alt="" className="h-6 w-6 shrink-0" />
          <span className="font-mono text-[15px] font-medium tracking-tight text-foreground">
            mesh_api
          </span>
        </a>
        <span className="font-mono text-xs text-muted-foreground">by</span>
        <a
          href="https://aifiesta.ai/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="AI Fiesta"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <img src="/ai_fiesta_logo.png" alt="AI Fiesta" className="h-5 w-auto" />
        </a>

        <span className="ml-auto flex items-center gap-4">
          {/* Links — hidden on mobile */}
          <a
            href="https://developers.meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </a>
          <a
            href="https://meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-xs text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          >
            meshapi.ai ↗
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors lg:hidden"
            aria-label="Open contact form"
          >
            <Menu size={18} />
          </button>
        </span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-end px-4 py-3 border-b border-border shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4 border-b border-border px-8 py-5 shrink-0">
              <Image
                src="/gids-qr.svg"
                alt="Scan to open GIDS"
                width={64}
                height={64}
                className="shrink-0"
              />
              <div>
                <p className="text-xs font-medium">Open on your phone</p>
                <p className="text-[11px] text-muted-foreground">Scan to explore GIDS</p>
              </div>
            </div>
            <div className="flex-1">
              <ContactFormPanel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
