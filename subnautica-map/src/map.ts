import * as L from "leaflet";
import * as $ from "jquery";

import PingManager from "./ping-manager";
import { ToCoordString } from "./utilities";
import PlayerManager from "./player-manager";
import TimeManager from "./time-manager";
import WikiDataManager from "./wiki-data-manager";

const mymap = L.map('mapid', {
  crs               : L.CRS.Simple,
  minZoom           : -3,
  zoomSnap          : 0.25,
  zoomDelta         : 0.25,
  attributionControl: false
});

(Window as any).mymap = mymap;

L.control.attribution({
                        position: "bottomright",
                        prefix  : "<a href='http://leafletjs.com/' target='_blank'>Leaflet</a>"
                      })
  .addAttribution('Data &amp; Maps: <a href="http://subnautica.wikia.com/wiki/Mapping_Subnautica"' +
                  ' target="_blank">Subnautica Wiki Contributors</a>')
  .addAttribution('Icons: <a href="http://www.freepik.com" title="Freepik" target="_blank">Freepik</a> from <a' +
                  ' href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>, licensed by <a' +
                  ' href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>')
  .addAttribution('<a href="https://github.com/MartinSGill/SubnauticaWatcher" target="_blank">Source Code</a>')
  .addTo(mymap);

// The Base Maps
const bounds: L.BoundsExpression = [[-2000, -2000], [2000, 2000]];
const layerEmpty                 = L.imageOverlay('data/black.png', bounds).addTo(mymap);
const layerBiomeImage            = L.imageOverlay('data/BiomeMap_1024_new_May192017.png', bounds).addTo(mymap);
const layerInactiveLavaZoneImage = L.imageOverlay('data/ilz_map_transparent.png', bounds);
const layerLostRiverImage        = L.imageOverlay('data/lost_river_transparent.png', bounds);
const layerOutlineImage          = L.imageOverlay('data/SNmapClean_cropped_transparent.png', bounds).addTo(mymap);

const baseMaps = {
  "None"              : layerEmpty,
  "Biomes"            : layerBiomeImage,
  "Lost River"        : layerLostRiverImage,
  "Inactive Lave Zone": layerInactiveLavaZoneImage
};


// Reset the view to something sensible
mymap.fitBounds(bounds);
mymap.setView([0, 0], -1);

// Layer Managers
const pingManager = new PingManager(mymap);
const playerManager = new PlayerManager(mymap);
const timeManager = new TimeManager();
const wikiDataManager = new WikiDataManager(mymap);

// The marker layers
const layerThermals    = wikiDataManager.layerThermals;
const layerGeysers     = wikiDataManager.layerGeysers;
const layerWrecks      = wikiDataManager.layerWrecks;
const layerLifepods    = wikiDataManager.layerLifepods;
const layerSeabases    = wikiDataManager.layerSeabases;
const layerCaves       = wikiDataManager.layerCaves;
const layerTransitions = wikiDataManager.layerTransitions;
const layerAlien       = wikiDataManager.layerAlien;
const layerOther       = wikiDataManager.layerOther;
const layerPlayer      = playerManager.mapLayer;
const layerPings       = pingManager.mapLayer;

let overlays: L.Control.LayersObject = {
  "Outline"      : layerOutlineImage,
  "Thermal Vents": layerThermals,
  "Lava Geyser"  : layerGeysers,
  "Wrecks"       : layerWrecks,
  "Lifepods"     : layerLifepods,
  "Seabases"     : layerSeabases,
  "Caves"        : layerCaves,
  "Transitions"  : layerTransitions,
  "Precursor"    : layerAlien,
  "Miscellaneous": layerOther,
  "Player"       : layerPlayer,
  "Pings"        : layerPings
};

// Add base layers and overlay
L.control.layers(baseMaps, overlays).addTo(mymap);

// Add a scale measure to the map.
L.control.scale({maxWidth: 500, metric: true, imperial: false, position: "bottomleft"}).addTo(mymap);

// Default Most layers to off.
layerThermals.remove();
layerGeysers.remove();
layerWrecks.remove();
layerLifepods.remove();
layerSeabases.remove();
layerCaves.remove();
layerTransitions.remove();
layerAlien.remove();
layerOther.remove();

// Mouse Coordinate Display
mymap.on("mousemove", (ev: L.LeafletMouseEvent) => { $("#position").text(ToCoordString(ev.latlng)) });

// Updating Game Data
setInterval(() => playerManager.UpdateTrigger(), 1000);
setInterval(() => pingManager.UpdateTrigger(), 2000);
setInterval(() => timeManager.UpdateTrigger(), 5000);
