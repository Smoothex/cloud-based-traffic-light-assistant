import { Text, View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState({} as Location.LocationObject);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    if (location.coords) {
      text = `(Lat: ${location.coords.latitude}, Long: ${location.coords.longitude})`;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bigHeader}>Current location:</Text>
      <Text style={styles.paragraph}>{text}</Text>
      <Text style={styles.paragraph}>Accuracy: {location.coords ? location.coords.accuracy : 'N/A'}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  bigHeader: {
    fontSize: 20,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
  },
});
