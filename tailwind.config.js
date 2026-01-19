/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3F7CAC', // trust / foundation
          accent: '#2EC4B6', // growth / CTA
          warm: '#F7B267', // family warmth
          ink: '#0F172A',
          muted: '#4B5563',
          surface: '#F4F7FB',
          canvas: '#FDFDFD',
          border: '#E2E8F0',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['\"Poppins\"', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['\"Lato\"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
        glass: '0 20px 60px rgba(31, 41, 55, 0.10)',
        card: '0 12px 36px rgba(63, 124, 172, 0.10)',
      },
      borderRadius: {
        pill: '999px',
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 400ms ease-out',
      },
    },
  },
  plugins: [],
}