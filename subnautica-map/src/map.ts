
import * as L from "leaflet";
import * as $ from "jquery";
import * as _ from "lodash";
import LatLng = L.LatLng;
import LayersObject = L.Control.LayersObject;
import LayerGroup = L.LayerGroup;
import { Map, IPlayerInfo, IPingInfo, IDayNightInfo } from "./interfaces";
import PingManager from "./ping-manager";

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

type CoordinatesFormat = 'game' | 'map';
let coordFormat: CoordinatesFormat = 'game';

function toCoordString(position: LatLng, depth: number = 0) {
  if (coordFormat === 'game') {
    return `${Math.round(position.lng)}, ${depth}, ${Math.round(position.lat)}`
  } else {
    return `${Math.round(position.lng)}, ${Math.round(position.lat)}, ${depth}`
  }
}

// Reset the view to something sensible
mymap.fitBounds(bounds);
mymap.setView([0, 0], -1);

// Layer Managers
const pingManager = new PingManager(mymap);


// The marker layers
const layerThermals    = L.layerGroup([]).addTo(mymap);
const layerGeysers     = L.layerGroup([]).addTo(mymap);
const layerWrecks      = L.layerGroup([]).addTo(mymap);
const layerLifepods    = L.layerGroup([]).addTo(mymap);
const layerSeabases    = L.layerGroup([]).addTo(mymap);
const layerCaves       = L.layerGroup([]).addTo(mymap);
const layerTransitions = L.layerGroup([]).addTo(mymap);
const layerAlien       = L.layerGroup([]).addTo(mymap);
const layerOther       = L.layerGroup([]).addTo(mymap);
const layerPlayer      = L.layerGroup([]).addTo(mymap);
const layerPings       = pingManager.mapLayer;


function markerIconName(type: string): string {
  switch (type) {
    case 'ThermalVent':
      return "thermometer.png";
    case 'LavaGeyser':
      return "fountain.png";
    case 'Wrecks':
      return "wrecking-ball.png";
    case 'Lifepods':
      return "sos.png";
    case 'Seabases':
      return "house.png";
    case 'Caves':
      return "cave.png";
    case 'Precursor':
      return "alien.png";
    case 'Transition':
      return "lift.png";
    case 'Other':
      return "question.png";

    default:
      return "question.png"
  }
}

$.getJSON("data/wiki_map_locations.json").done((data) => {
  _(data)
    .groupBy((l: any) => l.RawCategory)
    .forEach((item: any, key: any) => {
      if (!/biome/im.test(key)) {
        _.forEach(item, (obj) => {
                    let icon: string      = markerIconName(obj.Type);
                    let layer: LayerGroup = layerOther;
                    if (/Thermal Vents/im.test(obj.RawComment)) {
                      layer = layerThermals;
                    } else if (/Lava Geyser/im.test(obj.RawComment)) {
                      layer = layerGeysers;
                    } else if (/wreck/im.test(obj.RawComment)) {
                      layer = layerWrecks;
                    } else if (/lifepod/im.test(obj.RawComment)) {
                      layer = layerLifepods;
                    } else if (/seabase/im.test(obj.RawComment)) {
                      layer = layerSeabases;
                    } else if (/cave/im.test(obj.RawComment)) {
                      layer = layerCaves;
                    } else if (/precursor/im.test(obj.RawCategory)) {
                      layer = layerAlien;
                    } else if (/minor/im.test(obj.RawCategory)) {
                      layer = layerOther;
                    }

                    let biome                       = _(obj.Biome).join(', ');
                    let markerOpts: L.MarkerOptions = {
                      title: obj.RawComment
                    };

                    if (icon) {
                      markerOpts.icon = new L.Icon({
                                                     iconUrl   : `data/${icon}`,
                                                     iconSize  : [32, 32],
                                                     iconAnchor: [16, 16]
                                                   });
                    }

                    let marker = L.marker(L.latLng(obj.Y, obj.X), markerOpts).bindPopup(
                      `
  <div class="mdl-card__title mdl-color--teal">
      <h4 class="mdl-card__title-text mdl-color-text--white"><i class="material-icons font-size-28 mdl-color-text--white">info&nbsp;&nbsp;</i>Details</h4>
   </div>
  <div class="mdl-card__supporting-text mdl-card--border">
     <span>${key}</span>
  </div>
  <div class="mdl-card__supporting-text mdl-card--border">
     <span class="">${obj.RawComment}</span>
  </div>
  <div class="mdl-card__supporting-text mdl-card--border">
     <span class="">Biome: ${biome}</span>
  </div>
  <div class="mdl-card__supporting-text mdl-card--border">
     <span class="">Depth:&nbsp;</span><span>${obj.Z}</span>
</div>`, {
                        className  : "mdl-card",
                        closeButton: false,
                        minWidth   : 350,
                        maxWidth   : 500,
                        offset     : L.point(0, 15)
                      }
                    );

                    layer.addLayer(marker);
                  }
        );
      }
    })
});

let overlays: LayersObject = {
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

L.control.layers(baseMaps, overlays).addTo(mymap);
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


mymap.on("mousemove", (ev: L.LeafletMouseEvent) => { $("#position").text(toCoordString(ev.latlng)) });

let diverMarkerOpts: L.MarkerOptions = {
  title: "Player",
  riseOnHover: true,
  zIndexOffset: 1000
};

diverMarkerOpts.icon = new L.Icon({
                               iconUrl   : `data/diver.png`,
                               iconSize  : [32, 32],
                               iconAnchor: [16, 16]
                             });

let diverMarker = L.marker(L.latLng(0, 0), diverMarkerOpts);
layerPlayer.addLayer(diverMarker);

function SetPlayerInfo(data : IPlayerInfo) {
  const posLatLng = L.latLng(data.Y, data.X);
  
  // Make biome string more readable.
  let biome = _.startCase(data.Biome);

  $("#player-position").text(`Biome: ${biome} | ${toCoordString(posLatLng, data.Z)}`);
  diverMarker.setLatLng(posLatLng);

  if (($("#follow-player")[0] as HTMLInputElement).checked === true) {
    mymap.panTo(posLatLng);
  }
}

function CheckPlayerInfo() {
  $.getJSON("/?PlayerInfo=").done((data: IPlayerInfo) => {
    SetPlayerInfo(data);
  });
}

function ToFuzzyTime(time:number): string {
  // 0 is midnight
  // 0.5 is noon

  if (time < 0.05) return "Around Midnight";
  if (time < 0.2)  return "After Midnight";
  if (time < 0.3)  return "Early Morning";
  if (time < 0.45) return "Morning";
  if (time < 0.55) return "Around Noon";
  if (time < 0.75) return "Afternoon";
  if (time < 0.8)  return "Evening";
  if (time < 0.95) return "Night";

  return "Around Midnight";
}

function SetGameTimeCycle(time: number, days: number) {
  const angle = time * 360;
  ($("#day-night-image")[0] as HTMLImageElement).src = 'data/day-night-wheel.png';
  $("#day-night-image").css('transform', 'rotate(-' + angle + 'deg)');
  $("#day-night-image").css('visibility', 'visible');
  $("#day-night-tooltip")[0].innerHTML = ToFuzzyTime(time) +  "<br/>Day " + Math.floor(days);
}

function CheckGameTime() {
  $.getJSON("/?DayNightInfo=").done((data: IDayNightInfo) => {
    SetGameTimeCycle(data.DayScalar, data.Day);
  });
}

setInterval(() => CheckPlayerInfo(), 1000);
setInterval(() => pingManager.UpdateTrigger(), 2000);
setInterval(() => CheckGameTime(), 5000);
