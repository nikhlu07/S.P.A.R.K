import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        'cyber': ['Share Tech Mono', 'monospace'],
        'neural': ['Orbitron', 'monospace'],
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
          glow: "hsl(var(--primary-glow))",
          deep: "hsl(var(--primary-deep))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          glow: "hsl(var(--success-glow))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        spark: {
          purple: "hsl(var(--electric-purple))",
          'purple-light': "hsl(var(--neon-purple))",
          'purple-dark': "hsl(var(--dark-purple))",
          gold: "hsl(var(--cyber-gold))",
          success: "hsl(var(--spark-success))",
        },
        matrix: {
          green: "hsl(var(--matrix-green))",
          'green-dim': "hsl(var(--matrix-green-dim))",
        },
        cyber: {
          purple: "hsl(var(--electric-purple))",
          violet: "hsl(var(--deep-violet))",
          neon: "hsl(var(--neon-purple))",
          dark: "hsl(var(--dark-purple))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        'gradient-neural': 'var(--gradient-neural)',
        'gradient-cyber': 'var(--gradient-cyber)',
        'gradient-electric': 'var(--gradient-electric)',
        'gradient-glow': 'var(--gradient-glow)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-success': 'var(--gradient-success)',
      },
      boxShadow: {
        'neural': 'var(--shadow-neural)',
        'electric': 'var(--shadow-electric)',
        'matrix': 'var(--shadow-matrix)',
        'cyber': 'var(--shadow-cyber)',
        'deep': 'var(--shadow-deep)',
        'glow': 'var(--shadow-neural)',
        'success': 'var(--shadow-success)',
      },
      transitionTimingFunction: {
        'cyber': 'var(--transition-cyber)',
        'glow': 'var(--transition-glow)',
        'electric': 'var(--transition-electric)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Neural Grid Animation
        "moveGrid": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "100%": {
            transform: "translate(var(--neural-grid-size), var(--neural-grid-size))",
          },
        },
        
        // Cyberpunk Glow Effects
        "cyber-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(267 83% 58% / 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(267 83% 58% / 0.8), 0 0 60px hsl(267 83% 58% / 0.4)",
          },
        },
        
        // Electric Border Rotation
        "electric-border": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        
        // Shooting Stars
        "shooting-star": {
          "0%": {
            transform: "translateX(-100vw) translateY(100vh)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100vw) translateY(-100vh)",
            opacity: "0",
          },
        },
        
        // Neural Pulse
        "neural-pulse": {
          "0%, 100%": {
            opacity: "0.5",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.1)",
          },
        },
        
        // Holographic Shimmer
        "holo-shimmer": {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
        
        // Matrix Data Stream
        "data-stream": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh)",
            opacity: "0",
          },
        },
        
        // Floating with Glow
        "float-glow": {
          "0%, 100%": {
            transform: "translateY(0px)",
            boxShadow: "0 5px 20px hsl(267 83% 58% / 0.3)",
          },
          "50%": {
            transform: "translateY(-15px)",
            boxShadow: "0 15px 40px hsl(267 83% 58% / 0.5)",
          },
        },
        
        // Classic animations enhanced
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
        // Core animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // Cyberpunk animations
        "moveGrid": "moveGrid 20s linear infinite",
        "cyber-glow": "cyber-glow 3s ease-in-out infinite",
        "electric-border": "electric-border 4s linear infinite",
        "shooting-star": "shooting-star 3s linear infinite",
        "neural-pulse": "neural-pulse 2s ease-in-out infinite",
        "holo-shimmer": "holo-shimmer 2s ease-in-out infinite",
        "data-stream": "data-stream 4s linear infinite",
        "float-glow": "float-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
