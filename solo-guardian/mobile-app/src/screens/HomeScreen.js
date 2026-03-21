import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import SOSButton from '../components/SOSButton';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solo Guardian</Text>
      <Text style={styles.subtitle}>Your AI Companion for Safe Travels</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Start a Safe Trip" 
          onPress={() => navigation.navigate('Map')}
        />
        <View style={{ height: 20 }} />
        <Button 
          title="SOS Settings" 
          onPress={() => navigation.navigate('SOS')}
          color="#FF5A5F"
        />
      </View>

      <SOSButton style={styles.sosButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sosButton: {
    position: 'absolute',
    bottom: 40,
  }
});
