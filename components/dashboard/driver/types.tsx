export type RouteInfo = {
    id: number;
    route_name: string;
    description?: string;
    vehicle_number?: string;
    driver_name?: string;
    driver_phone?: string;
    destination?: string;
};

export type ActiveTrip = {
    id: number;
    trip_type: string;
    status: string;
    started_at?: string | null;
    latest_location?: {
        latitude: string;
        longitude: string;
        recorded_at: string;
    } | null;
};

export type AssignedStudent = {
    assignment_id: number;
    student_id: number;
    student_name: string;
    class_name?: string;
    pickup_stop?: string;
    drop_stop?: string;
    pickup_time?: string | null;
    drop_time?: string | null;
    status: "WAITING" | "PICKED_UP" | "DROPPED" | "ABSENT";
    status_note?: string;
};
