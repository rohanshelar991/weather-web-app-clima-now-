/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      backgroundImage: {
        'sunny': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        'cloudy': 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
        'rainy': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'snowy': 'linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 100%)',
        'night': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'storm': 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
