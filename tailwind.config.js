/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // Responsive breakpoints
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Colour tokens — satu palet untuk light & dark (nilai ada di index.css)
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        ink: { DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)', soft: 'rgb(var(--color-ink-soft) / <alpha-value>)' },
        mute: 'rgb(var(--color-mute) / <alpha-value>)',
        fog: 'rgb(var(--color-fog) / <alpha-value>)',
        line: { DEFAULT: 'rgb(var(--color-line) / <alpha-value>)', strong: 'rgb(var(--color-line-strong) / <alpha-value>)' },
        scrim: 'rgb(var(--color-scrim) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['"Inter Tight"', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // Typography scale
      fontSize: {
        'display-xl': ['clamp(3.5rem, 17vw, 15rem)', { lineHeight: '0.82', letterSpacing: '-0.045em', fontWeight: '800' }],
        'display-hero': ['clamp(3.5rem, 19vw, 14rem)', { lineHeight: '0.8', letterSpacing: '-0.05em', fontWeight: '800' }],
        'display-lg': ['clamp(3rem, 11vw, 9rem)', { lineHeight: '0.88', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-md': ['clamp(2.5rem, 9vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        lead: ['clamp(1.125rem, 1.6vw, 1.375rem)', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.65' }],
        small: ['0.875rem', { lineHeight: '1.55' }],
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      // Spacing tokens
      spacing: {
        nav: '4rem',
        gutter: 'clamp(1.25rem, 4vw, 3rem)',
        section: 'clamp(5rem, 12vw, 10rem)',
      },
      maxWidth: {
        page: '90rem',
        narrow: '56rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
