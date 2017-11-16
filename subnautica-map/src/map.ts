
import * as L from "leaflet";
import * as $ from "jquery";
import * as _ from "lodash";
import LatLng = L.LatLng;
import LayersObject = L.Control.LayersObject;
// import Layer = L.Layer;
import LayerGroup = L.LayerGroup;

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
const layerPings       = L.layerGroup([]).addTo(mymap);


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

mymap.on("mousemove", (ev: L.MouseEvent) => { $("#position").text(toCoordString(ev.latlng)) });

interface IPlayerInfo {
  Biome:string,
  X:number,
  Y:number,
  Z:number
}


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
  $("#player-position").text(`Biome: ${data.Biome} | ${toCoordString(posLatLng, data.Z)}`);
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

interface IPingInfo {
  Label: string,
  Color: number,
  X: number,
  Y: number,
  Z: number,
  Visible: boolean,
  Type: string
}

function SetPingInfo (data :IPingInfo[]) {
  for (let ping of data) {

    // if (!ping.Visible) { continue; }

    let markerOpts: L.MarkerOptions = {
      title: ping.Label
    };

    let icon = "";

    switch (ping.Type) {
      case "Lifepod":
        icon = "lifepod_5_transparent.png";
        break;
      case "Signal":
        icon = "signal_ping.png";
        break;
      case "Beacon":
        icon = "beacon.png";
        break;
      case "MapRoomCamera":
        icon = "camera_drone.png";
        break;
      case "Cyclops":
        icon = "cyclops.png";
        break;
      case "Seamoth":
        icon = "seamoth.png";
        break;
      case "Exosuit":
        icon = "exosuit.png";
        break;
      default:
        icon = "signal_ping.png";
    }

    if (icon) {
      markerOpts.icon = new L.Icon({
                                     iconUrl   : `data/${icon}`,
                                     iconSize  : [48, 48],
                                     iconAnchor: [16, 16]
                                   });
    }

    let marker = L.marker(L.latLng(ping.Y, ping.X), markerOpts);
    layerPings.addLayer(marker);
  }
}

function CheckPingInfo() {
  $.getJSON("/?PingInfo=").done((data: IPingInfo[]) => {
    layerPings.clearLayers();
    SetPingInfo(data);
  });
}


setInterval(() => CheckPlayerInfo(), 1000);
setInterval(() => CheckPingInfo(), 2000);
