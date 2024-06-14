import { TouchableOpacity, Text, StyleSheet } from "react-native";

type TraceRouteButtonProps = {
    traceRoute: () => void;
}

export default function TraceRouteButton({ traceRoute }: TraceRouteButtonProps) {
    return (
        <TouchableOpacity style={styles.traceRouteButton} onPress={traceRoute}>
            <Text style={styles.buttonText}>Trace Route</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    traceRouteButton: {
        backgroundColor: '#bbb',
        paddingVertical: 12,
        marginTop: 10,
        borderRadius: 4,
    },
    buttonText: {
        textAlign: 'center',
    },
});
