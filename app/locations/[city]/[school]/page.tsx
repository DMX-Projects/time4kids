import { notFound } from 'next/navigation';
import { getFranchiseBySlug } from '@/lib/api/franchises';
import SchoolHeroSection from '@/components/school/home/SchoolHeroSection';
import SchoolIntroSection from '@/components/school/home/SchoolIntroSection';
import SchoolProgramsSection from '@/components/school/SchoolProgramsSection';
import AdmissionSection from '@/components/school/AdmissionSection';
import GallerySection from '@/components/school/GallerySection';
import ContactSection from '@/components/school/ContactSection';
import SchoolUpdatesSection from '@/components/school/SchoolUpdatesSection';

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
        <main className="min-h-screen bg-slate-50">
            {/* Home / Hero Section */}
            <div id="home" className="bg-white">
                <SchoolHeroSection
                    schoolName={franchise.name}
                    slides={franchise.hero_slides}
                />
            </div>

            {/* About Us Section */}
            <div id="about" className="border-t border-slate-200/80 bg-[#fffaf0]">
                <SchoolIntroSection schoolName={franchise.name} />
            </div>

            {/* Updates Section */}
            <div id="updates" className="border-t border-slate-200/80 bg-[#f7fbff]">
                <SchoolUpdatesSection franchiseSlug={franchise.slug} />
            </div>

            {/* Classes Section - Component has internal id="programs" */}
            <div className="border-t border-slate-200/80 bg-[#f9fff7]">
                <SchoolProgramsSection />
            </div>

            {/* Admissions Section - Component has internal id="admission" */}
            <div className="border-t border-slate-200/80 bg-[#fff9f2]">
                <AdmissionSection
                    franchiseSlug={franchise.slug}
                    city={franchise.city}
                    contactPhone={franchise.contact_phone}
                />
            </div>

            {/* Media / Gallery Section - Component has internal id="gallery" */}
            <div className="border-t border-slate-200/80 bg-[#f8f7ff]">
                <GallerySection
                    schoolName={franchise.name}
                    city={franchise.city}
                    events={franchise.events}
                    galleryItems={franchise.gallery_items}
                />
            </div>

            {/* Contact Section - Component has internal id="contact" */}
            <div className="border-t border-slate-200/80 bg-[#f7fcff]">
                <ContactSection
                    school={franchise}
                    franchiseSlug={franchise.slug}
                />
            </div>
        </main>
    );
}
