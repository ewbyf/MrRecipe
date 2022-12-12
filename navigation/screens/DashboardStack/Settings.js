import { StyleSheet, View, Text, TextInput, Alert, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import BackArrow from '../../../components/BackArrow';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet from 'reanimated-bottom-sheet'
import Animated from 'react-native-reanimated';
import React from "react";

export default function Settings({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  const [changedSettings, setChangedSettings] = useState(false);
  const [image, setImage] = useState(null);
  const [open, setOpen] = useState(false);

  const bs = React.createRef();
  const fall = new Animated.Value(1);

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

  const saveSettings = async() => {
    if (changedSettings) {
      const doc = await firebase.firestore().collection('users').where("username_lowercase", "==", username.toLowerCase()).get();
      if (!doc.empty) {
        Alert.alert(
          "Username Taken",
          "Sorry! Someone already has that username."
        );
      }
      else {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update(
          {name, username, bio, username_lowercase: username.toLowerCase()}
        )
        .then(() => {
          Alert.alert(
            "Settings Saved",
            "Settings have been successfully saved."
          );
          navigation.navigate('DashboardScreen');
        })
        .catch((error) => {
          alert(error.code);
        })
      }
    }
  }

  const changePfp = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  )

  const renderInner = () => (
    <View style={styles.panel}>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.panelTitle}>Upload Photo</Text>
        <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
      </View>
      <TouchableOpacity style={styles.panelButton}>
        <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.panelButton}>
        <Text style={styles.panelButtonTitle}>Choose From Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => bs.current.snapTo(1)}>
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <TouchableWithoutFeedback onPress={() => {bs.current.snapTo(1); Keyboard.dismiss()}}>
      <View style={styles.appcontainer}>
        <BottomSheet
              ref={bs}
              snapPoints={[330, 0]}
              initialSnap={1}
              renderContent={renderInner}
              renderHeader={renderHeader}
              onOpenStart={() => setOpen(true)}
              onCloseStart={() => setOpen(false)}
              callbackNode={fall}
              enabledGestureInteraction={true}
          />
        <Animated.View style={{height: '100%', opacity: Animated.add(0.1, Animated.multiply(fall, 1.0))}}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Settings</Text>
            <SaveButton/>
          </View>
          <View style={styles.settingsContainer}>
            <View style={styles.profile}>
              <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
                <View>                
                  <Image source={require('../../../assets/walter.jpg')} style={styles.profilePicture}/>
                  <Icon name="camera-outline" size={40} color='white' style={styles.camera}/>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.section}>Profile</Text>
            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Name</Text>
                <TextInput
                  placeholder="Enter a name"
                  placeholderTextColor='#818181'
                  maxLength={18}
                  editable={!open}
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
                  textAlignVertical='top'
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
                <Text onPress={() => navigation.navigate('ChangePasswordScreen')} style={styles.changeText}>Change</Text>
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
        </Animated.View>
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
      opacity: .3,
    },
    camera: {
      position: 'absolute',
      top: '50%',
    },
    section: {
      color: 'grey',
      fontSize: 14,
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
      fontSize: 16,
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
    changeText: {
      color: '#518BFF',
      position: 'absolute',
      right: 20,
      top: '50%',
      marginTop: 4,
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
    },
    panel: {
      padding: 20,
      backgroundColor: 'white',
      paddingTop: 20,
    },
    header: {
      backgroundColor: 'white',
      shadowColor: '#333333',
      shadowOffset: {width: -1, height: -3},
      shadowRadius: 2,
      shadowOpacity: 0.4,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    panelHeader: {
      alignItems: 'center',
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
    },
    panelTitle: {
      fontSize: 27,
      height: 35,
    },
    panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10,
    },
    panelButton: {
      padding: 13,
      borderRadius: 10,
      backgroundColor: '#FF6347',
      alignItems: 'center',
      marginVertical: 7,
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
    
  });