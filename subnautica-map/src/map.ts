import * as L from "leaflet";
import * as $ from "jquery";

import PingManager from "./ping-manager";
import { ToCoordString } from "./utilities";
import PlayerManager from "./player-manager";
import TimeManager from "./time-manager";
import WikiDataManager from "./wiki-data-manager";
import BaseLayerManager from "./base-layer-manager";
import ConnectionMonitor from "./connection-monitor";

// Create the map
const theMap = L.map('mapid', {
  crs               : L.CRS.Simple,
  minZoom           : -3,
  zoomSnap          : 0.25,
  zoomDelta         : 0.25,
  attributionControl: false
});

// Define the world size
const bounds: L.BoundsExpression     = [[-2000, -2000], [2000, 2000]];

// Connection Monitor
const connectionMonitor = new ConnectionMonitor();

// Layer Managers
const baseLayerManager = new BaseLayerManager(theMap, bounds);
const pingManager = new PingManager(theMap, connectionMonitor);
const playerManager = new PlayerManager(theMap, connectionMonitor);
const timeManager = new TimeManager(connectionMonitor);
const wikiDataManager = new WikiDataManager(theMap);

// The POI layers
const poiLayerOutlineImage= L.imageOverlay('data/SNmapClean_cropped_transparent.png', bounds).addTo(theMap);
const poiLayerThermals    = wikiDataManager.layerThermals;
const poiLayerGeysers     = wikiDataManager.layerGeysers;
const poiLayerWrecks      = wikiDataManager.layerWrecks;
const poiLayerLifepods    = wikiDataManager.layerLifepods;
const poiLayerSeabases    = wikiDataManager.layerSeabases;
const poiLayerCaves       = wikiDataManager.layerCaves;
const poiLayerTransitions = wikiDataManager.layerTransitions;
const poiLayerAlien       = wikiDataManager.layerAlien;
const poiLayerLeviathans  = wikiDataManager.layerLeviathans;
const poiLayerOther       = wikiDataManager.layerOther;
const poiLayerPlayer      = playerManager.mapLayer;
const poiLayerPings       = pingManager.mapLayer;

let overlays: L.Control.LayersObject = {
  "Outline"      : poiLayerOutlineImage,
  "Thermal Vents": poiLayerThermals,
  "Lava Geyser"  : poiLayerGeysers,
  "Wrecks"       : poiLayerWrecks,
  "Lifepods"     : poiLayerLifepods,
  "Seabases"     : poiLayerSeabases,
  "Caves"        : poiLayerCaves,
  "Transitions"  : poiLayerTransitions,
  "Precursor"    : poiLayerAlien,
  "Leviathans"   : poiLayerLeviathans,
  "Miscellaneous": poiLayerOther,
  "Player"       : poiLayerPlayer,
  "Pings"        : poiLayerPings
};

// Add base layers and overlay
L.control.layers(baseLayerManager.baseLayers, overlays).addTo(theMap);

// Default Most layers to off.
poiLayerThermals.remove();
poiLayerGeysers.remove();
poiLayerWrecks.remove();
poiLayerLifepods.remove();
poiLayerSeabases.remove();
poiLayerCaves.remove();
poiLayerTransitions.remove();
poiLayerAlien.remove();
poiLayerLeviathans.remove();
poiLayerOther.remove();

// Credit where credit is due
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
  .addTo(theMap);

// Mouse Coordinate Display
theMap.on("mousemove", (ev: L.LeafletMouseEvent) => { $("#position").text(ToCoordString(ev.latlng)) });

// Add a scale measure to the map.
L.control.scale({maxWidth: 500, metric: true, imperial: false, position: "bottomleft"}).addTo(theMap);

// Reset the view to something sensible
theMap.fitBounds(bounds);
theMap.setView([0, 0], -1);

// Updating Game Data
setInterval(() => playerManager.UpdateTrigger(), 1000);
setInterval(() => pingManager.UpdateTrigger(), 2000);
setInterval(() => timeManager.UpdateTrigger(), 5000);

////////////////////////////////////////////////////////////////////////////
// Debugging
////////////////////////////////////////////////////////////////////////////
// Make the map accessible from the browser console for debugging purposes.
(Window as any).theMap = theMap;
// Allow me to inject the biome
(Window as any).setBiome = (biome:string) => { baseLayerManager.SetBaseLayerFromBiome(biome) };
////////////////////////////////////////////////////////////////////////////
