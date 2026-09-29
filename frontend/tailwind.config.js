/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#0B0F19",
          800: "#111827",
          700: "#1F2937",
        },
        cyan: {
          accent: "#00F2FE",
          bright: "#4FACFE",
        },
        alert: {
          amber: "#FFB300",
          crimson: "#FF3B30",
          emerald: "#00E676",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'cyan-glow': 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, rgba(11,15,25,0) 70%)',
      }
    },
  },
  plugins: [],
}
