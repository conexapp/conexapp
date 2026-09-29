//#region node_modules/.nitro/vite/services/ssr/assets/maps-PjfEszOE.js
var openStreetMap = {
	id: "openstreetmap",
	url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
	maxZoom: 19
};
function activeMapTiles() {
	return openStreetMap;
}
//#endregion
export { activeMapTiles as t };
