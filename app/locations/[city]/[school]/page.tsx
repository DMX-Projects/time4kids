import { notFound } from 'next/navigation';
import { getFranchiseBySlug } from '@/lib/api/franchises';
import SchoolHeroSection from '@/components/school/home/SchoolHeroSection';
import SchoolIntroSection from '@/components/school/home/SchoolIntroSection';
import SchoolProgramsSection from '@/components/school/SchoolProgramsSection';
import AdmissionSection from '@/components/school/AdmissionSection';
import GallerySection from '@/components/school/GallerySection';
import ContactSection from '@/components/school/ContactSection';

interface PageProps {
    params: {
        city: string;
        school: string;
    };
}

export default async function SchoolPage({ params }: PageProps) {
    const { school, city } = params;

    // Fetch franchise data
    const franchise = await getFranchiseBySlug(school);

    if (!franchise) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Home / Hero Section */}
            <div id="home">
                <SchoolHeroSection
                    schoolName={franchise.name}
                    slides={franchise.hero_slides}
                />
            </div>

            {/* About Us Section */}
            <div id="about">
                <SchoolIntroSection schoolName={franchise.name} />
            </div>

            {/* Classes Section - Component has internal id="programs" */}
            <SchoolProgramsSection />

            {/* Admissions Section - Component has internal id="admission" */}
            <AdmissionSection
                franchiseSlug={franchise.slug}
                city={franchise.city}
            />

            {/* Media / Gallery Section - Component has internal id="gallery" */}
            <GallerySection
                schoolName={franchise.name}
                city={franchise.city}
                events={franchise.events}
                galleryItems={franchise.gallery_items}
            />

            {/* Contact Section - Component has internal id="contact" */}
            <ContactSection
                school={franchise}
                franchiseSlug={franchise.slug}
            />
        </main>
    );
}
