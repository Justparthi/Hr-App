import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
const router = useRouter();

const RegisterScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/send-otp', {
        mobile_number: mobileNumber,
      });

      if (response.data && response.data.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully to your mobile number');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);

    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        mobile_number: mobileNumber,
        otp: enteredOtp
      });

      if (response.data && response.data.success) {
        Alert.alert('Success', 'OTP verified successfully');
        // Navigate to the next screen
        router.push('/test');
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {!otpSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />

          <Button
            title={loading ? 'Sending OTP...' : 'Send OTP'}
            onPress={handleSendOtp}
            disabled={loading}
          />
        </>
      ) : (
        <>
          <Text style={styles.infoText}>
            An OTP has been sent to {mobileNumber}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={enteredOtp}
            onChangeText={setEnteredOtp}
          />

          <Button
            title={verifying ? 'Verifying...' : 'Verify OTP'}
            onPress={handleVerifyOtp}
            disabled={verifying}
          />
          
          <Button
            title="Resend OTP"
            onPress={handleSendOtp}
            disabled={loading}
            color="#888"
          />
        </>
      )}
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
  infoText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default RegisterScreen;