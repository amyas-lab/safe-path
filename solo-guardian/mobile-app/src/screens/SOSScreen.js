import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

export default function SOSScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.description}>
        Add contacts who will receive your live location and an SOS SMS if an anomaly is detected.
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Mom" />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="+849xxxxxxx" keyboardType="phone-pad" />
      </View>
      
      <Button title="Save Contacts" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  }
});
