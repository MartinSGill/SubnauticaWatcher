import * as L from "leaflet";
import * as $ from "jquery";
import { Map, IPingInfo } from "./interfaces";

export default class PingManager {

  private _pingMarkers: L.Marker[] = [];
  private _pingMarkerIcons: Map<L.Icon> = {
    "Lifepod": new L.Icon({
                            iconUrl   : `data/lifepod_5_transparent.png`,
                            iconSize  : [48, 48],
                            iconAnchor: [16, 16]
                          }),
    "Signal": new L.Icon({
                           iconUrl   : `data/signal_ping.png`,
                           iconSize  : [48, 48],
                           iconAnchor: [16, 16]
                         }),

    "Beacon": new L.Icon({
                           iconUrl   : `data/beacon.png`,
                           iconSize  : [48, 48],
                           iconAnchor: [16, 16]
                         }),

    "MapRoomCamera": new L.Icon({
                                  iconUrl   : `data/camera_drone.png`,
                                  iconSize  : [48, 48],
                                  iconAnchor: [16, 16]
                                }),

    "Cyclops": new L.Icon({
                            iconUrl   : `data/cyclops.png`,
                            iconSize  : [48, 48],
                            iconAnchor: [16, 16]
                          }),

    "Seamoth": new L.Icon({
                            iconUrl   : `data/seamoth.png`,
                            iconSize  : [48, 48],
                            iconAnchor: [16, 16]
                          }),
    "Exosuit": new L.Icon({
                            iconUrl   : `data/exosuit.png`,
                            iconSize  : [48, 48],
                            iconAnchor: [16, 16]
                          })
  };

  private readonly _gameMap: L.Map;
  private readonly _mapLayer: L.LayerGroup;

  get mapLayer(): L.LayerGroup {
    return this._mapLayer;
  }

  public constructor(gameMap: L.Map) {
    this._gameMap = gameMap;
    this._mapLayer = L.layerGroup([]).addTo(this._gameMap);
  }

  public UpdateTrigger() {
    $.getJSON("/?PingInfo=").done((data: IPingInfo[]) => {
      this.SetPingInfo(data);
    });
  }

  private GetPingIcon(ping: IPingInfo) : L.Icon {
    if (this._pingMarkerIcons.hasOwnProperty(ping.Type)) {
      return this._pingMarkerIcons[ping.Type];
    } else {
      return this._pingMarkerIcons['Signal'];
    }
  }

  private UpdatePingMarker(index: number, ping: IPingInfo) {
    if (this._pingMarkers.length > index) {
      // update existing marker
      const marker = this._pingMarkers[index];
      marker.options.icon = this.GetPingIcon(ping);
      marker.options.title = ping.Label;
      marker.setLatLng(L.latLng(ping.Y, ping.X));
    } else {
      // need to add a new marker
      let markerOpts: L.MarkerOptions = {
        title: ping.Label
      };

      markerOpts.icon = this.GetPingIcon(ping);
      let marker = L.marker(L.latLng(ping.Y, ping.X), markerOpts);
      this._mapLayer.addLayer(marker);
      this._pingMarkers.push(marker);
    }
  }

  private  RemovePingMarkers(lastIndex: number) {
    while (this._pingMarkers.length > lastIndex + 1) {
      let marker = this._pingMarkers.pop();
      this._mapLayer.removeLayer(marker);
    }
  }

  private SetPingInfo (data :IPingInfo[]) {
    this.RemovePingMarkers(data.length -1);

    for (let index = 0; index < data.length; index++) {
      this.UpdatePingMarker(index, data[index]);
    }
  }
}
