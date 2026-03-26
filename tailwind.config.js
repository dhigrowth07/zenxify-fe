/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
    darkMode: "class",
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: "#8c2bee",
                "primary-hover": "#7a25d1",
                "primary-dark": "#6b21c4",
                background: "#F7F6F8",
                "background-dark": "#191022",
                surface: "#ffffff",
                "surface-dark": "#f9fafb",
                charcoal: "#2d3436",
                "light-purple": "#f5f0ff",
                "border-light": "#e9e4f0",
            },
            backgroundImage: {
                "brand-gradient": "linear-gradient(to right, #FF00FF, #a400cd)",
            },
            animation: {
                scroll:
                    'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
            },
            keyframes: {
                scroll: {
                    to: {
                        transform: 'translate(calc(-50% - 0.5rem))',
                    },
                },
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                numeric: ['Zen Dots', 'sans-serif'],
                body: ['Product Sans', 'sans-serif'],
                sub: ['Inter', 'sans-serif'],
                restore: ['Restore', 'sans-serif'],
            },
            gridTemplateColumns: {
                custom: 'repeat(12, minmax(0, 1fr))',
            },
            margin: {
                grid: '48px',
            },
            gap: {
                gutter: '20px',
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [
        plugin(function ({ addBase, addComponents }) {
            addBase({
                '.main-heading': {
                    '@apply font-normal dark:text-white text-black text-center text-2xl md:text-3xl leading-tight':
                        {},
                    fontSize: '2.5rem',
                    lineHeight: '3.25rem',
                    '@screen md': {
                        '@apply text-4xl': {},
                        fontSize: '2.75rem',
                        lineHeight: '3.75rem',
                    },
                    '@screen lg': {
                        '@apply text-5xl': {},
                        fontSize: '3.25rem',
                        lineHeight: '4.0625rem',
                    },
                    '@screen xl': {
                        fontSize: '3.75rem',
                        lineHeight: '4.1rem',
                    },
                },

                '.sub-heading': {
                    '@apply  font-normal text-primary-dark text-center': {},
                    fontSize: '2rem',
                    lineHeight: '2.5rem',
                    '@screen md': { fontSize: '2.25rem', lineHeight: '2.75rem' },
                    '@screen lg': { fontSize: '2.5rem', lineHeight: '3rem' },
                },
                '.section-title': {
                    '@apply font-medium text-primary': {},
                    fontSize: '1.75rem',
                    lineHeight: '2.25rem',
                },
                '.body-text': {
                    '@apply font-body text-charcoal text-lg leading-relaxed': {},
                    fontSize: '1.25rem',
                    lineHeight: '1.75rem',
                },
                '.sub-text': {
                    '@apply font-sub text-charcoal/60 dark:text-gray-500 text-sm leading-snug': {},
                },
            });

            addComponents({
                '.btn': {
                    '@apply px-6 py-3 text-white font-bold rounded-md transition-all duration-300':
                        {},
                },
                '.btn-primary': {
                    '@apply bg-primary hover:bg-primary-hover': {},
                },
                '.btn-outline': {
                    '@apply border border-primary text-primary hover:bg-primary hover:text-white':
                        {},
                },
                '.flex-center': {
                    '@apply flex items-center justify-center': {},
                },
                '.container': {
                    '@apply max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8': {},
                },
            });
        }),
    ],
};
