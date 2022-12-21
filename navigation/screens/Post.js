import { StyleSheet, View, TouchableOpacity, Text, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { firebase } from '../../config';
import BackArrow from '../../components/BackArrow';

export default function Post({ navigation }) {
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
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Recipes</Text>
          </View>
          <View styles={styles.items}>
              <TextInput
                placeholder="Recipe Name"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Preparation Time"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Cooking Time"
                style={styles.input_container}
              ></TextInput>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Publish</Text>
              </TouchableOpacity>
          </View>
      </View>
    );
  }

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Recipes</Text>
          </View>
          <View style={{height: '74%', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>You are currently logged out.</Text>
            <Text style={{fontSize: 18, marginTop: 15, color: 'white'}}><Text onPress={() => navigation.navigate('Login')} style={{fontSize: 18, color: '#518BFF'}}>Sign in</Text> to post recipes</Text>
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
      backgroundColor: '#518BFF',
      color: 'black',
      flexDirection: 'row',
      marginTop: 20
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
    items: {
      height: '87%',
      alignItems: 'center',
      justifyContent: 'center',
    },  
    input_container: {
      borderWidth: 0.5,
      padding: 15,
      fontSize: 16,
      marginTop: 20,
      borderRadius: 50,
      backgroundColor: 'white'
    }
  });
  