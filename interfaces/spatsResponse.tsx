import { MapsResponse } from "./mapsResponse"

export interface TrafficLightData {
  intersectionId: string | null,
  spatData: SpatsResponse | null,
  mapData: MapsResponse | null
}

export interface SpatsResponse {
  msgID: number
  msgSubID: number
  timestamp: number
  intersectionStates: IntersectionState[]
}

export interface IntersectionState {
  intersectionId: number
  regionId: number
  revision: number
  status: any[]
  moy: number
  timestamp: number
  recvtime: number
  source: string
  movementStates: MovementState[]
}

export interface MovementState {
  signalGroupId: number
  movementEvents: MovementEvent[]
}

export interface MovementEvent {
  phaseState: string
  timeChange: TimeChange
}

export interface TimeChange {
  startTime: number
  minEndTime: number
  maxEndTime: number
  likelyTime: number
  confidence: number
  nextTime: number
}
