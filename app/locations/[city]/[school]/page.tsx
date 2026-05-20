import { notFound } from 'next/navigation';
import { getFranchiseBySlug } from '@/lib/api/franchises';
import { fetchGlobalCentreProgramCards, mergeCentreProgramCards } from '@/lib/centre-program-cards';
import SchoolIntroSection from '@/components/school/home/SchoolIntroSection';
import SchoolProgramsSection from '@/components/school/SchoolProgramsSection';
import GallerySection from '@/components/school/GallerySection';
import ContactSection from '@/components/school/ContactSection';
import SchoolUpdatesSection from '@/components/school/SchoolUpdatesSection';

interface PageProps {
    params: {
        city: string;
        school: string;
    };
}

/** Always load events/gallery from Django on each request (no static cache of centre data). */
export const dynamic = "force-dynamic";

export default async function SchoolPage({ params }: PageProps) {
    const { school, city: cityParam } = params;

    let urlCityFallback = cityParam;
    try {
        urlCityFallback = decodeURIComponent(cityParam.replace(/\+/g, " "));
    } catch {
        /* keep raw segment */
    }

    const [franchise, globalProgramCards] = await Promise.all([
        getFranchiseBySlug(school),
        fetchGlobalCentreProgramCards(),
    ]);

    if (!franchise) {
        notFound();
    }

    const programCards = mergeCentreProgramCards(globalProgramCards, franchise.school_program_cards);

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="bg-[#fffaf0]">
                <SchoolIntroSection
                    schoolName={franchise.name}
                    about={franchise.about}
                    city={franchise.city}
                    state={franchise.state}
                    urlCityFallback={urlCityFallback}
                />
            </div>

            {/* Contact — second */}
            <div className="border-t border-slate-200/80 bg-[#f7fcff]">
                <ContactSection
                    school={franchise}
                    franchiseSlug={franchise.slug}
                    urlCityFallback={urlCityFallback}
                />
            </div>

            {/* Our Classes — third (internal id="programs") */}
            <div className="border-t border-slate-200/80 bg-[#f9fff7]">
                <SchoolProgramsSection selectedPrograms={franchise.programs} programCards={programCards} />
            </div>

            {/* Updates Section */}
            <div id="updates" className="border-t border-slate-200/80 bg-[#f7fbff]">
                <SchoolUpdatesSection franchiseSlug={franchise.slug} />
            </div>

            {/* Last main section — “Life at [centre]” gallery */}
            <div className="border-t border-slate-200/80 bg-[#f8f7ff]">
                <GallerySection
                    schoolName={franchise.name}
                    city={franchise.city}
                    state={franchise.state}
                    urlCityFallback={urlCityFallback}
                    events={franchise.events}
                    galleryItems={franchise.gallery_items}
                />
            </div>
        </main>
    );
}
