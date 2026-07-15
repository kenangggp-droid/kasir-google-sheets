export function StatCard({ label, value, tone = "teal", icon: Icon }) {
  const tones = {
    teal: "bg-teal text-white shadow-[0_12px_26px_rgba(0,124,117,0.2)]",
    amber: "bg-amber text-ink shadow-[0_12px_26px_rgba(246,180,69,0.22)]",
    coral: "bg-coral text-white shadow-[0_12px_26px_rgba(240,111,79,0.22)]",
    mint: "bg-mint text-teal shadow-[0_12px_26px_rgba(0,124,117,0.12)]",
  };

  return (
    <div className="glass-panel rounded-md p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal">{value}</p>
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-md ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
