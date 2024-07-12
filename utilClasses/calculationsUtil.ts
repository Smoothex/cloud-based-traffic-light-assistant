import { Dimensions } from "react-native";
import { Region } from "react-native-maps";

export function calculateInitialRegion(): Region {
    const screen = Dimensions.get('window');
    const ASPECT_RATIO = screen.width / screen.height;
    const LATITUDE_DELTA = 0.04;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    return {
        latitude: 52.520008,
        longitude: 13.404954,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    };
}