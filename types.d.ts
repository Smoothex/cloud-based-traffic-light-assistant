import { LatLng } from "react-native-maps";

export declare global {
    type StepsArray = SingleStep[];

    type SingleStep = {
        distance: string,
        end_location: {
            lat: number,
            lng: number
        },
        instruction: string
    };

    type UserLocationSpeed = LatLng & {
        speed: number
    };
}