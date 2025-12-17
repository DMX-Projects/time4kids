export interface Centre {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    phone: string;
    email?: string;
    lat?: number;
    lng?: number;
}

export const centres: Centre[] = [
    // Bengaluru Data
    {
        id: 101,
        name: 'Balagere',
        address: 'Survey No: 18/2 & 19, Devasthanagalu, Balagere Road, Opposite Eon Ecolife Akash, Varthur Hobli',
        city: 'Bengaluru (Bangalore)',
        state: 'Karnataka',
        pincode: '560 087',
        phone: '+91 7676602098',
        email: 'balagere@timekidspreschools.com'
    },
    {
        id: 102,
        name: 'Banashanakri 3rd stage',
        address: 'Sri Lakahminarayana Krupa, No.787, 1st Main, 7th Block, Banashankari 3rd Stage, 2nd Phase',
        city: 'Bengaluru (Bangalore)',
        state: 'Karnataka',
        pincode: '560 085',
        phone: '+91 9886021587',
        email: 'bsk3rdstage@timekidspreschools.com'
    },
    {
        id: 103,
        name: 'Banashanakri 5th stage',
        address: '#491, Shambavi, 10th Cross Road, Vaddarapalya, Banashanakri 5th Stage',
        city: 'Bengaluru (Bangalore)',
        state: 'Karnataka',
        pincode: '560 061',
        phone: '+91 9632555004, +91 9962912121',
        email: 'banashankari5thstage@timekidspreschools.com'
    },
    // Other Centres
    {
        id: 1,
        name: 'T.I.M.E. Kids - Banjara Hills',
        address: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 1234 5678',
    },
    {
        id: 2,
        name: 'T.I.M.E. Kids - Jubilee Hills',
        address: 'Road No. 45, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 2345 6789',
    },
    {
        id: 5,
        name: 'T.I.M.E. Kids - Anna Nagar',
        address: '2nd Avenue, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        phone: '+91 44 5678 9012',
    },
    {
        id: 6,
        name: 'T.I.M.E. Kids - Velachery',
        address: 'Main Road, Velachery',
        city: 'Chennai',
        state: 'Tamil Nadu',
        phone: '+91 44 6789 0123',
    },
    {
        id: 7,
        name: 'T.I.M.E. Kids - Koregaon Park',
        address: 'North Main Road, Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '+91 20 7890 1234',
    },
    {
        id: 8,
        name: 'T.I.M.E. Kids - Satellite',
        address: 'Satellite Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        phone: '+91 79 8901 2345',
    },
    // Belgaum Data
    {
        id: 201,
        name: 'Bhagya Nagar',
        address: 'CTS No.3356 Plot No.705, 6th Cross, Bhagyanagar, Belagavi - 590 006',
        city: 'Belgaum',
        state: 'Karnataka',
        phone: '+91 9902918979, +91 9844075348',
        email: 'belgaum@timekidspreschools.com'
    },
    // Hooghly Data
    {
        id: 301,
        name: 'Baidyabati',
        address: '562, R. B. S. Road, Vivekanand Market, Champdani, Ward No. 05, P.O. Baidyabati, Dist. Hoogly - 712 222',
        city: 'Hooghly',
        state: 'West Bengal',
        phone: 'Contact for details',
        email: 'baidyabati@timekidspreschools.com'
    },
    // Kolkata Data
    {
        id: 401,
        name: 'Action Area 1 - New Town',
        address: '1st floor, AB36, Street No. 89, New Town, Action Area 1, Kolkata - 700 156',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91 8777614874, +91 8334056830',
        email: 'newtown1@timekidspreschools.com'
    },
    {
        id: 402,
        name: 'Baguiati',
        address: 'E B/5, Asha Lata Apartment, Baguiati Main Road, Deshbandhu Nagar, Kolkata - 700 059',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91 9007530180, +91 9339531850',
        email: 'baguiati@timekidspreschools.com'
    },
    {
        id: 403,
        name: 'Birati',
        address: '5, Mahajati Nagar, Birati, Bidhan Market, Kolkata - 700 081',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91 8583930491, +91 9831187857',
        email: 'birati@timekidspreschools.com'
    },
    {
        id: 404,
        name: 'Khardaha',
        address: '18 Old Calcutta Road, Khardaha, Rahar Bazar, Kolkata - 700 118',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91 9593025358, +91 9830371148',
        email: 'khardaha@timekidspreschools.com'
    },
    {
        id: 405,
        name: 'Shyamnagar Road',
        address: '490/3, Shyamnagar Road, South Dumdum, Bangur Avenue, Kolkata - 700 055',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91 6293803694, +91 9836245533',
        email: 'shyamnagarrd@timekidspreschools.com'
    }
];
