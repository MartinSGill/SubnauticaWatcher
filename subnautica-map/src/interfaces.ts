
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
  Z:number
}

export interface Map<T> {
  [key: string]: T;
}
