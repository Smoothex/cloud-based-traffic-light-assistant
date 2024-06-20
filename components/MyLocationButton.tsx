import { TouchableOpacity, StyleSheet } from "react-native";
import { LatLng } from "react-native-maps";
import * as Location from "expo-location";
import MyLocation from 'react-native-vector-icons/MaterialIcons';

type MyLocationButtonProps = {
    moveToLocation: (position: LatLng) => void,
    location: Location.LocationObject | null;
}

export default function MyLocationButton({ moveToLocation, location }: MyLocationButtonProps) {
    return (
        <TouchableOpacity style={styles.myLocationButton} onPress={() => {
            if (location) {
                moveToLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        }}>
            <MyLocation name='my-location' size={50} color='#fff' />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    myLocationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#900',
        padding: 10,
        borderRadius: 50,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
});
