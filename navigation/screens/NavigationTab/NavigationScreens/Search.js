import { StyleSheet, View, Text, TextInput } from "react-native";
import global from "../../../../Styles";
import { useState, useEffect } from "react";
import { firebase } from '../../../../config';

export default function Search({ navigation }) {
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
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Search</Text>
              <TextInput placeholder='Search for People and Recipes' style={global.searchbar}></TextInput>
          </View>
          <View>
              <Text>No way</Text>
          </View>
      </View>
    );
  }

  return (
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Search</Text>
              <TextInput placeholder='Search for People and Recipes' style={global.searchbar}></TextInput>
          </View>
          <View style={{height: '74%', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>You are currently logged out.</Text>
            <Text style={{fontSize: 18, marginTop: 15, color: 'white'}}><Text onPress={() => navigation.navigate('Login')} style={{fontSize: 18, color: '#518BFF'}}>Sign in</Text> to search</Text>
          </View>
      </View>
  );
}
  
const styles = StyleSheet.create({
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
  });
  