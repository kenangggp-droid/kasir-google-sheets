export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal text-white shadow-[0_10px_22px_rgba(0,124,117,0.18)] hover:bg-[#00645f] hover:shadow-lift",
    secondary: "bg-white/90 text-ink ring-1 ring-line hover:bg-mint hover:ring-teal/30",
    danger: "bg-coral text-white shadow-[0_10px_22px_rgba(240,111,79,0.2)] hover:bg-[#d95d40]",
    ghost: "bg-transparent text-ink hover:bg-white/75",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
