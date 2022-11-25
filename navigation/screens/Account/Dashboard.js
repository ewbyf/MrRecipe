import { StyleSheet, View, Text, TextInput, Button, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";

export default function Dashboard({ navigation }) {
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
        Alert.alert("Unknown Error Occured", "User doesn't exist?")
    })
  },[])

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
              <Text style={styles.topbarTitle}>Dashboard</Text>
          </View>
          <View style={styles.dashboard}>
            <Text>{name}</Text>
            <Text>@{username}</Text>
            <Button title='Sign out' onPress={() => firebase.auth().signOut()}/>
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
    dashboard: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
    },
  });