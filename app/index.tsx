import { Text, View, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { GooglePlaceDetail, GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";
import MyLocation from 'react-native-vector-icons/MaterialIcons';
import { convertMinutesToHours } from "@/utilClasses/timeConverter";

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const REGION_BERLIN = {
  latitude: 52.520008,
  longitude: 13.404954,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA
};

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const mapRef = useRef<MapView>(null);
  const autoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);

  const moveToLocation = async (position: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const onPressAddress = (details: GooglePlaceDetail | null, type: "origin" | "destination") => {
    if (details) {
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      };

      if (type === "origin") {
        setOrigin(position);
      } else {
        setDestination(position);
      }

      moveToLocation(position);
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding: { top: 70, right: 70, bottom: 70, left: 70 } });
    }
  };

  const traceRouteOnReady = (args: any) => {
    if (args) {
      setDistance(args.distance);
      setDuration(Math.round(args.duration));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={REGION_BERLIN}
        showsUserLocation
      >
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            mode="WALKING"
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={autoCompleteRef}
          placeholder="Search for your destination"
          fetchDetails={true}
          onPress={(data, details = null) => onPressAddress(details, "destination")}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          textInputProps={{
            onFocus: () => {
              autoCompleteRef.current.clear();
            }
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace Route</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)} km</Text>
            <Text>Duration: {convertMinutesToHours(duration)}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={() => {
        if (location) {
          moveToLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }}>
        <MyLocation name="my-location" size={50} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    top: Constants.statusBarHeight - 10,
    alignSelf: 'center',
    zIndex: 1,
  },
  textInputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    borderRadius: 5,
    padding: 5,
    height: 38,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
  button: {
    backgroundColor: "#bbb",
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: "center",
  },
  locationButton: {
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
  locationButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
