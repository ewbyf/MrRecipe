import { StyleSheet, View, Text, TextInput, Alert, Image, TouchableOpacity } from "react-native";
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import BackArrow from '../../../components/BackArrow';

export default function Settings({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  const [changedSettings, setChangedSettings] = useState(false);

  useEffect(() => {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setName(snapshot.data().name);
        setUsername(snapshot.data().username);
        setBio(snapshot.data().bio);
        setEmail(snapshot.data().email);
      }
      else
        Alert.alert("Unknown Error Occured", "Contact support with error.")
    })
  },[])

  const updateSettings = (type, value) => {
    if (type == 'name') {
      setName(value);
    }
    else if (type == 'username') {
      setUsername(value);
    }
    else if (type == 'bio') {
      setBio(value);
    }
    else if (type == 'email') {
      setEmail(value);
    }

    setChangedSettings(true);
    if (value == '' && type != 'bio')
      setChangedSettings(false);
  }

  const SaveButton = ({onPress}) => (
    <Text onPress={() => saveSettings()}style={{...styles.save, color: changedSettings ? 'white' : 'grey'}}>Save</Text>
  )

  const saveSettings = () => {
    if (changedSettings) {
      Alert.alert(
        "Settings Saved",
        "Settings have been successfully saved."
      );
      navigation.navigate('DashboardScreen');
    }
  }

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Settings</Text>
            <SaveButton/>
          </View>
          <View style={styles.settingsContainer}>
            <View style={styles.profile}>
              <Image source={require('../../../assets/walter.jpg')} style={styles.profilePicture}
              />
            </View>
            <Text style={styles.section}>Profile</Text>
            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Name</Text>
                <TextInput
                  placeholder="Enter a name"
                  placeholderTextColor='#818181'
                  maxLength={18}
                  value={name}
                  onChangeText={(newName) => updateSettings('name', newName)}
                  style={styles.input}
                ></TextInput>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldTitle}>Username</Text>
                <TextInput
                  placeholder="Enter a username"
                  placeholderTextColor='#818181'
                  maxLength={12}
                  value={username}
                  onChangeText={(newUsername) => updateSettings('username', newUsername)}
                  style={styles.input}
                ></TextInput>
              </View>
              <View style={{height: 100, ...styles.field}}>
                <Text style={styles.fieldTitle}>Bio</Text>
                <TextInput 
                  placeholder='Add a bio to your profile'
                  placeholderTextColor='#818181'
                  multiline={true}
                  maxLength={100}
                  value={bio}
                  onChangeText={(newBio) => updateSettings('bio', newBio)}
                  style={{...styles.input, paddingTop: 0}}
                ></TextInput>
              </View>
            </View>

            <View style={{height: 50}}>
              <Text style={{...styles.section, paddingTop: 20, height: 50}}>Account</Text>
            </View>
            
            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Email</Text>
                <TextInput
                  placeholder="Enter an email"
                  placeholderTextColor='#818181'
                  maxLength={320}
                  value={email}
                  onChangeText={(newEmail) => updateSettings('name', newEmail)}
                  style={styles.input}
                ></TextInput>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldTitle}>Password</Text>
                <TextInput
                  placeholder="Enter a username"
                  placeholderTextColor='#818181'
                  secureTextEntry
                  value={username}
                  onChangeText={(newUsername) => updateSettings('username', newUsername)}
                  style={styles.input}
                ></TextInput>
                <Text onPress={() => navigation.navigate('ChangePasswordScreen')} style={{color: '#518BFF'}}>Change</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => firebase.auth().signOut()} style={{...styles.button, backgroundColor: '#518BFF'}}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => firebase.auth().signOut()} style={{...styles.button, backgroundColor: 'red'}}>
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
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
    topbarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    save: {
      position: 'absolute',
      right: 20,
      bottom: '50%',
      marginBottom: -11,
      fontSize: 18,
      fontWeight: 'bold',
    },
    settingsContainer: {
      flexDirection: 'column',
      maxHeight: '75%'
    },
    profile: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: 20,
    },
    profilePicture: {
      borderRadius: 50,
      height: 100,
      width: 100,
      marginTop: 10,
    },
    section: {
      color: 'grey',
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 6,
      paddingLeft: 30,
    },
    field: {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: '#363636',
    },
    fieldTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#518BFF',
      marginRight: 20,
      width: 90,
    },
    input: {
      fontSize: 16,
      color: 'white',
      width: 225,
    },
    footer: {
      marginTop: 'auto',
      width: '100%',
      alignItems: 'center',
      paddingBottom: 40,
    },
    button: {
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