/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        space: {
          bg: '#07071a',
          panel: '#0e0e2a',
          border: '#1a2a4a',
          cyan: '#4af0ff',
          blue: '#7aaeff',
          green: '#4affa0',
          red: '#ff5555',
          amber: '#ffaa44',
        },
      },
    },
  },
  plugins: [],
}
