export function LeftHeader() {
  return (
    <header className="mb-12">
      <h1 className="mb-3 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.05] tracking-[-0.03em]">
        Apps built with <span className="text-primary">Mesh API</span>
      </h1>
      <p className="text-base text-muted-foreground">
        Click any card to try it live.
      </p>
    </header>
  );
}
