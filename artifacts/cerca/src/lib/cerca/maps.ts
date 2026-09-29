/**
 * Public map tiles: the official OpenStreetMap raster service.
 * Fine for this preview. Do not cache tiles or hammer the service.
 * A production deployment with real traffic should move to a dedicated
 * tile host. Do not switch this back to CARTO: that host asks for an API key.
 */
export type MapTileProvider = {
  id: "openstreetmap";
  url: string;
  attribution: string;
  maxZoom: number;
};

export const openStreetMap: MapTileProvider = {
  id: "openstreetmap",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

export function activeMapTiles(): MapTileProvider {
  return openStreetMap;
}
