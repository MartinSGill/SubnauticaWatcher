import { LatLng } from "leaflet";

export function ToCoordString(position: LatLng,
                              depth: number                       = 0,
                              coordFormat: "game" | "traditional"  = "game") {
  if (coordFormat === 'game') {
    return `${Math.round(position.lng)}, ${depth}, ${Math.round(position.lat)}`
  } else {
    return `${Math.round(position.lng)}, ${Math.round(position.lat)}, ${depth}`
  }
}