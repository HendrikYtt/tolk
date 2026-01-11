/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            colors: {
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                border: 'rgb(var(--border) / <alpha-value>)',
                input: 'rgb(var(--input) / <alpha-value>)',
                ring: 'rgb(var(--ring) / <alpha-value>)',
                primary: {
                    DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                    foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                    foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
                    foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
                },
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                shimmer: 'shimmer 1.8s ease-in-out infinite',
            },
        },
    },
    plugins: [
        function ({ addBase }) {
            addBase({
                ':root': {
                    '--background': '255 255 255',
                    '--foreground': '32 33 36',
                    '--surface': '245 245 245',
                    '--border': '224 224 224',
                    '--input': '224 224 224',
                    '--ring': '66 133 244',
                    '--primary': '66 133 244',
                    '--primary-foreground': '255 255 255',
                    '--secondary': '95 99 104',
                    '--secondary-foreground': '255 255 255',
                    '--muted': '245 245 245',
                    '--muted-foreground': '148 148 148',
                    '--destructive': '234 67 53',
                    '--destructive-foreground': '255 255 255',
                },
            });
        },
    ],
};
