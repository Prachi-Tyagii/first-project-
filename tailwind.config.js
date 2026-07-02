/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        civic: '#1E3A8A',
        teal: '#14B8A6',
        success: '#22C55E',
        danger: '#DC2626',
        warning: '#F59E0B',
        slateText: '#1A202C',
        mutedText: '#4A5568',
        pageBg: '#F7FAFC',
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
