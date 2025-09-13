import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        tech: ['Share Tech Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        purple: {
            'DEFAULT': 'rgba(167, 64, 186, 0.8)',
            'soft': 'rgba(167, 64, 186, 0.5)',
            'faint': 'rgba(167, 64, 186, 0.2)',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shoot: {
            '0%': { transform: 'translateX(0) translateY(0) rotate(45deg)', opacity: '1' },
            '100%': { transform: 'translateX(100vw) translateY(-100vh) rotate(45deg)', opacity: '0' },
        },
        moveGrid: {
            'from': { backgroundPosition: '0 0' },
            'to': { backgroundPosition: '3rem 3rem' },
        },
        scan: {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '0 100vh' },
        },
        rotate: {
            '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        fadeIn: {
            'from': { opacity: '0', transform: 'translateY(20px)' },
            'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
            '0%, 100%': { boxShadow: '0 0 20px rgba(167, 64, 186, 0.2)' },
            '50%': { boxShadow: '0 0 40px rgba(167, 64, 186, 0.5)' },
        },
        typing: {
            'from': { width: '0' },
            'to': { width: '100%' },
        },
        'blink-caret': {
            'from, to': { borderColor: 'transparent' },
            '50%': { borderColor: 'rgba(167, 64, 186, 0.8)' },
        },
        'pulse-green': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shoot: 'shoot 5s linear infinite',
        moveGrid: 'moveGrid 20s linear infinite',
        scan: 'scan 7s linear infinite',
        rotate: 'rotate 4s linear infinite',
        fadeIn: 'fadeIn 1s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s infinite',
        typing: 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
        'pulse-green': 'pulse-green 2s infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
      require("tailwindcss-animate"),
      function ({ addUtilities, theme }) {
        const newUtilities = {
            '.text-glow': {
                textShadow: `0 0 8px ${theme('colors.purple.soft')}, 0 0 24px ${theme('colors.purple.faint')}`,
            },
        }
        addUtilities(newUtilities, ['responsive', 'hover'])
      }
    ],
} satisfies Config;

export default config;