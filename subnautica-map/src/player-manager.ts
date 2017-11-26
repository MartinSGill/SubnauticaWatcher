import * as L from "leaflet";
import * as $ from "jquery";
import * as _ from "lodash";

import { IPlayerInfo } from "./interfaces";
import { ToCoordString } from "./utilities";
import ConnectionMonitor from "./connection-monitor";
import BaseLayerManager from "./base-layer-manager";

export default class PlayerManager {
  private readonly _gameMap: L.Map;
  private readonly _mapLayer: L.LayerGroup;
  private readonly _diverMarker: L.Marker;
  private readonly _connection: ConnectionMonitor;
  private readonly _settingsElement: any;
  private readonly _positionElement: any;
  private readonly _baseLayerManager: BaseLayerManager;

  get mapLayer(): L.LayerGroup {
    return this._mapLayer;
  }

  public constructor(gameMap: L.Map, connection: ConnectionMonitor, baseLayerManager: BaseLayerManager) {
    this._gameMap = gameMap;
    this._mapLayer = L.layerGroup([]).addTo(this._gameMap);
    this._connection = connection;

    this._diverMarker = PlayerManager.CreateDiverMarker();
    this._mapLayer.addLayer(this._diverMarker);
    this._baseLayerManager = baseLayerManager;

    this._positionElement = $("#player-position");
    this._settingsElement = $("#follow-player");
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
    if (this._connection.AreUpdatesEnabled()) {
      $.getJSON("/?PlayerInfo=")
        .done((data: IPlayerInfo) => {
          this._connection.Success();
          this.SetPlayerInfo(data);
        })
        .fail(() => this._connection.Fail());
    }
  }

  private SetPlayerInfo(data : IPlayerInfo) {
    const posLatLng = L.latLng(data.Y, data.X);

    // Make biome string more readable.
    let biome = _.startCase(data.Biome);
    this._baseLayerManager.SetBaseLayerFromBiome(data.Biome);

    this._positionElement.text(`Biome: ${biome} | ${ToCoordString(posLatLng, data.Z)}`);
    this._diverMarker.setLatLng(posLatLng);
    if (this._settingsElement.is('.is-checked'))
    {
      this._gameMap.panTo(posLatLng);
    }
  }
}
