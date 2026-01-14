
export interface Franchise {
    id: number;
    name: string;
    slug: string;
    about: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    contact_email: string;
    contact_phone: string;
    google_map_link: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    linkedin_url: string;
    youtube_url: string;
    hero_image: string | null;
    programs: string;
    facilities: string;
    is_active: boolean;
    hero_slides: {
        id: number;
        image: string;
        alt_text: string;
        link: string;
        order: number;
    }[];
    gallery_items: {
        id: number;
        media_type: 'photo' | 'video';
        title: string;
        image: string;
        video_link: string;
        academic_year: string;
        event_category: string;
        created_at: string;
    }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getFranchiseBySlug(slug: string): Promise<Franchise | null> {
    try {
        const res = await fetch(`${API_URL}/api/franchises/public/${slug}/`, {
            cache: 'no-store', // Always fetch fresh data
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch franchise: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching franchise:", error);
        return null;
    }
}
