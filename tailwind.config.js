/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172126",
        line: "#d8e4df",
        mint: "#dff3eb",
        teal: "#007c75",
        coral: "#f06f4f",
        amber: "#f6b445",
        ocean: "#2563eb",
        leaf: "#2f855a",
        paper: "#fbfdfb",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 33, 38, 0.09)",
        lift: "0 20px 50px rgba(0, 124, 117, 0.16)",
      },
      animation: {
        "fade-up": "fadeUp 520ms ease-out both",
        "soft-pulse": "softPulse 2.4s ease-in-out infinite",
        "slide-in": "slideIn 420ms ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        softPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.88" },
        },
      },
    },
  },
  plugins: [],
};
