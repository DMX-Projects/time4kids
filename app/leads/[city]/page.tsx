import LandingLeadsReport from "@/components/leads/LandingLeadsReport";

export default function CityLandingLeadsPage({ params }: { params: { city: string } }) {
    const citySlug = decodeURIComponent(params.city);
    const label = citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <LandingLeadsReport
            citySlug={citySlug}
            title={`${label} — landing leads`}
        />
    );
}
