import { EmojiGame } from "@/components/EmojiGame";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 sm:py-20">
      <header className="mx-auto mb-10 max-w-[640px] text-center">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          Emoji Charades
        </p>
        <h1 className="mb-3 text-[clamp(32px,4.5vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
          Guess the title <span className="text-primary">from the emojis.</span>
        </h1>
        <p className="text-base text-[color:var(--muted-fg)]">
          The AI picks a well-known movie, song, book, or show and represents it with
          emojis only. You get 3 tries, with a hint after each wrong guess.
        </p>
      </header>
      <EmojiGame />
    </main>
  );
}
