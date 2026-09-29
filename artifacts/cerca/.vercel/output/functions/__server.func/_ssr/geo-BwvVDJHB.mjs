//#region node_modules/.nitro/vite/services/ssr/assets/geo-BwvVDJHB.js
var ROSARIO = {
	lat: -32.944242,
	lng: -60.650539
};
/** Bounding box used to reject points outside the Rosario operating area. */
var ROSARIO_BOUNDS = {
	minLat: -33.2,
	maxLat: -32.7,
	minLng: -60.9,
	maxLng: -60.4
};
function insideRosario(lat, lng) {
	return Number.isFinite(lat) && Number.isFinite(lng) && lat >= ROSARIO_BOUNDS.minLat && lat <= ROSARIO_BOUNDS.maxLat && lng >= ROSARIO_BOUNDS.minLng && lng <= ROSARIO_BOUNDS.maxLng;
}
/**
* Public pin. "approximate" is the center of the ~1.1 km cell that contains
* the stored point. It is not a new place and it is not the exact coordinate.
*/
function publicCoordinate(lat, lng, visibility) {
	if (visibility !== "approximate") return {
		lat,
		lng
	};
	const step = .01;
	return {
		lat: Math.floor(lat / step) * step + step / 2,
		lng: Math.floor(lng / step) * step + step / 2
	};
}
/** Keep Nominatim rows that fall inside Rosario. Anything else is discarded. */
function nominatimHitsInRosario(rows) {
	if (!Array.isArray(rows)) return [];
	const hits = [];
	for (const row of rows) {
		if (!row || typeof row !== "object") continue;
		const record = row;
		const lat = Number(record.lat);
		const lng = Number(record.lon);
		const label = typeof record.display_name === "string" ? record.display_name.trim() : "";
		if (!label || !insideRosario(lat, lng)) continue;
		hits.push({
			label,
			lat,
			lng
		});
	}
	return hits;
}
function distanceKm(lat1, lng1, lat2, lng2) {
	const r = 6371;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLng = (lng2 - lng1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}
//#endregion
export { publicCoordinate as a, nominatimHitsInRosario as i, distanceKm as n, insideRosario as r, ROSARIO as t };
