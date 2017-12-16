
export interface IDayNightInfo {
  DayScalar:number,
  Day:number,
  DayNightCycleTime:number
}

export interface IPingInfo {
  Label: string,
  Color: number,
  X: number,
  Y: number,
  Z: number,
  Visible: boolean,
  Type: string
}

export interface IPlayerInfo {
  Biome:string,
  X:number,
  Y:number,
  Z:number,
  Heading:number
}

export interface HashMap<T> {
  [key: string]: T;
}

export type WikiItemType =
  "ThermalVent" |
  "LavaGeyser" |
  "Wrecks" |
  "Lifepods" |
  "Seabases" |
  "Transition" |
  "Caves" |
  "Precursor" |
  "Leviathan" |
  "Other";

export interface IWikiDataItem {
  "X": number,
  "Y": number,
  "Z": number,
  "Biome": string[],
  "Type": WikiItemType,
  "RawComment": string,
  "RawCategory": string
}
