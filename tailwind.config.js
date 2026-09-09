/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'insal-azul': '#0A4D9C',     /* Azul oficial del borde del sello */
        'insal-naranja': '#E67A15',  /* Naranja oficial del escudo */
        'insal-rojo': '#8B1E23',     /* Rojo granate del marco */
        'insal-dorado': '#D19E37',   /* Dorado del listón */
        'insal-fondo': '#F7F8FA',    /* Fondo claro e institucional */
        
        /* Mapeo para no romper clases existentes */
        'fondo-oscuro': '#F7F8FA',
        'tarjeta-gris': '#FFFFFF',
        'naranja-sanluis': '#E67A15',
        'azul-acento': '#0A4D9C',
      },
    },
  },
  plugins: [],
}