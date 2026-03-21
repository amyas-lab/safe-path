import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Button, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchRoute } from '../utils/trackAsiaApi';
import { isDeviatingFromRoute, isStationaryTooLong, isDelayed } from '../utils/anomalyDetection';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [tripData, setTripData] = useState(null); // { startTime, expectedDurationSeconds }
  const [locationHistory, setLocationHistory] = useState([]); // [{ coords: { latitude, longitude }, timestamp }]
  
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const mapRef = useRef(null);
  // We use refs to access latest state inside the watchPosition closure without re-subscribing
  const historyRef = useRef([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Set up live tracking & anomaly detection
  useEffect(() => {
    let locationSubscription = null;

    if (isTracking && route.length > 0 && tripData) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (newLocation) => {
            const currentCoords = newLocation.coords;
            const now = Date.now();
            setLocation(currentCoords);
            
            // Update history
            const newHistory = [...historyRef.current, { coords: currentCoords, timestamp: now }];
            historyRef.current = newHistory;
            setLocationHistory(newHistory);
            
            // 1. Deviating Check: 50 meters (0.05 km)
            if (isDeviatingFromRoute(currentCoords, route, 0.05)) {
               triggerAnomalyAlert("Route Deviation Detected");
               return;
            }
            
            // 2. Stationary Check: > 5 minutes
            if (isStationaryTooLong(historyRef.current, 5)) {
               triggerAnomalyAlert("Unexpected Stop Detected");
               return;
            }
            
            // 3. Delayed Check: buffer of 10 minutes
            if (isDelayed(tripData.startTime, tripData.expectedDurationSeconds, 10)) {
               triggerAnomalyAlert("ETA Exceeded");
               return;
            }
          }
        );
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking, route, tripData]);

  const triggerAnomalyAlert = (reason) => {
    setIsTracking(false); 
    Alert.alert(
       `⚠️ ${reason}!`,
      "Are you safe? If you don't respond in 1 minute, an emergency alert will be sent.",
      [
        { text: "I'm Safe", style: "cancel", onPress: () => setIsTracking(true) },
        { text: "Help me!", style: "destructive", onPress: () => sendSOS() }
      ]
    );
  };

  const sendSOS = async () => {
    Alert.alert("SOS Triggered", "Sending emergency alert to your contacts...");
    
    try {
      // NOTE: For local testing on an actual phone, replace 'localhost' with your computer's local IP (e.g., 192.168.1.10)
      // If using Firebase Emulator, the default port for functions is 5001
      const SERVER_URL = 'http://localhost:5001/solo-guardian/us-central1/sendEmergencyAlert';
      
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location,
          contactPhone: '+84987654321', // TODO: Fallback to real emergency contact from SOSScreen
          userName: 'Mai Anh'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        Alert.alert("SOS Sent", "Emergency contacts have been notified with your live location.");
      } else {
        Alert.alert("SOS Error", "Failed to send SMS: " + data.error);
      }
    } catch (error) {
      console.log('SOS Network Error:', error);
      Alert.alert("Network Error", "Could not reach the SOS backend server.");
    }
  };

  const handleSimulateRoute = async () => {
    if (!location) return;
    
    // Hardcode a destination nearby
    const destination = {
      latitude: location.latitude + 0.02,
      longitude: location.longitude + 0.02,
    };

    const fetchedData = await fetchRoute(location, destination, 'moto');
    if (fetchedData) {
      setRoute(fetchedData.coordinates);
      setTripData({
        startTime: Date.now(),
        expectedDurationSeconds: fetchedData.durationSeconds || 600 // fallback 10 mins
      });
      // reset history
      historyRef.current = [{ coords: location, timestamp: Date.now() }];
      setLocationHistory(historyRef.current);
      
      setIsTracking(true);
      
      mapRef.current?.fitToCoordinates(fetchedData.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else {
      Alert.alert('Error', 'Could not fetch route from TrackAsia API.');
    }
  };

  const handleMockStationary = () => {
    if (!isTracking) {
      Alert.alert('Setup Route First', 'Please press "Start Simulated Trip" first.');
      return;
    }
    
    // Fake 6 minutes of no movement
    const now = Date.now();
    const mockHistory = [
      { coords: location, timestamp: now - 6 * 60 * 1000 },
      { coords: location, timestamp: now }
    ];
    historyRef.current = mockHistory;
    
    if (isStationaryTooLong(mockHistory, 5)) {
      triggerAnomalyAlert("Unexpected Stop Detected (Simulated)");
    }
  };

  const handleMockAudioDanger = async () => {
    Alert.alert("Listening...", "Simulating microphone recording...");
    try {
      const transcript = "Ê mày đi đâu đấy, đứng lại! Đưa điện thoại đây, nhanh lên không tao đập chết bây giờ!";
      const SERVER_URL = 'http://localhost:5001/solo-guardian/us-central1/analyzeAudioContext';
      
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      
      const data = await response.json();
      
      if (data.isDanger) {
        triggerAnomalyAlert(`Audio Danger Detected: ${data.reason}`);
      } else {
        Alert.alert("AI Analysis", "Safe: No danger detected.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not reach AI Server. Have you started the Firebase Emulator?");
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView 
          ref={mapRef} style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          <Marker coordinate={location} title="You are here" />
          {route.length > 0 && <Polyline coordinates={route} strokeColor="#4285F4" strokeWidth={5} />}
          {route.length > 0 && <Marker coordinate={route[route.length - 1]} title="Destination" pinColor="green" />}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
      )}
      
      <View style={styles.controls}>
        {!isTracking ? (
          <Button title="Start Simulated Trip" onPress={handleSimulateRoute} color="#4CAF50" />
        ) : (
          <Button title="Stop Tracking" onPress={() => setIsTracking(false)} color="#D32F2F" />
        )}
        <View style={{height: 10}} />
        <Button title="Mock Stationary Error" onPress={handleMockStationary} color="#FF9800" />
        <View style={{height: 10}} />
        <Button title="Mock Audio Danger" onPress={handleMockAudioDanger} color="#9C27B0" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loader: { flex: 1, justifyContent: 'center' },
  controls: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15, borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
  }
});
