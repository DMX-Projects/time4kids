
import { notFound } from 'next/navigation';
import { getFranchiseBySlug } from '@/lib/api/franchises';
import SchoolHeroSection from '@/components/school/home/SchoolHeroSection';
import SchoolIntroSection from '@/components/school/home/SchoolIntroSection';
// 
// import AboutSection from '@/components/school/AboutSection';
import SchoolProgramsSection from '@/components/school/SchoolProgramsSection';
import AdmissionSection from '@/components/school/AdmissionSection';
import GallerySection from '@/components/school/GallerySection';
import ContactSection from '@/components/school/ContactSection';


export const dynamic = 'force-dynamic';

export default async function SchoolDetailsPage({ params }: { params: { city: string, school: string } }) {
    const schoolSlug = params.school;

    // Fetch from Backend API
    const franchise = await getFranchiseBySlug(schoolSlug);

    if (!franchise) {
        notFound();
    }

    // Map backend data to the shape expected by components
    // Components expect 'school' object with specific fields.
    // We can pass the franchise object directly if we update components, 
    // or map it here to match the old 'centre' interface where possible.

    const schoolData = {
        name: franchise.name,
        address: franchise.address,
        city: franchise.city,
        state: franchise.state,
        pincode: franchise.postal_code,
        phone: franchise.contact_phone,
        email: franchise.contact_email,
        mapLink: franchise.google_map_link,
        // Add other fields if necessary
    };

    return (
        <main className="min-h-screen bg-white scroll-smooth selection:bg-orange-100 selection:text-orange-900">

            {/* --- SECTION: HOME --- */}
            <section id="home">
                <SchoolHeroSection
                    schoolName={franchise.name}
                    slides={franchise.hero_slides}
                />
            </section>
            {/* --- SECTION: ABOUT --- */}
            <section id="about">
                <SchoolIntroSection schoolName={franchise.name} />
            </section>

            {/* --- SECTION: PROGRAMS --- */}
            <section id="programs">
                <SchoolProgramsSection />
            </section>

            {/* --- SECTION: ADMISSIONS --- */}
            <section id="admission">
                <AdmissionSection franchiseSlug={schoolSlug} city={franchise.city} />
            </section>

            {/* --- SECTION: GALLERY --- */}
            <section id="gallery">
                <GallerySection schoolName={franchise.name} city={franchise.city} galleryItems={franchise.gallery_items} />
            </section>

            {/* --- SECTION: CONTACT --- */}
            <section id="contact">
                <ContactSection school={schoolData} franchiseSlug={schoolSlug} />
            </section>

        </main>
    );
}
