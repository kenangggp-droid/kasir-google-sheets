export function StatCard({ label, value, tone = "teal", icon: Icon }) {
  const tones = {
    teal: "bg-teal text-white",
    amber: "bg-amber text-ink",
    coral: "bg-coral text-white",
    mint: "bg-mint text-teal",
  };

  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
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
