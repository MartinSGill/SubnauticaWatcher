import * as L from "leaflet";
import * as _ from "lodash";
import * as $ from "jquery";
import { IWikiDataItem, HashMap } from "./interfaces";

export default class WikiDataManager {

  // The marker layers
  private readonly _gameMap: L.Map;
  private readonly _layerThermals: L.LayerGroup;
  private readonly _layerGeysers: L.LayerGroup;
  private readonly _layerWrecks: L.LayerGroup;
  private readonly _layerLifepods: L.LayerGroup;
  private readonly _layerSeabases: L.LayerGroup;
  private readonly _layerCaves: L.LayerGroup;
  private readonly _layerTransitions: L.LayerGroup;
  private readonly _layerAlien: L.LayerGroup;
  private readonly _layerLeviathans: L.LayerGroup;
  private readonly _layerOther: L.LayerGroup;

  get layerThermals(): L.LayerGroup {
    return this._layerThermals;
  }

  get layerGeysers(): L.LayerGroup {
    return this._layerGeysers;
  }

  get layerWrecks(): L.LayerGroup {
    return this._layerWrecks;
  }

  get layerLifepods(): L.LayerGroup {
    return this._layerLifepods;
  }

  get layerSeabases(): L.LayerGroup {
    return this._layerSeabases;
  }

  get layerCaves(): L.LayerGroup {
    return this._layerCaves;
  }

  get layerTransitions(): L.LayerGroup {
    return this._layerTransitions;
  }

  get layerAlien(): L.LayerGroup {
    return this._layerAlien;
  }

  get layerLeviathans(): L.LayerGroup {
    return this._layerLeviathans;
  }

  get layerOther(): L.LayerGroup {
    return this._layerOther;
  }

  private readonly _featureTypeToIconMap: HashMap<L.Icon> = {
    'ThermalVent': new L.Icon({
                                iconUrl   : `data/thermometer.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'LavaGeyser' : new L.Icon({
                                iconUrl   : `data/fountain.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Wrecks'     : new L.Icon({
                                iconUrl   : `data/wrecking-ball.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Lifepods'   : new L.Icon({
                                iconUrl   : `data/sos.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Seabases'   : new L.Icon({
                                iconUrl   : `data/house.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Caves'      : new L.Icon({
                                iconUrl   : `data/cave.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Precursor'  : new L.Icon({
                                iconUrl   : `data/alien.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Transition' : new L.Icon({
                                iconUrl   : `data/lift.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
    'Ghost'      : new L.Icon({
                                    iconUrl   : `data/ghost-leviathan.png`,
                                    iconSize  : [64, 64],
                                    iconAnchor: [16, 16]
                                  }),
    'Reaper'     : new L.Icon({
                                    iconUrl   : `data/reaper-leviathan.png`,
                                    iconSize  : [64, 64],
                                    iconAnchor: [16, 16]
                                  }),
    'Sea Dragon' : new L.Icon({
                           iconUrl   : `data/sea-dragon-leviathan.png`,
                           iconSize  : [64, 64],
                           iconAnchor: [16, 16]
                         }),
    'Other'      : new L.Icon({
                                iconUrl   : `data/question.png`,
                                iconSize  : [32, 32],
                                iconAnchor: [16, 16]
                              }),
  };

  public constructor(gameMap: L.Map) {
    this._gameMap          = gameMap;
    this._layerThermals    = L.layerGroup([]).addTo(this._gameMap);
    this._layerGeysers     = L.layerGroup([]).addTo(this._gameMap);
    this._layerWrecks      = L.layerGroup([]).addTo(this._gameMap);
    this._layerLifepods    = L.layerGroup([]).addTo(this._gameMap);
    this._layerSeabases    = L.layerGroup([]).addTo(this._gameMap);
    this._layerCaves       = L.layerGroup([]).addTo(this._gameMap);
    this._layerTransitions = L.layerGroup([]).addTo(this._gameMap);
    this._layerAlien       = L.layerGroup([]).addTo(this._gameMap);
    this._layerLeviathans  = L.layerGroup([]).addTo(this._gameMap);
    this._layerOther       = L.layerGroup([]).addTo(this._gameMap);
    this.LoadData();
  }

  private GetMarkerIcon(dataItem: IWikiDataItem): L.Icon {
      if (dataItem.Type === "Leviathan") {

        if (/reaper/im.test(dataItem.RawComment)) {
          return this._featureTypeToIconMap['Reaper']
        }

        if (/ghost/im.test(dataItem.RawComment)) {
          return this._featureTypeToIconMap['Ghost']
        }

        if (/dragon/im.test(dataItem.RawComment)) {
          return this._featureTypeToIconMap['Sea Dragon']
        }

        // Cannot ID leviathan, so use "other" icon
        return this._featureTypeToIconMap['Other'];
      }

    if (this._featureTypeToIconMap.hasOwnProperty(dataItem.Type)) {
      return this._featureTypeToIconMap[dataItem.Type];
    }

    // Unrecognised type, so use "other" icon
    return this._featureTypeToIconMap['Other'];
  }

  private GetMapLayer(dataItem: IWikiDataItem): L.LayerGroup {
    switch (dataItem.Type) {
      case "ThermalVent":
        return this._layerThermals;
      case "LavaGeyser":
        return this._layerGeysers;
      case "Wrecks":
        return this._layerWrecks;
      case "Lifepods":
        return this._layerLifepods;
      case "Seabases":
        return this._layerSeabases;
      case "Transition":
        return this._layerTransitions;
      case "Caves":
        return this._layerCaves;
      case "Precursor":
        return this._layerAlien;
      case "Leviathan":
        return this._layerLeviathans;
      case "Other":
        return this._layerOther;
      default:
        return this._layerOther;
    }
  }

  private CreateDataItem = (dataItem: IWikiDataItem, key: string): void => {
    let targetLayer                 = this.GetMapLayer(dataItem);
    let biome                       = _(dataItem.Biome).join(', ');
    let markerOpts: L.MarkerOptions = {
      title: dataItem.RawComment,
      icon : this.GetMarkerIcon(dataItem)
    };

    const popupContent = `
<div class="mdl-card__title mdl-color--teal">
    <h4 class="mdl-card__title-text mdl-color-text--white"><i class="material-icons font-size-28 mdl-color-text--white">info&nbsp;&nbsp;</i>Details</h4>
 </div>
 <!--<div class="mdl-card__supporting-text mdl-card--border">
   <span>${key}</span>
</div>
--><div class="mdl-card__supporting-text mdl-card--border">
   <span class="">${dataItem.RawComment}</span>
</div>
<div class="mdl-card__supporting-text mdl-card--border">
   <span class="">Biome: ${biome}</span>
</div>
<div class="mdl-card__supporting-text mdl-card--border">
   <span class="">Depth:&nbsp;</span><span>${dataItem.Z}</span>
</div>`;
    const popupOptions = {
      className  : "mdl-card",
      closeButton: false,
      minWidth   : 350,
      maxWidth   : 500,
      offset     : L.point(0, 15)
    };

    let marker = L.marker(L.latLng(dataItem.Y, dataItem.X), markerOpts).bindPopup(popupContent, popupOptions);
    targetLayer.addLayer(marker);
  };

  private LoadData() {
    $.getJSON("data/wiki_map_locations.json").done((data: IWikiDataItem[]) => {
      _(data)
        .groupBy((l: any) => l.RawCategory)
        .forEach((item: any, key: any) => {
          if (!/biome/im.test(key)) {
            _.forEach(item, this.CreateDataItem);
          }
        })
    });
  }
}
