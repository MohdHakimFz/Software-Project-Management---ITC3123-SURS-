/** Unique hero backdrop — enrollment flow arcs + mesh glow (not the usual grid). */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Mesh glow */}
      <div className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-sky-500/20 blur-[120px]" />
      <div className="absolute -right-1/4 top-1/4 h-[55%] w-[55%] rounded-full bg-blue-600/15 blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 h-[40%] w-[45%] rounded-full bg-uptm-gold/10 blur-[90px]" />

      {/* Enrollment flow arcs */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-40 520 C 200 380, 380 680, 620 520 S 980 280, 1200 420 S 1480 620, 1520 480"
          stroke="url(#flow-a)"
          strokeWidth="1.5"
          className="hero-flow-line"
        />
        <path
          d="M-60 640 C 180 500, 420 760, 700 600 S 1050 360, 1320 500"
          stroke="url(#flow-b)"
          strokeWidth="1"
          className="hero-flow-line hero-flow-line--delay"
        />
        <path
          d="M200 120 C 400 280, 620 80, 900 200 S 1200 380, 1380 260"
          stroke="url(#flow-c)"
          strokeWidth="1"
          opacity="0.6"
          className="hero-flow-line hero-flow-line--delay-2"
        />

        {/* Journey nodes — register → enroll → pay → confirm */}
        {[
          { cx: 280, cy: 470, r: 5 },
          { cx: 620, cy: 520, r: 6 },
          { cx: 900, cy: 380, r: 5 },
          { cx: 1180, cy: 420, r: 7 },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.cx} cy={node.cy} r={node.r * 3} fill="url(#node-glow)" className="hero-node-pulse" style={{ animationDelay: `${i * 0.6}s` }} />
            <circle cx={node.cx} cy={node.cy} r={node.r} fill="rgb(147 197 253 / 0.9)" />
          </g>
        ))}

        <defs>
          <linearGradient id="flow-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(56 189 248 / 0)" />
            <stop offset="35%" stopColor="rgb(56 189 248 / 0.7)" />
            <stop offset="65%" stopColor="rgb(197 160 40 / 0.5)" />
            <stop offset="100%" stopColor="rgb(56 189 248 / 0)" />
          </linearGradient>
          <linearGradient id="flow-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(96 165 250 / 0)" />
            <stop offset="50%" stopColor="rgb(96 165 250 / 0.45)" />
            <stop offset="100%" stopColor="rgb(96 165 250 / 0)" />
          </linearGradient>
          <linearGradient id="flow-c" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(197 160 40 / 0)" />
            <stop offset="50%" stopColor="rgb(197 160 40 / 0.35)" />
            <stop offset="100%" stopColor="rgb(197 160 40 / 0)" />
          </linearGradient>
          <radialGradient id="node-glow">
            <stop offset="0%" stopColor="rgb(147 197 253 / 0.35)" />
            <stop offset="100%" stopColor="rgb(147 197 253 / 0)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Soft constellation dots — not a grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(circle at 12% 22%, rgb(255 255 255 / 0.9) 1px, transparent 1px),
            radial-gradient(circle at 78% 18%, rgb(255 255 255 / 0.7) 1px, transparent 1px),
            radial-gradient(circle at 34% 68%, rgb(255 255 255 / 0.6) 1px, transparent 1px),
            radial-gradient(circle at 88% 72%, rgb(255 255 255 / 0.8) 1px, transparent 1px),
            radial-gradient(circle at 55% 42%, rgb(255 255 255 / 0.5) 1px, transparent 1px),
            radial-gradient(circle at 22% 85%, rgb(197 160 40 / 0.8) 1.5px, transparent 1.5px),
            radial-gradient(circle at 92% 38%, rgb(197 160 40 / 0.6) 1px, transparent 1px),
            radial-gradient(circle at 48% 12%, rgb(255 255 255 / 0.4) 1px, transparent 1px),
            radial-gradient(circle at 65% 88%, rgb(255 255 255 / 0.55) 1px, transparent 1px)`,
          backgroundSize: "100% 100%",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#002244]/20 via-transparent to-[#001528]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#002244]/60 via-transparent to-transparent" />
    </div>
  );
}
