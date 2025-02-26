import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const handleRegister = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/register', {
        mobile_number: mobileNumber,
      });

      if (response.data && response.data.otp) {
        setOtp(response.data.otp);  
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', 'Failed to generate OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />

      <Button
        title={loading ? 'Sending OTP...' : 'Send OTP'}
        onPress={handleRegister}
        disabled={loading}
      />

      {otp ? (
        <Text style={styles.otpText}>OTP: {otp}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  otpText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});

export default RegisterScreen;
