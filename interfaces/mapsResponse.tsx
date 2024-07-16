export interface MapsResponse {
    intersectionId:   string;
    refPoint:         CenterPoint;
    laneSetConverted: LaneSetConverted[];
    centerPoint:      CenterPoint;
    boundingCircle:   BoundingCircle;
}

export interface BoundingCircle {
    centerPoint: CenterPoint;
    radius:      number;
}

export interface CenterPoint {
    positionWGS84: PositionWGS84;
}

export interface PositionWGS84 {
    lat: number;
    lng: number;
}

export interface LaneSetConverted {
    laneId:                  number;
    name:                    string;
    laneAttributesConverted: LaneAttributesConverted;
    nodeListConverted:       CenterPoint[];
    connectsToConverted:     ConnectsToConverted[];
    heading:                 number;
}

export interface ConnectsToConverted {
    connectingLaneConverted: ConnectingLaneConverted;
    signalGroup:             number;
}

export interface ConnectingLaneConverted {
    lane:     number;
    maneuver: string;
}

export interface LaneAttributesConverted {
    directionalUse: string;
    sharedWith:     string;
    laneType:       string;
}