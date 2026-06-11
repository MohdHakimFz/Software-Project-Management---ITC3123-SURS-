const ACTIVITIES = [
  { name: "Ahmad R.", action: "enrolled in ITC312", time: "just now" },
  { name: "Siti N.", action: "paid semester fees", time: "2m ago" },
  { name: "Raj K.", action: "confirmed enrollment", time: "5m ago" },
  { name: "Farah L.", action: "enrolled in CYS201", time: "8m ago" },
];

export function AuthActivityTicker() {
  const items = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-sky-300/80">
        Live registration activity
      </p>
      <div className="auth-activity-track space-y-3">
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-xs font-bold text-sky-200">
                {item.name.charAt(0)}
              </span>
              <p className="truncate text-white/85">
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-white/60">{item.action}</span>
              </p>
            </div>
            <span className="shrink-0 text-[10px] text-white/40">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
