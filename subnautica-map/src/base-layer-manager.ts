import * as L from "leaflet";
import { HashMap } from "./interfaces";

export type BaseMapNames =
  "None"              |
  "Biomes"            |
  "Lost River"        |
  "Inactive Lava Zone";

export type BaseMapType = { [k in BaseMapNames]?: L.ImageOverlay }

export default class BaseLayerManager {

  private readonly _gameMap: L.Map;

  // The Base Maps
  private readonly _bounds: L.LatLngBoundsExpression;
  private readonly _baseLayerEmpty: L.ImageOverlay;
  private readonly _baseLayerBiomeImage: L.ImageOverlay;
  private readonly _baseLayerInactiveLavaZoneImage: L.ImageOverlay;
  private readonly _baseLayerLostRiverImage: L.ImageOverlay;

  private readonly _baseMaps: BaseMapType;
  private _currentBaseLayer: BaseMapNames;

  private readonly _biomes = [
    "void",
    "safeShallows",
    "lostRiver",
    "inactiveLavaZone"
  ];

  private readonly _biomeToBaseLayerMap: HashMap<BaseMapNames> = {
    "void": "Biomes",
    "safeShallows": "Biomes",
    "lostRiver": "Lost River",
    "inactiveLavaZone": "Inactive Lava Zone"
  };

  get currentBaseLayer(): BaseMapNames {
    return this._currentBaseLayer;
  }

  set currentBaseLayer(value: BaseMapNames) {
    if (this.currentBaseLayer != value) {
      this._baseMaps[value].addTo(this._gameMap);
      this._currentBaseLayer = value;
    }
  }

  get baseLayers() {
    return this._baseMaps;
  }

  public constructor(gameMap: L.Map, bounds: L.LatLngBoundsExpression) {
    this._gameMap = gameMap;
    this._bounds = bounds;

    // Create base Layers
    this._baseLayerEmpty                 = L.imageOverlay('data/black.png', this._bounds);
    this._baseLayerBiomeImage            = L.imageOverlay('data/BiomeMap_1024_new_May192017.png', this._bounds);
    this._baseLayerInactiveLavaZoneImage = L.imageOverlay('data/ilz_map_transparent.png', this._bounds);
    this._baseLayerLostRiverImage        = L.imageOverlay('data/lost_river_transparent.png', this._bounds);
    this._baseMaps                       = {
      "None"              : this._baseLayerEmpty,
      "Biomes"            : this._baseLayerBiomeImage,
      "Lost River"        : this._baseLayerLostRiverImage,
      "Inactive Lava Zone": this._baseLayerInactiveLavaZoneImage
    };

    this.currentBaseLayer = "Biomes";
  }

  public SetBaseLayerFromBiome(biome: string) {
    if (this._biomes.indexOf(biome) < 0) {
      console.warn("Unhandled Biome: " + biome);
      this.currentBaseLayer = "Biomes";
    } else {
      this.currentBaseLayer = this._biomeToBaseLayerMap[biome];
    }
  }
}