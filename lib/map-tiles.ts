/**
 * Shared Leaflet basemap — labels in English (Roman script) where possible.
 *
 * Standard OSM tiles (`tile.openstreetmap.org`) show local scripts in Pakistan,
 * China, Thailand, etc. Esri World Street Map is used for readable English labels
 * in the corners when the map is zoomed to show all of India.
 */

export const MAP_TILE_ENGLISH = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
        '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: Esri, Garmin, USGS, GeoNames, OpenStreetMap',
} as const;

/** Legacy OSM tiles (local-language labels) — kept for reference only. */
export const MAP_TILE_OSM = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;
