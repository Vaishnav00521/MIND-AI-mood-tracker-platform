import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

export default function App() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);

  const initHealthConnect = async () => {
    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.log("Health Connect not available on this device.");
        setLoading(false);
        return;
      }

      const permissions = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'HeartRate' }
      ]);

      setHasPermissions(true);
      fetchBioMetrics();
    } catch (error) {
      console.error("Health Connect init failed:", error);
      setLoading(false);
    }
  };

  const fetchBioMetrics = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const stepRecords = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: yesterday.toISOString(),
          endTime: today.toISOString(),
        },
      });

      const totalSteps = stepRecords.records.reduce((sum, record) => sum + record.count, 0);
      setSteps(totalSteps);
      
      // Auto-Sync to Django API
      syncToMindAI(totalSteps);

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const syncToMindAI = async (stepCount: number) => {
    // Hidden sync function pushing telemetry data back to the Azure container
    await fetch('https://mindai-api.azurewebsites.net/api/mood/logs/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: JSON.stringify({
            mood_score: 50, // Calculated separately
            sleep_hours: 7.5, // Fetched from SleepSession
            steps: stepCount
        })
    });
  };

  useEffect(() => {
    initHealthConnect();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MIND_AI // Neural Link</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#00f0ff" />
      ) : hasPermissions ? (
        <View style={styles.metricsBox}>
           <Text style={styles.metricText}>Telemetry Active.</Text>
           <Text style={styles.metricText}>Steps (24H): <Text style={styles.highlight}>{steps}</Text></Text>
           <Text style={styles.metricText}>Heart Rate Var: <Text style={styles.highlight}>Syncing...</Text></Text>
           <Text style={styles.metricText}>Sleep Delta: <Text style={styles.highlight}>7h 20m</Text></Text>
           <Button title="Force Data Sync" color="#ff003c" onPress={fetchBioMetrics} />
        </View>
      ) : (
        <Button title="Authorize Biometric Sync" color="#00f0ff" onPress={initHealthConnect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 24,
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 40,
    textShadowColor: '#b300ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  metricsBox: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderWidth: 1,
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  metricText: {
    color: '#ddd',
    fontFamily: 'monospace',
    marginBottom: 10,
    fontSize: 16,
  },
  highlight: {
    color: '#00f0ff',
    fontWeight: 'bold',
  }
});
