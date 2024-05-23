import { Text, View, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";

const REGION_BERLIN = {
  latitude: 52.520008,
  longitude: 13.404954,
  latitudeDelta: 2,
  longitudeDelta: 2
}

export default function App() {
  const [location, setLocation] = useState({} as Location.LocationObject);
  const [errorMsg, setErrorMsg] = useState('');
  const [mapMoved, setMapMoved] = useState(false);
  const mapRef = useRef<MapView>({} as MapView);

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

  const onRegionChange = (region: Region) => {
		setMapMoved(true);
	};

  return (
    <View style={styles.container}>
      <MapView provider={PROVIDER_GOOGLE} 
        style={styles.map} 
        initialRegion={REGION_BERLIN} 
        showsMyLocationButton={mapMoved}
        showsUserLocation
        onRegionChangeComplete={onRegionChange}
        ref={mapRef}
      ></MapView>
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
    color: 'red',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  }
});
