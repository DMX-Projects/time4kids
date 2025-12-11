# T.I.M.E. Kids Preschool Website

A modern, responsive preschool website built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and GSAP.

## Features

- 🎨 Modern, vibrant design with gradient backgrounds and glassmorphism
- 📱 Fully responsive across all devices
- ⚡ Fast performance with Next.js 14 App Router
- 🎭 Smooth animations using Framer Motion and GSAP
- 📝 Form handling with React Hook Form
- 🗺️ Centre locator with search and filters
- 💬 Interactive chatbot
- 🔐 Login systems for parents and franchise
- 📊 SEO optimized with meta tags

## Pages

- **Home** - Hero section, why choose us, programs preview, testimonials
- **About** - Company story, vision, philosophy, T.I.M.E. Group businesses
- **Programs** - Detailed program information for all age groups
- **Admission** - Enquiry form, FAQs, key skills, infrastructure, NEP 2020 curriculum
- **Franchise** - Franchise opportunity, benefits, testimonials
- **Locate Centre** - Search centres by city/state with contact details
- **Contact** - Contact form, social media links, careers section
- **Login** - Separate portals for parents and franchise partners

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion, GSAP
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **QR Codes:** qrcode.react

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Project Structure

```
Time-Kids/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── admission/         # Admission page
│   ├── contact/           # Contact page
│   ├── franchise/         # Franchise page
│   ├── locate-centre/     # Centre locator
│   ├── login/             # Login pages
│   │   ├── parents/       # Parent login
│   │   └── franchise/     # Franchise login
│   ├── programs/          # Programs page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admission/         # Admission components
│   ├── franchise/         # Franchise components
│   ├── home/              # Home page components
│   ├── layout/            # Layout components
│   ├── shared/            # Shared components
│   └── ui/                # UI components
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies

```

## Key Components

- **Header** - Responsive navigation with login dropdowns
- **Footer** - Links, contact info, social media, QR codes
- **Chatbot** - Floating chat widget with quick questions
- **Forms** - Admission and franchise enquiry forms with validation
- **Cards** - Reusable card component with glassmorphism
- **Buttons** - Multiple variants with loading states
- **Modal** - Animated modal dialogs

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
colors: {
  primary: { ... },  // Orange theme
  secondary: { ... }, // Blue theme
}
```

### Fonts

Fonts are configured in `app/layout.tsx`:
- **Inter** - Body text
- **Poppins** - Display/headings

### Animations

- Framer Motion variants in components
- GSAP ScrollTrigger for scroll animations
- Custom Tailwind animations in `tailwind.config.ts`

## SEO

Each page includes:
- Optimized meta titles and descriptions
- City-wise keywords for local SEO
- Open Graph tags
- Semantic HTML structure

## Future Enhancements

- Google Maps API integration for centre locator
- Backend authentication for login systems
- CMS integration for content management
- Payment gateway for fee payments
- Parent dashboard with child progress tracking
- Franchise dashboard for operations management

## Support

For questions or support, contact:
- Email: info@timekids.com
- Phone: +91 123 456 7890

## License

© 2024 T.I.M.E. Kids Preschools. All rights reserved.
