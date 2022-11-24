import { StyleSheet, View, Text, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { firebase } from '../../config';

export default function Favorites({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
  setUser(user);
  if (initializing)
    setInitializing(false);
  }

  useEffect(() => {
  const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing)
    return null;

  if (user) {
    return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
              <Text style={styles.topbarTitle}>Favorites</Text>
              <TextInput placeholder='Search for Favorites' style={styles.searchbar}></TextInput>
          </View>
          <View>
              <Text>No way</Text>
          </View>
      </View>
    );
  }

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
              <Text style={styles.topbarTitle}>Favorites</Text>
              <TextInput placeholder='Search for Favorites' style={styles.searchbar}></TextInput>
          </View>
          <View style={{height: '60%', alignItems: 'center', justifyContent: 'center'}}>
            <View style={styles.signinText}>
                <Text style={{fontSize: 24, color: '#518BFF'  }}>Login to see favorites</Text>
                <Text onPress={() => navigation.navigate('Login')} style={{color: '#518BFF'}}>Sign in</Text> 
            </View>
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
      height: '20%',
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
    searchbar: {
      width: 300,
      borderWidth: 5,
      marginTop: 15,
      borderColor: 'white',
      borderRadius: 20,
      padding: 7,
      backgroundColor: 'white',
      color: 'black',
    },
    signinText: {
      width: 300,
      borderWidth: 5,
      marginTop: 15,
      borderColor: 'white',
      borderRadius: 20,
      padding: 7,
      backgroundColor: 'white',
      color: 'black',
    },
  });
  