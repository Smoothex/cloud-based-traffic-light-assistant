import { SpatsResponse } from "@/interfaces/spatsResponse";

export function getLocalTimestamp(): number {
    return Date.now();
}

export function getLightBackgroundColor(data: SpatsResponse, signalGroupId : number) : { backgroundColor: string } {
    const phase = data?.intersectionStates[0].movementStates[0].movementEvents[0].phaseState;

    switch (phase) {
        case 'PROTECTED_MOVEMENT_ALLOWED':
            return { backgroundColor: 'green' };
        case 'PROTECTED_CLEARANCE':
        case 'PRE_MOVEMENT':
            return { backgroundColor: 'yellow' };
        default:
            return { backgroundColor: 'red' };
    }
}

export function getWarningMessageByTrafficLightPhase(trafficLightPhase: string, distanceToTrafficLight: number): string {
    switch (trafficLightPhase) {
        case 'PROTECTED_MOVEMENT_ALLOWED':
            return `Ein Ampel in ${distanceToTrafficLight.toFixed(2)} Metern ist grün!`;
        case 'PROTECTED_CLEARANCE':
        case 'PRE_MOVEMENT':
            return `Achtung! Ein Ampel in ${distanceToTrafficLight.toFixed(2)} Metern ist gelb!`;
        default:
            return `Warnung! Ein Ampel in ${distanceToTrafficLight.toFixed(2)} Metern ist rot!`;
    }
}