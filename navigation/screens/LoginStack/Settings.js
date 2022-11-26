import { StyleSheet, View, Text, TextInput, Button, Alert, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";

export default function Settings({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setName(snapshot.data().name);
        setUsername(snapshot.data().username);
      }
      else
        Alert.alert("Unknown Error Occured", "Contact support with error.")
    })
  },[])

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <Icon name='arrow-back-outline' size={24} color='white' style={styles.backArrow} onPress={() => {navigation.goBack(null)}}/>
              <Text style={styles.topbarTitle}>Settings</Text>
          </View>
          <View style={styles.settingsContainer}>
            <View style={{flexDirection: 'row',width: '100%'}}>
              <View>
                <Image source={require('../../../assets/walter.jpg')} style={styles.profilePicture}
                />  
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.username}>@{username}</Text>
              </View>
            </View>
            <View style={styles.bioContainer}>
              <Text style={styles.bio}>Bio</Text>
              <TextInput></TextInput>
            </View>
            <View style={styles.postsContainer}>
              <Text style={styles.postsTitle}>
                POSTS
              </Text>
              <Text style={{color: 'lightgrey', fontSize: 16}}>
                User has not posted any recipes
              </Text>
            </View>
            <Button title='Sign out' onPress={() => firebase.auth().signOut()}/>
          </View>
      </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#518BFF',
    },
    backArrow: {
        position: 'absolute',
        left: 20,
        bottom: '50%',
        marginBottom: -12,
    },
    topbarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    settingsContainer: {
      flexDirection: 'column',
      maxHeight: '75%'
    },
    profilePicture: {
      borderRadius: 50,
      height: 100,
      width: 100,
      margin: 10
    },
    name: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
    username: {
      color: '#C9C9C9',
      fontSize: 16,
      textAlign: 'center',
      marginVertical: 3,
    },
    bioContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '80%',
      marginHorizontal: '10%',
      paddingHorizontal: 10,
      paddingVertical: 12,
      paddingBottom: 20,
      borderBottomWidth: 3,
      borderColor: 'white',
    },
    bio: {
        fontSize: 16,
        color: 'white',
    },
    backArrow: {
        position: 'absolute',
        left: 20,
        bottom: '50%',
        marginBottom: -12,
    },
  });