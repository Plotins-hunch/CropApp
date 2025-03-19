// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stardew-green-light': '#a9db7a',
        'stardew-green': '#58A63C',
        'stardew-green-dark': '#3D7D27',
        'stardew-dirt': '#b98d4f',
        'stardew-dirt-dark': '#8a6837',
        'stardew-water': '#5dbcd2',
        'stardew-water-dark': '#3e97ae',
        'stardew-wood': '#916a3d',
        'stardew-wood-dark': '#6e4a1f',
        'stardew-cream': '#fffacd',
        'stardew-orange': '#f5a442',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'pixel-text': ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}