import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const App = () => {
  const [pandaData, setPandaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:5000/panda') // Replace with your backend API URL
      .then(response => {
        setPandaData(response.data); // Set the fetched data to the state
        setLoading(false); // Stop loading
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); // Stop loading if there is an error
      });
  }, []);

  // Render loading spinner or the data list
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Data</Text>

      {/* Render data in a list */}
      <FlatList
        data={pandaData}
        keyExtractor={(item) => item.EMP_ID.toString()} // Use EMP_ID as key
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.text}>ID: {item.EMP_ID}</Text>
            <Text style={styles.text}>Name: {item.EMP_NAME}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Styles for the React Native components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
