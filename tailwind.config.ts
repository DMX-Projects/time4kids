import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: {
					'50': '#fff7ed',
					'100': '#ffedd5',
					'200': '#fed7aa',
					'300': '#fdba74',
					'400': '#fb923c',
					'500': '#f97316',
					'600': '#ea580c',
					'700': '#c2410c',
					'800': '#9a3412',
					'900': '#7c2d12',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					'50': '#f0f9ff',
					'100': '#e0f2fe',
					'200': '#bae6fd',
					'300': '#7dd3fc',
					'400': '#38bdf8',
					'500': '#0ea5e9',
					'600': '#0284c7',
					'700': '#0369a1',
					'800': '#075985',
					'900': '#0c4a6e',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				sans: [
					'var(--font-quicksand)',
					'var(--font-inter)',
					'system-ui',
					'sans-serif'
				],
				display: [
					'var(--font-poppins)',
					'system-ui',
					'sans-serif'
				],
				fredoka: [
					'var(--font-fredoka)',
					'system-ui',
					'sans-serif'
				],
				baloo: [
					'var(--font-baloo)',
					'system-ui',
					'sans-serif'
				],
				comic: [
					'var(--font-comic)',
					'Comic Sans MS',
					'cursive'
				],
				chewy: [
					'var(--font-chewy)',
					'cursive'
				],
				bubblegum: [
					'var(--font-bubblegum)',
					'cursive'
				],
				luckiest: [
					'var(--font-luckiest)',
					'cursive'
				],
				quicksand: [
					'var(--font-quicksand)',
					'sans-serif'
				],
				abeezee: [
					'var(--font-abeezee)',
					'sans-serif'
				],
				andika: [
					'var(--font-andika)',
					'sans-serif'
				]
			},
			fontSize: {
				xs: [
					'0.75rem',
					{
						lineHeight: '1.5'
					}
				],
				sm: [
					'0.875rem',
					{
						lineHeight: '1.5'
					}
				],
				base: [
					'1rem',
					{
						lineHeight: '1.6'
					}
				],
				lg: [
					'1.125rem',
					{
						lineHeight: '1.6'
					}
				],
				xl: [
					'1.25rem',
					{
						lineHeight: '1.6'
					}
				],
				'2xl': [
					'1.5rem',
					{
						lineHeight: '1.5'
					}
				],
				'3xl': [
					'1.875rem',
					{
						lineHeight: '1.4'
					}
				],
				'4xl': [
					'2.25rem',
					{
						lineHeight: '1.3'
					}
				],
				'5xl': [
					'3rem',
					{
						lineHeight: '1.2'
					}
				],
				'6xl': [
					'3.75rem',
					{
						lineHeight: '1.1'
					}
				],
				'7xl': [
					'4.5rem',
					{
						lineHeight: '1.1'
					}
				],
				'8xl': [
					'6rem',
					{
						lineHeight: '1'
					}
				],
				'9xl': [
					'8rem',
					{
						lineHeight: '1'
					}
				]
			},
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.6s ease-out',
				'slide-down': 'slideDown 0.6s ease-out',
				'scale-in': 'scaleIn 0.4s ease-out',
				float: 'float 3s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				fadeIn: {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				slideUp: {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				slideDown: {
					'0%': {
						transform: 'translateY(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				scaleIn: {
					'0%': {
						transform: 'scale(0.9)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			borderRadius: {
				brand: '24px',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
