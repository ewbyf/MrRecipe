import { StyleSheet, View, Text, TextInput, Button, Alert, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import global from "../../../../../Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from "react";
import { firebase } from '../../../../../config';
import Dialog from 'react-native-dialog';

export default function Login({ navigation }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
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
          case 'auth/too-many-requests':
            Alert.alert(
                "Too Many Attempts",
                "Access to this account has been temporarily disabled due to too many failed attempts."
            );
            break;
          default:
            alert(error.message);
        }
      }
    }
  }

  const resetPassword = async() => {
    try {
        await firebase.auth().sendPasswordResetEmail(resetEmail);
        alert("Your password reset email has been sent!");
        setResetEmail('');
        setForgotVisible(false);
    }
    catch (error) {
        switch(error.code) {
            case 'auth/user-not-found':
                Alert.alert(
                    "Account Not Found",
                    "No account found for the email address you entered.",
                  );
                break;
            case 'auth/invalid-email':
                Alert.alert(
                    "Invalid Email",
                    "Please enter a valid email address into the input field.",
                  );
                break;
            case 'auth/missing-email':
                Alert.alert(
                    "Missing Email",
                    "Please enter your email address into the input field.",
                  );
                break;
            default:
                alert(error.message);
        }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> 
      <View style={global.appContainer}> 

        {/* Forgot password pop up */} 
        <Dialog.Container visible={forgotVisible}>
          <Dialog.Title>Forgot Password</Dialog.Title>
          <Dialog.Description>
            Please enter the email for your account.
          </Dialog.Description>
          <Dialog.Input
            placeholder="Enter email"
            onChangeText={(email) => setResetEmail(email)}
          />
          <Dialog.Button label="Cancel" onPress={() => {setResetEmail(''); setForgotVisible(false)}}/>
          <Dialog.Button label="Reset" style={{color: resetEmail ? 'red' : 'lightgrey'}} onPress={() => resetPassword()}/>
        </Dialog.Container>

        <View style={global.topbar}>
          <Text style={global.topbarTitle}>Login</Text>
        </View>
        <View style={styles.login}>
          <View style={styles.logoContainer}>
            <Image 
              style={styles.logo}
              source={{uri: 'https://imgur.com/Fg7Vv0f.png'}} 
            /> 
          </View>
          <View style={styles.loginContainer}>
              <Text style={styles.title}>Mr. Recipe</Text>
              <View style={{flexDirection: 'row'}}>
                <Icon name='mail-outline' size={20} color={'white'} style={styles.icon}/>
                <TextInput 
                  placeholder="Email Address" 
                  placeholderTextColor={'lightgrey'}
                  style={styles.inputField} 
                  keyboardType='email-address'
                  autoCapitalize={false}
                  maxLength={320}
                  onChangeText={(email) => {setEmail(email)}}
                  onSubmitEditing={() => {loginUser(email, password)}}
                ></TextInput>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Icon name='lock-closed-outline' size={20} color={'white'} style={styles.icon}/>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={'lightgrey'}
                  style={styles.inputField}
                  onChangeText={(password) => {setPassword(password)}}
                  secureTextEntry={true}
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
              <Text onPress={() => setForgotVisible(true)} style={{color: '#518BFF', marginTop: 20}}>Forgot Password?</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    login: {
      height: '87%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      height: 100,
      width: 100,
    },
    loginContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 115,
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
      top: '50%',
      marginTop: -10,
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
    }
  });