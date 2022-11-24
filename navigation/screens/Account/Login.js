import { StyleSheet, View, Text, TextInput, Button, Alert, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Login({ navigation }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginUser = async(email, password) => {
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
            "Invalid Email Address",
            "Please enter a valid email address into the input field.",
          );
          break;
        case 'auth/missing-email':
          Alert.alert(
            "Email Address Not Entered",
            "Please enter your email address into the input field.",
          );
          break;
        default:
          alert(error.message);
      }
    }
  }

  return (
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
                  placeholder="Email address" 
                  style={styles.inputField} 
                  onChangeText={(email) => {setEmail(email)}}
                  autoCapitalize={false}
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
          
              <TouchableOpacity onPress={() => loginUser(email, password)} style={styles.loginButton}>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Login</Text>
              </TouchableOpacity>
      


              <View style={{flexDirection: 'row', marginTop: 20}}>
                <Text>Don't have an account? </Text>
                <Text onPress={() => navigation.navigate('RegisterScreen')} style={{color: '#518BFF'}}>Sign up</Text>
              </View>

              <Text onPress={() => navigation.navigate('ForgotPasswordScreen')} style={{color: '#518BFF', marginTop: 20}}>Forgot Password?</Text>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
    appcontainer: {
      height: '100%',
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
    },
    loginButton: {
      backgroundColor: '#518BFF',
      width: 200,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    logo: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    walter: {
      resizeMode: 'stretch',
      height: 75,
      width: 500,
    }
  });