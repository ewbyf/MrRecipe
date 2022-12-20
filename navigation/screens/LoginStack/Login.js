import { StyleSheet, View, Text, TextInput, Button, Alert, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';

export default function Login({ navigation }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginUser = async(email, password) => {
    if (!password) {
      Alert.alert(
        "Missing Password",
        "Please enter your password in the input field."
      );
    }
    else if (!email) {
      Alert.alert(
        "Missing Email",
        "Please enter your email address into the input field.",
      );
    }
    else {
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      }
      catch (error) {
        switch(error.code) {
          case 'auth/user-not-found':
            Alert.alert(
                "Account Not Found",
                "No account found for the email you entered.",
              );
            break;
          case 'auth/invalid-email':
            Alert.alert(
              "Invalid Email",
              "Please enter a valid email address into the input field.",
            );
            break;
          case 'auth/wrong-password':
            Alert.alert(
                "Invalid Password",
                "The password you have entered is incorrect. Please try again."
            );
            break;
          default:
            alert(error.message);
        }
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.appcontainer}> 
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>Login</Text>
        </View>
        <View style={styles.logo}>
          <Image 
            style={styles.walter}
            source={require('../../../assets/walter.jpg')} 
          /> 
        </View>
        <View style={styles.login}>
            <Text style={styles.title}>Mr. Recipe</Text>
            <View style={{flexDirection: 'row'}}>
              <Icon name='mail-outline' size={20} color={'lightgrey'} style={styles.icon}/>
              <TextInput 
                placeholder="Email Address" 
                style={styles.inputField} 
                keyboardType='email-address'
                onChangeText={(email) => {setEmail(email)}}
                autoCapitalize={false}
                autoCorrect={false}
                maxLength={320}
                onSubmitEditing={() => {loginUser(email, password)}}
              ></TextInput>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Icon name='lock-closed-outline' size={20} color={'lightgrey'} style={styles.icon}/>
              <TextInput
                placeholder="Password"
                style={styles.inputField}
                onChangeText={(password) => {setPassword(password)}}
                secureTextEntry={true}
                autoCapitalize={false}
                autoCorrect={false}
                onSubmitEditing={() => {loginUser(email, password)}}
              ></TextInput>
            </View>
        
            <TouchableOpacity onPress={() => loginUser(email, password)} style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Text style={{color: 'white'}}>Don't have an account? </Text>
              <Text onPress={() => navigation.navigate('RegisterScreen')} style={{color: '#518BFF'}}>Sign up</Text>
            </View>

            <Text onPress={() => navigation.navigate('ForgotPasswordScreen')} style={{color: '#518BFF', marginTop: 20}}>Forgot Password?</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    appcontainer: {
      height: '100%',
      backgroundColor: '#222222',
    },
    topbar: {
      paddingTop: 30,
      height: '13%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#518BFF',
    },
    topbarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    login: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
    },
    title: {
      marginBottom: 20,
      fontSize: 24,
      fontWeight: 'bold',
      color: '#518BFF',
    },
    icon: {
      position: 'absolute',
      left: 0,
      top: 10
    },
    inputField: {
      width: 200,
      marginVertical: 5,
      paddingVertical: 7,
      paddingHorizontal: 25,
      borderColor: '#518BFF',
      borderBottomWidth: 1,
      textAlign: 'center',
      color: 'white',
    },
    button: {
      backgroundColor: '#518BFF',
      width: 200,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
    logo: {
      position: 'absolute',
      top: '13%',
    },
    walter: {
      resizeMode: 'stretch',
      height: 50,
      width: 500,
    }
  });