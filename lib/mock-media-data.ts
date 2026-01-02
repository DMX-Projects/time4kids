
export interface MediaItem {
    id: number;
    type: 'image' | 'video';
    src: string;
    title: string;
    category: string;
    size?: 'large' | 'normal' | 'wide' | 'tall'; // For Masonry layout hints
    thumb?: string; // Poster image for videos
}

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
    // Featured Videos
    {
        id: 101,
        type: 'video',
        src: '/chaninai kilpauk-AnnualDay-Video-2018-19.mp4',
        title: 'Annual Day Celebration 2018-19',
        category: 'Events',
        size: 'wide',
        thumb: '/images/event-1.jpg' // Using event image as poster to fix black screen
    },
    {
        id: 102,
        type: 'video',
        src: '/chennai2.mp4',
        title: 'Campus Tour Highlights',
        category: 'Campus',
        size: 'wide',
        thumb: '/images/event-3.jpg'
    },

    // Event Highlights
    { id: 1, type: 'image', src: '/images/event-1.jpg', title: 'Annual Sports Meet', category: 'Events', size: 'normal' },
    { id: 2, type: 'image', src: '/images/event-2.jpg', title: 'Cultural Fest', category: 'Events', size: 'tall' },
    { id: 3, type: 'image', src: '/images/event-3.jpg', title: 'Group Smiles', category: 'Events', size: 'normal' },
    { id: 4, type: 'image', src: '/images/event-4.jpg', title: 'Graduation Day', category: 'Events', size: 'wide' },

    // Classroom & Activities
    { id: 5, type: 'image', src: '/5.jpeg', title: 'Interactive Learning', category: 'Classroom', size: 'tall' },
    { id: 6, type: 'image', src: '/8.png', title: 'Art & Craft Session', category: 'Activities', size: 'normal' },
    { id: 7, type: 'image', src: '/9.png', title: 'Reading Time', category: 'Classroom', size: 'normal' },
    { id: 8, type: 'image', src: '/10.png', title: 'Play Area Fun', category: 'Activities', size: 'tall' },
    { id: 9, type: 'image', src: '/14.png', title: 'Creative Workshop', category: 'Activities', size: 'normal' },
    { id: 10, type: 'image', src: '/15.png', title: 'Outdoor Games', category: 'Activities', size: 'wide' },

    // More Moments
    { id: 11, type: 'image', src: '/17.png', title: 'Storytelling Circle', category: 'Classroom', size: 'normal' },
    { id: 12, type: 'image', src: '/18.png', title: 'Music & Dance', category: 'Events', size: 'normal' },
    { id: 13, type: 'image', src: '/19.png', title: 'Festival Joy', category: 'Events', size: 'tall' },
    { id: 14, type: 'image', src: '/20.png', title: 'Building Blocks', category: 'Activities', size: 'normal' },
    { id: 15, type: 'image', src: '/21.png', title: 'Team Activities', category: 'Classroom', size: 'wide' },
    { id: 16, type: 'image', src: '/25.png', title: 'School Premises', category: 'Campus', size: 'tall' },

    // High Res / Special
    { id: 17, type: 'image', src: '/24@2x.png', title: 'Little Graduates', category: 'Events', size: 'normal' },
    { id: 18, type: 'image', src: '/5@2x.png', title: 'Focus & Fun', category: 'Classroom', size: 'normal' },
];
