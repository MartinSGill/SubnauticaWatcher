import * as L from "leaflet";
import * as $ from "jquery";

export type BaseMapNames =
  "None"              |
  "Biomes"            |
  "Jellyshroom Cave"  |
  "Deep Grand Reef"   |
  "Lost River"        |
  "Inactive Lava Zone"|
  "Active Lava Zone";

export type BaseMapType = { [k in BaseMapNames]?: L.ImageOverlay }

export default class BaseLayerManager {

  private readonly _gameMap: L.Map;

  // The Base Maps
  private readonly _bounds: L.LatLngBoundsExpression;
  private readonly _baseLayerEmpty: L.ImageOverlay;
  private readonly _baseLayerBiomeImage: L.ImageOverlay;
  private readonly _baseLayerJellyShroomImage: L.ImageOverlay;
  private readonly _baseLayerDeepGrandReefImage: L.ImageOverlay;
  private readonly _baseLayerInactiveLavaZoneImage: L.ImageOverlay;
  private readonly _baseLayerActiveLavaZoneImage: L.ImageOverlay;
  private readonly _baseLayerLostRiverImage: L.ImageOverlay;

  private readonly _settingsElement: any;

  private readonly _baseMaps: BaseMapType;
  private _currentBaseLayer: BaseMapNames;
  private _currentBiome: string;

  get currentBaseLayer(): BaseMapNames {
    return this._currentBaseLayer;
  }

  set currentBaseLayer(value: BaseMapNames) {
    if (this._settingsElement.is('.is-checked') && this.currentBaseLayer != value) {
      console.debug(`BaseLayer change detected ${this.currentBaseLayer} -> ${value}`);
      if (this._baseMaps.hasOwnProperty(value)) {
        this._baseMaps[this.currentBaseLayer].remove();
        this._baseMaps[value].addTo(this._gameMap);
        this._currentBaseLayer = value;
      } else {
        console.warn("Unable to change base map to: " + value);
      }
    }
  }

  get baseLayers() {
    return this._baseMaps;
  }

  public constructor(gameMap: L.Map, bounds: L.LatLngBoundsExpression) {
    this._gameMap = gameMap;
    this._bounds = bounds;
    this._settingsElement = $("#auto-layer");

    // Create base Layers
    this._baseLayerEmpty                 = L.imageOverlay('data/black.png', this._bounds);
    this._baseLayerBiomeImage            = L.imageOverlay('data/biome-map.png', this._bounds);
    this._baseLayerJellyShroomImage      = L.imageOverlay('data/jellyshroom-cave.png', this._bounds);
    this._baseLayerDeepGrandReefImage    = L.imageOverlay('data/deepgrandreef.png', this._bounds);
    this._baseLayerInactiveLavaZoneImage = L.imageOverlay('data/ilz.png', this._bounds);
    this._baseLayerActiveLavaZoneImage   = L.imageOverlay('data/alz.png', this._bounds);
    this._baseLayerLostRiverImage        = L.imageOverlay('data/lost-river-polygon.png', this._bounds);
    this._baseMaps                       = {
      "None"              : this._baseLayerEmpty,
      "Biomes"            : this._baseLayerBiomeImage,
      "Jellyshroom Cave"  : this._baseLayerJellyShroomImage,
      "Deep Grand Reef"   : this._baseLayerDeepGrandReefImage,
      "Lost River"        : this._baseLayerLostRiverImage,
      "Inactive Lava Zone": this._baseLayerInactiveLavaZoneImage,
      "Active Lava Zone"  : this._baseLayerActiveLavaZoneImage
    };

    this._currentBaseLayer = "Biomes";
    this._baseLayerBiomeImage.addTo(this._gameMap);
    this._currentBiome = "safeShallows";
  }

  private DetermineBaseMap(biome: string): BaseMapNames {
    if (/ilz/im.test(biome)) {
      return "Inactive Lava Zone";
    }
    if (/prison|lavafalls|lavapits|lavalakes|alzchamber/im.test(biome)) {
      return "Active Lava Zone";
    }
    // Power plant is precursor gun, whereas actual gun/
    if (/(precursorgun$)|thermalroom/im.test(biome)) {
      return "Inactive Lava Zone";
    }
    if (/lostriver|ghosttree/im.test(biome)) {
      return "Lost River";
    }
    if (/jellyshroom/im.test(biome)) {
      return "Jellyshroom Cave";
    }
    if (/deepgrandreef/im.test(biome)) {
      return "Deep Grand Reef";
    }
    return "Biomes";
  }

  public SetBaseLayerFromBiome(biome: string) {
    if (biome !== this._currentBiome) {
      console.debug(`Biome change detected ${this._currentBiome} -> ${biome}`);
      this.currentBaseLayer = this.DetermineBaseMap(biome);
      this._currentBiome = biome;
    }
  }
}