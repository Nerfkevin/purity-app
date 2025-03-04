import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useBibleDatabase, BibleDatabaseStatus } from '../lib/hooks/useBibleDatabase';

interface BibleDatabaseManagerProps {
  onReady: () => void;
}

const BibleDatabaseManager: React.FC<BibleDatabaseManagerProps> = ({ onReady }) => {
  const {
    status,
    diagnosticMessage,
    isRepairing,
    repairDatabase,
    showRepairDialog
  } = useBibleDatabase();

  useEffect(() => {
    if (status === BibleDatabaseStatus.READY) {
      onReady();
    }
    
    if (status === BibleDatabaseStatus.REPAIR) {
      showRepairDialog();
    }
  }, [status, onReady, showRepairDialog]);

  // Render different content based on database status
  const renderContent = () => {
    switch (status) {
      case BibleDatabaseStatus.LOADING:
        return (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.text}>Loading Bible Database...</Text>
          </View>
        );
      case BibleDatabaseStatus.REPAIR:
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Bible Database Needs Repair</Text>
            <Text style={styles.text}>{diagnosticMessage}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={repairDatabase}
              disabled={isRepairing}
            >
              <Text style={styles.buttonText}>
                {isRepairing ? 'Repairing...' : 'Repair Database'}
              </Text>
            </TouchableOpacity>
            {isRepairing && <ActivityIndicator style={styles.spinner} />}
          </View>
        );
      case BibleDatabaseStatus.ERROR:
        return (
          <View style={styles.container}>
            <Text style={[styles.title, styles.error]}>Bible Database Error</Text>
            <Text style={styles.text}>{diagnosticMessage}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={repairDatabase}
              disabled={isRepairing}
            >
              <Text style={styles.buttonText}>
                {isRepairing ? 'Repairing...' : 'Try Repair'}
              </Text>
            </TouchableOpacity>
            {isRepairing && <ActivityIndicator style={styles.spinner} />}
          </View>
        );
      case BibleDatabaseStatus.READY:
      default:
        return null; // Don't render anything when ready
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    color: '#333'
  },
  error: {
    color: '#c00'
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  spinner: {
    marginTop: 20
  }
});

export default BibleDatabaseManager; 