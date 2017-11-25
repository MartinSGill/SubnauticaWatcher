import * as L from "leaflet";
import * as $ from "jquery";
import * as _ from "lodash";

import { IPlayerInfo } from "./interfaces";
import { ToCoordString } from "./utilities";

export default class PlayerManager {
  private readonly _gameMap: L.Map;
  private readonly _mapLayer: L.LayerGroup;
  private readonly _diverMarker: L.Marker;

  get mapLayer(): L.LayerGroup {
    return this._mapLayer;
  }

  public constructor(gameMap: L.Map) {
    this._gameMap = gameMap;
    this._mapLayer = L.layerGroup([]).addTo(this._gameMap);

    this._diverMarker = PlayerManager.CreateDiverMarker();
    this._mapLayer.addLayer(this._diverMarker);
  }

  private static CreateDiverMarker() {
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

    return L.marker(L.latLng(0, 0), diverMarkerOpts);

  }

  public UpdateTrigger() {
    $.getJSON("/?PlayerInfo=").done((data: IPlayerInfo) => {
      this.SetPlayerInfo(data);
    });
  }

  private SetPlayerInfo(data : IPlayerInfo) {
    const posLatLng = L.latLng(data.Y, data.X);

    // Make biome string more readable.
    let biome = _.startCase(data.Biome);

    $("#player-position").text(`Biome: ${biome} | ${ToCoordString(posLatLng, data.Z)}`);
    this._diverMarker.setLatLng(posLatLng);

    if (($("#follow-player")[0] as HTMLInputElement).checked === true) {
      this._gameMap.panTo(posLatLng);
    }
  }

}