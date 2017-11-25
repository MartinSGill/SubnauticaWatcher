import * as L from "leaflet";
import * as _ from "lodash";
import * as $ from "jquery";
import { Map } from "./interfaces";

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
  get layerOther(): L.LayerGroup {
    return this._layerOther;
  }

  private readonly _layerMap: Map<string> = {
    'ThermalVent': "thermometer.png",
    'LavaGeyser' : "fountain.png",
    'Wrecks'     : "wrecking-ball.png",
    'Lifepods'   : "sos.png",
    'Seabases'   : "house.png",
    'Caves'      : "cave.png",
    'Precursor'  : "alien.png",
    'Transition' : "lift.png",
    'Other'      : "question.png",
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
    this._layerOther       = L.layerGroup([]).addTo(this._gameMap);
    this.LoadData();
  }

  private GetMarkerIconName(type: string): string {
    if (this._layerMap.hasOwnProperty(type)) {
      return this._layerMap[type];
    } else {
      return this._layerMap['Other'];
    }
  }

  private GetMapLayer(dataItem: any): L.LayerGroup {
    let layer: L.LayerGroup = this._layerOther;
    if (/Thermal Vents/im.test(dataItem.RawComment)) {
      layer = this._layerThermals;
    } else if (/Lava Geyser/im.test(dataItem.RawComment)) {
      layer = this._layerGeysers;
    } else if (/wreck/im.test(dataItem.RawComment)) {
      layer = this._layerWrecks;
    } else if (/lifepod/im.test(dataItem.RawComment)) {
      layer = this._layerLifepods;
    } else if (/seabase/im.test(dataItem.RawComment)) {
      layer = this._layerSeabases;
    } else if (/cave/im.test(dataItem.RawComment)) {
      layer = this._layerCaves;
    } else if (/precursor/im.test(dataItem.RawCategory)) {
      layer = this._layerAlien;
    } else if (/minor/im.test(dataItem.RawCategory)) {
      layer = this._layerOther;
    } else {
      layer = this._layerOther;
    }
    return layer;
  }

  private LoadData() {
    $.getJSON("data/wiki_map_locations.json").done((data) => {
      _(data)
        .groupBy((l: any) => l.RawCategory)
        .forEach((item: any, key: any) => {
          if (!/biome/im.test(key)) {
            _.forEach(item, (obj) => {
                        let icon: string        = this.GetMarkerIconName(obj.Type);
                        let layer: L.LayerGroup = this.GetMapLayer(obj);

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
  }
}
