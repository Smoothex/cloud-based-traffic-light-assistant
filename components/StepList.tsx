import { StyleSheet, View, Text } from "react-native";

export default function StepList({ steps }: { steps: { instruction: string; distance: string; }[] }) {
    return (
        <View style={styles.stepsContainer}>
            {!!steps.length && (
                <View style={styles.stepItem}>
                    <Text>Next: {steps[0].instruction} ({steps[0].distance})</Text>
                </View>
            )}
        </View>
    )
};

const styles = StyleSheet.create({
    stepsContainer: {
        position: 'absolute',
        bottom: 120,
        width: '90%',
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
        padding: 10,
        borderRadius: 8,
        alignSelf: 'center',
        zIndex: 1,
    },
    stepItem: {
        marginVertical: 5,
    },
});