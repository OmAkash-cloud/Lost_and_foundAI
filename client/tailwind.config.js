/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FFD700', // Yellow
                accent: '#FFA500', // Orange
                dark: '#000000', // Black
                light: '#F5F5F5', // Light Gray
            },
            backgroundImage: {
                'diagonal-stripes': 'repeating-linear-gradient(45deg, #F5F5F5, #F5F5F5 10px, #FFFFFF 10px, #FFFFFF 20px)',
            }
        },
    },
    plugins: [],
}
