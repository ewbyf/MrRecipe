import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';
import BackArrow from '../../../components/BackArrow';


export default function ForgotPassword({ navigation }){
  const [email, setEmail] = useState('');

  const forgotPassword = async(email) => {
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert("Your password reset email has been sent!");
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
      <View style={styles.appcontainer}> 
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Reset Password</Text>
          </View>
          <View style={styles.forgotContainer}>
              <View style={styles.logoContainer}>
                <Image 
                    style={styles.logo}
                    source={{uri: 'https://imgur.com/Fg7Vv0f.png'}} 
                  /> 
              </View>
            <Text style={styles.title}>Mr. Recipe</Text>
            <View style={{flexDirection: 'row'}}>
              <Icon name='mail-outline' size={20} color={'white'} style={styles.icon}/>
              <TextInput 
                placeholder="Email Address" 
                placeholderTextColor={'lightgrey'}
                style={styles.inputField} 
                keyboardType='email-address'
                onChangeText={(email) => {setEmail(email)}}
                autoCapitalize={false}
                onSubmitEditing={() => forgotPassword(email)}
              ></TextInput>
            </View>
        
            <TouchableOpacity onPress={() => forgotPassword(email)} style={styles.button}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
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
    forgotContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      height: 100,
      width: 100,
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
    button: {
      backgroundColor: '#518BFF',
      width: 200,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 115,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    }
  });