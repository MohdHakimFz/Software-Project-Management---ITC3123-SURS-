export function AuthFormBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute bottom-1/4 left-0 h-72 w-72 rounded-full bg-uptm-gold/5 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgb(0 51 102 / 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgb(197 160 40 / 0.05) 0%, transparent 45%)`,
        }}
      />
    </div>
  );
}
