/** Left-panel backdrop — matches hero constellation, tuned for auth. */
export function AuthBrandBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-20 top-0 h-2/3 w-2/3 rounded-full bg-sky-400/25 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-uptm-gold/15 blur-[80px]" />

      <p className="absolute -right-8 top-1/2 -translate-y-1/2 select-none text-[11rem] font-black leading-none text-white/[0.04]">
        SURS
      </p>

      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-20 600 C 120 480, 260 720, 420 580 S 620 400, 820 520"
          stroke="url(#auth-flow)"
          strokeWidth="1.5"
          className="hero-flow-line"
        />
        <circle cx="200" cy="540" r="4" fill="rgb(147 197 253 / 0.8)" />
        <circle cx="420" cy="580" r="5" fill="rgb(197 160 40 / 0.9)" />
        <circle cx="650" cy="480" r="4" fill="rgb(147 197 253 / 0.7)" />
        <defs>
          <linearGradient id="auth-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(56 189 248 / 0)" />
            <stop offset="50%" stopColor="rgb(56 189 248 / 0.6)" />
            <stop offset="100%" stopColor="rgb(197 160 40 / 0)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#001a33]/80" />
    </div>
  );
}
