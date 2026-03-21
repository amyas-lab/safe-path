import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import SOSScreen from './src/screens/SOSScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Solo Guardian' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Live Map & Route' }} />
        <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
