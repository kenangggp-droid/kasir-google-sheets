export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal text-white hover:bg-[#00645f]",
    secondary: "bg-white text-ink ring-1 ring-line hover:bg-mint",
    danger: "bg-coral text-white hover:bg-[#d95d40]",
    ghost: "bg-transparent text-ink hover:bg-white/70",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
