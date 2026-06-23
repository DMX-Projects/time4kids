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

/**
 * Carto Voyager — Roman-script labels (no Hindi/Telugu subtitles on Indian maps).
 * Use for single-location maps (franchise office) where Esri shows bilingual labels.
 */
export const MAP_TILE_LATIN_LABELS = {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
} as const;

/** Legacy OSM tiles (local-language labels) — kept for reference only. */
export const MAP_TILE_OSM = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;
