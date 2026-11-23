/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#eef4ff',100:'#dbe7fe',200:'#bfd3fe',300:'#93b4fd',400:'#6090fa',500:'#3b6ef6',600:'#1d4ed8',700:'#1e40af',800:'#1e3a8a',900:'#172554',950:'#0a1128' },
        brand: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95',950:'#2e1065' }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        dyslexic: ['OpenDyslexic','Verdana','sans-serif']
      },
      boxShadow: { card:'0 1px 3px rgba(15,23,42,.06),0 8px 24px -12px rgba(15,23,42,.12)' }
    }
  },
  plugins: []
};
