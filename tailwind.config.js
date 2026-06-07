/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  safelist: [
    'text-cyan-400',
    'text-primary-400',
    'text-blue-400',
    'text-red-400',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-cyan-500',
    'bg-blue-500'
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        primary: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81'
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          900: '#164e63'
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

