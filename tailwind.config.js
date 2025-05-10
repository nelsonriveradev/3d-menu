/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // if you're using the app directory
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFD447",
        secondary: "#FF8047",
        warmWhite: "#F9F9F9",
        softBlack: "#232323",
        pureWhite: "#FFFFFF",
        warning: "#FACC15",
        danger: "#EF4444",
        success: "#22C55E",
        info: "#3B82F6",
      },
    },
  },
  plugins: [],
};
