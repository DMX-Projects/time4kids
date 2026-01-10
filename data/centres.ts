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

export const centres: Centre[] = [];
