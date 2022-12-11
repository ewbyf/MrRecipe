import { StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { useState } from "react";
import { firebase } from '../../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import BackArrow from '../../../components/BackArrow';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const usersDB = firebase.firestore().collection('users');

  const registerUser = async(email, password, name, username) => {
    const snapshot = await usersDB.where('username_lowercase', '==', username.toLowerCase()).get();
    if (!snapshot.empty)
      Alert.alert(
        "User Already Exists",
        "An account with that username has already been created. Please login or retry using a different username."
      );
    else if (!password || !confirmPassword)
      Alert.alert(
        "Missing Password",
        "Please enter and confirm your password in the input fields."
      );
    else if (confirmPassword != password)
      Alert.alert(
        "Passwords Don't Match",
        "Passwords do not match. Please retry entering your password."
      );
    else if (!name)
      Alert.alert(
        "Missing Name",
        "Please enter your name into the input field."
      );
    else if (!username)
      Alert.alert(
        "Missing Username",
        "Please enter your username into the input field."
      );
    else {
      await firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        let username_lowercase = username.toLowerCase();
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({name, username, username_lowercase, email, bio})
      })
      .catch((error) => {
        switch(error.code) {
          case 'auth/weak-password':
            Alert.alert(
              "Weak Password",
              "Password should be at least 6 characters long."
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
          case 'auth/email-already-in-use':
            Alert.alert(
              "Email Already Exists",
              "The email address you entered is already in use by another account. Please login or retry with a different email address.",
            );
            break;
          default:
            alert(error.message);
        }
      })
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
              <BackArrow navigation={navigation}/>
              <Text style={styles.topbarTitle}>Register</Text>
          </View>
          
          <View style={styles.register}>
              <Text style={styles.title}>Mr. Recipe</Text>
              <View style={{flexDirection: 'row'}}>
                <Icon name='person-circle-outline' size={20} color={'lightgrey'} style={styles.icon}/>
                <TextInput 
                  placeholder="Name"
                  style={styles.inputField}
                  onChangeText={(name) => {setName(name)}}
                  autoCorrect={false}
                  maxLength={18}
                  onSubmitEditing={() => {registerUser(email, password, name, username)}}
                ></TextInput>
              </View> 
              <View style={{flexDirection: 'row'}}>
                <Icon name='person-outline' size={20} color={'lightgrey'} style={styles.icon}/>
                <TextInput
                  placeholder="Username"
                  style={styles.inputField}
                  onChangeText={(username) => {setUsername(username)}}
                  autoCorrect={false}
                  maxLength={12}
                  onSubmitEditing={() => {registerUser(email, password, name, username)}}
                ></TextInput>
              </View>
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
                  onSubmitEditing={() => {registerUser(email, password, name, username)}}
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
                    onSubmitEditing={() => {registerUser(email, password, name, username)}}
                  ></TextInput>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Icon name='lock-closed' size={20} color={'lightgrey'} style={styles.icon}/>
                <TextInput
                  placeholder="Confirm Password"
                  style={styles.inputField}
                  onChangeText={(confirmPassword) => {setConfirmPassword(confirmPassword)}}
                  secureTextEntry={true}
                  autoCapitalize={false}
                  autoCorrect={false}
                  onSubmitEditing={() => {registerUser(email, password, name, username)}}
                ></TextInput>
              </View>

                <TouchableOpacity style={styles.button} onPress={() => registerUser(email, password, name, username)}>
                  <Text style={styles.buttonText}>Sign up
                  </Text>
                </TouchableOpacity>
          </View>
      </View>
    </TouchableWithoutFeedback>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#518BFF',
    },
    topbarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    register: {
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
    },
    buttonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
    icon: {
      position: 'absolute',
      left: 0,
      top: 10
    },
  });