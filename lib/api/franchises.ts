
import { SERVER_URL } from '../api-client';

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
    events: {
        id: number;
        title: string;
        description: string;
        start_date: string;
        year: number;
        media: {
            id: number;
            file: string;
            media_type: 'IMAGE' | 'VIDEO';
            caption: string;
        }[];
    }[];
}

export async function getFranchiseBySlug(slug: string): Promise<Franchise | null> {
    try {
        const url = `${SERVER_URL}/api/franchises/public/${slug}/`;
        console.log(`[SSR] Fetching franchise from: ${url}`);

        const res = await fetch(url, {
            cache: 'no-store', // Always fetch fresh data
        });

        if (!res.ok) {
            console.error(`[SSR] API Error: ${res.status} ${res.statusText} for URL: ${url}`);
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch franchise: ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`[SSR] Successfully fetched franchise: ${data.name}`);
        return data;
    } catch (error) {
        console.error("[SSR] Connection Error fetching franchise:", error);
        return null;
    }
}
