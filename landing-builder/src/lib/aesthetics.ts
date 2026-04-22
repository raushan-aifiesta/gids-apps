/**
 * Aesthetic direction + anti-slop guardrails, distilled from:
 *  - anthropics/skills frontend-design SKILL.md
 *  - ui-ux-pro-max SKILL.md
 *  - OpenAI GPT-5.4 frontend playbook
 *
 * Injected into every generator prompt so the model commits to a BOLD
 * aesthetic direction instead of producing a generic AI-slop page.
 */

export const TONES = [
  {
    id: "editorial",
    label: "Editorial",
    gist: "Magazine-typesetting, generous whitespace, oversized serif hero, thin rules.",
    fontPair: "Fraunces (display) + Inter Tight (body) — or pick equivalents",
  },
  {
    id: "brutalist",
    label: "Brutalist",
    gist: "Raw, exposed, heavy borders, mono-dominant palette, no gradients, structural typography.",
    fontPair: "Space Mono (display) + IBM Plex Sans (body)",
  },
  {
    id: "retro-futuristic",
    label: "Retro-futuristic",
    gist: "80s sci-fi — neon gradients on black, chrome, grid backgrounds, VHS grain, glow effects.",
    fontPair: "Orbitron or Rubik Glitch (display) + Space Grotesk (body)",
  },
  {
    id: "organic",
    label: "Organic / natural",
    gist: "Earthy palette (clay, moss, sand), soft rounded shapes, grain textures, asymmetric layout.",
    fontPair: "Cormorant Garamond (display) + Newsreader (body)",
  },
  {
    id: "luxury",
    label: "Luxury",
    gist: "Deep black + gold/bronze, editorial serifs, heavy tracking, sparing accents, full-bleed imagery.",
    fontPair: "Playfair Display (display) + Libre Caslon Text (body)",
  },
  {
    id: "playful",
    label: "Playful",
    gist: "Bright primary colors, rounded everything, hand-drawn accents, bouncy motion, fun emoji-free illustrations.",
    fontPair: "Fraunces or Unbounded (display) + DM Sans (body)",
  },
  {
    id: "minimal",
    label: "Minimal",
    gist: "Near-monochrome, airy, one accent color, tight grid, geometric sans, precise typography.",
    fontPair: "Instrument Serif (display) + Geist (body)",
  },
  {
    id: "maximalist",
    label: "Maximalist",
    gist: "Dense information, overlapping cards, multiple type families, bold color collisions, scroll surprises.",
    fontPair: "Clash Display (display) + Satoshi (body)",
  },
  {
    id: "developer",
    label: "Developer / technical",
    gist: "Dark matte with one violet or green accent, monospace-first typography, code mocks, terminal vibes.",
    fontPair: "JetBrains Mono or Fira Code (display + body) + Geist Sans for copy",
  },
  {
    id: "soft-pastel",
    label: "Soft pastel",
    gist: "Muted pastels, cream backgrounds, rounded cards, subtle shadows, humane and warm.",
    fontPair: "Caveat (display accent) + Manrope (body)",
  },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export function toneById(id: string) {
  return TONES.find((t) => t.id === id);
}

/**
 * Verbatim-style distillation of the aesthetics rules. Append this to the
 * system prompt on every design pass. Biggest single quality bump we get.
 */
export const DISTILLED_AESTHETICS = `
AESTHETIC DIRECTION — BE BOLD

Before writing any HTML, commit to one clear aesthetic direction with a point of view. Pick an extreme and execute it with precision — bold maximalism and refined minimalism both work, the key is intentionality, not intensity.

TYPOGRAPHY
- Use two distinctive, beautiful fonts from Google Fonts. One display + one body.
- Set tracking, weight, and size with intent. Hero headlines can go huge (clamp to 72–120px on desktop).
- Mix extremes (black+light, 900+200) for drama when the tone calls for it.

COLOR
- Commit to a cohesive palette. Declare CSS custom properties (--bg, --fg, --muted, --primary, --surface, --border, --on-primary) and reference them via Tailwind arbitrary values (bg-[var(--bg)]).
- Dominant colors + sharp accents beat timid evenly-distributed palettes.
- Industry-fit: finance→navy/gray, beauty→soft pastels, dev-tools→dark matte + one accent, consumer→bright.

COMPOSITION
- Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements.
- Generous negative space OR controlled density — pick one and commit.
- First viewport should be ONE unified composition. Not hero + features crammed together.

BACKGROUND & DEPTH
- Create atmosphere, not flat surfaces. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays — use what fits the tone.

MOTION
- One well-orchestrated page load with staggered reveals (CSS animation-delay, 40–80ms stagger) beats scattered micro-interactions.
- Transforms/opacity only. 150–300ms easing. Respect prefers-reduced-motion.

HARD BANS — automatic rejection if present
- Inter, Roboto, Arial, or system-ui as display font.
- Purple-to-blue gradients on white backgrounds (AI-slop cliche).
- Emoji as structural icons (🚀 ⚙️ 🎨 — use inline SVG).
- Raw hex inside components — always via CSS custom properties.
- Uniform 16px border-radius on everything (variety).
- Identical "hero with centered headline + two buttons + three-feature strip" (unless the brief demands it, and even then — add something unexpected).
- user-scalable=no on viewport meta.
- Dark mode by simple colour inversion.

REAL CONTENT
- Hero headlines: ≤12 words, specific, declarative. NOT "Build the future" / "Unleash your potential".
- Subheads: one sentence, concrete benefit, names a number if possible.
- Testimonials: full name + role + company, not "John, CEO".
- Feature blurbs: 1–2 sentences max, technical verbs over marketing adjectives.

DO NOT HOLD BACK. Commit fully to a distinctive vision.
`;

export function brandingInstructions(tone?: string): string {
  const picked = tone ? toneById(tone) : null;
  if (!picked) {
    return `AESTHETIC TONE: The brief itself should dictate the tone. Pick decisively — never "versatile" or "modern clean".`;
  }
  return `AESTHETIC TONE: ${picked.label}
- Direction: ${picked.gist}
- Suggested font pair: ${picked.fontPair} (swap for something equally distinctive if you have a better fit).`;
}
