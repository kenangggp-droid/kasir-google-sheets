/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172126",
        line: "#d9e2df",
        mint: "#dff3eb",
        teal: "#007c75",
        coral: "#f06f4f",
        amber: "#f6b445",
      },
      boxShadow: {
        panel: "0 14px 35px rgba(23, 33, 38, 0.08)",
      },
    },
  },
  plugins: [],
};
