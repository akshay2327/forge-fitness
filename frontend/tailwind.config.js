/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        'off-black': '#111111',
        dark: '#181818',
        card: '#1e1e1e',
        accent: {
          DEFAULT: '#e8c547',
          hover: '#f0d460',
          dim: 'rgba(232,197,71,0.12)',
        },
        muted: '#888880',
        success: '#4caf7d',
        danger: '#e85c3a',
        info: '#4a9eff',
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.18)',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'modal-in': 'modalIn 0.25s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        modalIn: { from: { opacity: '0', transform: 'scale(0.96) translateY(16px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
      },
      borderRadius: { DEFAULT: '12px', sm: '8px' },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
