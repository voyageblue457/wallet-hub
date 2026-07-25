/** @type {import('tailwindcss').Config} */
const projectDir = __dirname.replace(/\\/g, "/");

module.exports = {
  content: [
    `${projectDir}/app/**/*.{js,ts,jsx,tsx}`,
    `${projectDir}/pages/**/*.{js,ts,jsx,tsx}`,
    `${projectDir}/components/**/*.{js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "custom-gray": "#EFEFF6",
        "custom-gray2": "#3D405C",
        "custom-gray3": "#71748D",
        "custom-blue": "#0E0C28",
        "custom-blue2": "#7A80B4",
        "custom-blue3": "#F9F9FF",
        "custom-blue4": "#484c75",
        "custom-blue5": "#242849",
        "custom-indigo": "#A4AADB",
        "custom-indigo2": "#7171a6",
      },
    },
  },
  plugins: [],
};
