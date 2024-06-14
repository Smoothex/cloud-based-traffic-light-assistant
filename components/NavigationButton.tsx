import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LatLng } from "react-native-maps";

type NavigationButtonProps = {
    startNavigation: () => void,
    stopNavigation: () => void,
    origin: LatLng | null;
    destination: LatLng | null,
    isNavigationActive: boolean;
}

export default function NavigationButton({ startNavigation, stopNavigation, origin, destination, isNavigationActive }: NavigationButtonProps) {
    return (
        <TouchableOpacity style={isNavigationActive ? styles.stopButton : styles.startButton} 
        onPress={isNavigationActive ? stopNavigation : startNavigation} disabled={!origin || !destination}>
            <Text style={styles.navigationButtonText}>{isNavigationActive ? 'Stop navigation' : 'Start navigation'}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    startButton: {
        backgroundColor: "#0099ff", // Adjust background color as desired
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 10,
        borderRadius: 4,
    },
    stopButton: {
        backgroundColor: "#e33232", // Adjust background color as desired
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 10,
        borderRadius: 4,
    },
    navigationButtonText: {
        color: "#fff", // Adjust text color as desired
        textAlign: "center",
    },
});
