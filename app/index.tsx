import { Text, View, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlaceDetail, GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";
import MyLocation from 'react-native-vector-icons/MaterialIcons';
import { convertMinutesToHours } from "@/utilClasses/timeConverter";
import VoiceInput from "@/components/VoiceInput";

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
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const[route, setRoute] = useState<any | null>(null);
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

    // todo : add fetch call or SSE call impolementation currently removed or commebted out as not working

    /*
        const url = 'https://werkzeug.dcaiti.tu-berlin.de/0432l770/trafficlights/spat?intersection=643@49030';
        // const url = 'https://werkzeug.dcaiti.tu-berlin.de/0432l770/trafficlights/spats?transport=serverSentEvents&intersection=643@49030';
        // const url = 'https://werkzeug.dcaiti.tu-berlin.de/0432l770/trafficlights/spats?intersection=643@49030&transport=jsonEventStream';
        fetchData(url);
        const es = new EventSource(url, {
          headers: {
            Authorization: {
              toString: function () {
                return process.env.AUTH_TOKEN;
              },
            },
          },
        });
        es.open()

         es.addEventListener("open", (event) => {
           console.log("Open SSE connection.",event);
         });

         es.addEventListener("message", (event) => {
           console.log("New message event:", event);
         });

         es.addEventListener("error", (event) => {
           if (event.type === "error") {
             console.error("Connection error:", event);
           } else if (event.type === "exception") {
             console.error("Error:", event.message, event.error);
           }
         });
        // Add an event listener for incoming messages


        // Clean up the event source on component unmount
        return () => {
          es.removeAllEventListeners();
          es.close();

        };*/


  }, []);

  /**
   * Moves the camera to the specified location on the map.
   *
   * @param {LatLng} position - The position to move the camera to.
   * @return {Promise<void>} A promise that resolves when the camera animation is complete.
   */
  const moveToLocation = async (position: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      const newRegion = {
        ...position,
        latitudeDelta: 0.0018, // adjust zoom level here (smaller value = more zoom)
        longitudeDelta: 0.0018,
      };
      mapRef.current?.animateToRegion(newRegion, 2000);
    }
  };
  // const fetchData = async (url:string) => {
  //   try {
  //     console.warn("calloing fetch data ")
  //     const response = await fetch(url,{
  //       headers: {
  //         // 'Content-Type': 'application/json', // Example header
  //         'Authorization': 'Basic a3J1dGFydGg0OlRVQmFuYTEyVFVCYW5hMTIh',
  //         'Access-Control-Allow-Credentials': 'true',
  //         'Access-Control-Allow-Origin': 'localhost:8081'
  //         // 'Host': 'werkzeug.dcaiti.tu-berlin.de'// Example header
  //       },
  //     });
  //     const json = await response.json();
  //     console.log("json",json);
  //     // setData(json); update traffic data
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  /**
   * Updates the origin or destination location based on the given details and type.
   *
   * @param {GooglePlaceDetail | null} details - The details of the place selected.
   * @param {"origin" | "destination"} type - The type of location being updated.
   */
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
      setRoute(args.legs[0].steps)
      console.log(args)
    }
  };

/**
 * Starts navigation from the origin to the destination.
 * Subscribes to current user location and follows it when the user moves.
 */
  const startNavigation = async () => {
    if (!origin || !destination) {
      return;
    }
    moveToLocation(origin)
    setIsNavigationActive(true);
    let subscription: { remove: any; };
    try {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 3, // Update location every 3 meters
          
        },
        (location) => {
          const userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          moveToLocation(userLocation);
        }
      );
    } catch (error) {
      console.error("Error starting navigation:", error);
    }

    return () => {
      setIsNavigationActive(false);
      subscription?.remove();
    };
  };

  function updateTextInputOnEndOfSpeaking(result: string) {
    autoCompleteRef.current.focus();
    autoCompleteRef.current.setAddressText(result);
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={REGION_BERLIN}
        showsUserLocation
        showsMyLocationButton={false}
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
          enableHighAccuracyLocation
          keepResultsAfterBlur={false}
          minLength={3}
          onPress={(data, details = null) => onPressAddress(details, "destination")}
          query={{
            key: GOOGLE_API_KEY,
            language: 'de',
            components: 'country:de',
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
          }}
          textInputProps={{
            onFocus: () => {
              console.log('elem focused');
            },
            onChangeText: () => {
              console.log('text changed');
            },
            maxLength: 60,
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
      {origin && destination ? (
          <TouchableOpacity style={styles.navigationButton} onPress={startNavigation} disabled={!origin || !destination}>
            <Text style={styles.navigationButtonText}>Start Navigation</Text>
          </TouchableOpacity>
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
      <VoiceInput styles={styles.speakingButton} setResults={updateTextInputOnEndOfSpeaking}></VoiceInput>
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
    marginTop: 10,
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
  speakingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  navigationButton: {
    backgroundColor: "#0099ff", // Adjust background color as desired
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
