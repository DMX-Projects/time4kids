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
    {
        id: 1,
        name: "Vinayak Nagar",
        address: "Plot No. 12, Vinayak Nagar, Hyderabad, Telangana 500032",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500032",
        phone: "+91 98765 43210",
        email: "vinayaknagar@timekidspreschools.com",
        lat: 17.45,
        lng: 78.38
    },
    {
        id: 2,
        name: "Jubilee Hills",
        address: "Road No. 45, Jubilee Hills, Hyderabad, Telangana 500033",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500033",
        phone: "+91 98765 43211",
        email: "jubileehills@timekidspreschools.com"
    },
    {
        id: 3,
        name: "Banjara Hills",
        address: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500034",
        phone: "+91 98765 43212",
        email: "banjarahills@timekidspreschools.com"
    },
    {
        id: 4,
        name: "Koramangala",
        address: "80 Feet Road, Koramangala, Bangalore, Karnataka 560034",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560034",
        phone: "+91 98765 43213",
        email: "koramangala@timekidspreschools.com"
    }
];
