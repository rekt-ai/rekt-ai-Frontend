const { mauve, violet, red, blackA } = require("@radix-ui/colors");

/** @type {import('tailwindcss').Config} */

module.exports = {
	darkMode: 'class',
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				slate: {
					light: "#4C545F",
					dark: "#38424E",
				},
			},
			backgroundImage: {
				'hex-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.8 8.544 15.214 9.96l9.9-9.9h-2.77zM32 0l-3.657 3.657 1.414 1.414L35.143 0H32zm-6.485 0L20.8 4.716l1.415 1.414L27.43 0h-1.914zm-2.83 0l-8.686 8.686 1.415 1.415L25.544 0h-2.83zM8.544 0L0 8.544l1.414 1.415L9.957 0H8.544zm37.656 0l-4.95 4.95 1.414 1.414L47.8 0h-1.6zM5.717 0L0 5.717l1.414 1.415L8.544 0H5.716zM26.86 0L0 26.86l1.414 1.414L52.8 0h-2.83L26.86 0z' fill='%234C545F' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'cyber-glow': 'linear-gradient(180deg, rgba(76, 84, 95, 0.15) 0%, rgba(56, 66, 78, 0.05) 100%)',
				'blockchain-grid': 'linear-gradient(rgba(76, 84, 95, 0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(76, 84, 95, 0.05) 2px, transparent 2px)',
			},
			boxShadow: {
				'neon': '0 0 20px rgba(76, 84, 95, 0.3)',
				'inner-glow': 'inset 0 0 20px rgba(76, 84, 95, 0.2)',
			},
		},
	},
	plugins: [require("tailwindcss-animate")]
};
