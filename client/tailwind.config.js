/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-mantine-color-scheme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        base: "13px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      textColor: {
        DEFAULT: "#0a0a0a",
      },
      colors: {
        "shadcn-darkest": "var(--shadcn-darkest)",
        "shadcn-dark": "var(--shadcn-dark)",
        "shadcn-light": "var(--shadcn-light)",
        "sidebar-bg": "var(--sidebar-bg)",
        "btn-default": "var(--btn-default)",
        "btn-secondary": "var(--btn-secondary)",
        "bd-light": "var(--bd-light)",
        "bd-strong": "var(--bd-strong)",
        "mantine-body": "var(--mantine-color-body)",
        "color-hover": "var(--color-hover)",

        // From shadcn/ui (assistant-ui)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // plugins: [require('tailwindcss-animate')],
};
