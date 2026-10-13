/** @type {import('tailwindcss').Config} */
// Configuración de Tailwind CSS adaptada con los tokens de diseño de Stitch MCP (Cloud Horizon Developer Console)
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gcp: {
          blue: "#4285F4",
          green: "#34A853",
          yellow: "#FBBC05",
          red: "#EA4335",
        },
        slate: {
          950: "#0B1326", // Fondo principal deep obsidian navy
          900: "#0E172A", // Capa estructural y barra de navegación
          850: "#131D35", // Paneles secundarios
          800: "#18223D", // Tarjetas interactivas
          750: "#1E2942", // Hover y elevación 2
          700: "#2A385B", // Bordes luminosos
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
