import { StyleSheet, View, Text, TextInput, Alert, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import global from "../../../Styles";
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import BackArrow from '../../../components/BackArrow';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import Dialog from 'react-native-dialog';

export default function Settings({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [bio, setBio] = useState('');

  const [changedSettings, setChangedSettings] = useState(false);
  const [image, setImage] = useState(null);

  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const[inProgress, setInProgress] = useState(false);


  useEffect(() => {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setUserData(snapshot.data());
        initialize(snapshot.data());
        setLoading(false);
      }
      else
        Alert.alert("Unknown Error Occured", "Contact support with error.")
    })
  }, [])

  const initialize = (snapshot) => {
    setName(snapshot.name);
    setUsername(snapshot.username);
    setOriginalUsername(snapshot.username);
    setBio(snapshot.bio);
  }

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

  const saveSettings = async() => {
    if (changedSettings) {
      const doc = await firebase.firestore().collection('users').where("username_lowercase", "==", username.toLowerCase()).get();
      if (!doc.empty && originalUsername.toLowerCase() != username.toLowerCase()) {
        Alert.alert(
          "Username Taken",
          "Sorry! Someone already has that username."
        );
      }
      else {
        let imgUrl = await uploadPhoto();

        if (imgUrl == null && userData.pfp) {
          imgUrl = userData.pfp;
        }

        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update(
          {name, username, bio, username_lowercase: username.toLowerCase(), pfp: imgUrl}
        )
        .then(() => {
          Alert.alert(
            "Settings Saved",
            "Settings have been successfully saved."
          );
          navigation.navigate('DashboardScreen');
        })
        .catch((error) => {
          alert(error.message);
        })
      }
    }
    setInProgress(false);
  }

  const SaveButton = () => (
    <Text disabled={inProgress} onPress={async() => {setInProgress(true); await saveSettings();}} style={{...styles.save, color: changedSettings ? 'white' : 'grey'}}>Save</Text>
  )

  const choosePhoto = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const source = {uri : result.assets[0].uri};
      setImage(source);
      setChangedSettings(true);
    }
  }

  const uploadPhoto = async() => {
    if (image == null)
      return null;

    const response = await fetch(image.uri);
    const blob = await response.blob();
    const filename = image.uri.substring(image.uri.lastIndexOf('/') + 1);
    var ref = firebase.storage().ref().child(filename).put(blob);
    try { 
      await ref;
      const url = await firebase.storage().ref().child(filename).getDownloadURL();
      return url;
    }
    catch(error) {
      alert(error.message);
    }
  }

  const verify = async() => {
    await firebase.auth().currentUser.reload();
    if (firebase.auth().currentUser.emailVerified) {
      return true;
    }
    else {
      Alert.alert(
        "Verification Required",
        "Do you need a verification email to be sent?",
        [
          {text: "Cancel"},
          {text: "Send", onPress: () => {
            firebase.auth().currentUser.sendEmailVerification({
              handleCodeInApp: true,
              url: 'https://mr-recipe-799e9.firebaseapp.com',
            })
            .then(() => {
              Alert.alert(
                "Verification Sent",
                "A verification email has been sent to your email. Please check your junk mail."
              );
            })
            .catch((error) => {
              switch(error.code) {
                case 'auth/too-many-requests':
                  Alert.alert(
                      "Too Many Requests",
                      "Please check your junk mail for a verification email or wait to send a new one."
                  );
                  break;
                default:
                  alert(error.message);
              }
            })
          }}
        ]
      );
    }
  }

  const changeEmail = async() => {
    if (email != confirmEmail)
        Alert.alert(
            "Emails Don't Match",
            "Emails do not match. Please retry entering your emails."
        );
    else {
      try {
        await firebase.auth().signInWithEmailAndPassword(userData.email, password);
        firebase.auth().currentUser.updateEmail(email)
        .then(() => {
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update(
              {email}
            )
            .then(() => {
              setEmailVisible(false);
              setEmail('');
              setConfirmEmail('');
              setPassword('');

              firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
              .then((snapshot) => {
                if (snapshot.exists) {
                  setUserData(snapshot.data());
                }
                else
                  Alert.alert("Unknown Error Occured", "Contact support with error.")
              })

              Alert.alert(
                  "Email Changed",
                  "Your email has been successfully changed."
              );
            })
            .catch((error) => {
              alert(error.message);
            })  
        })
        .catch((error) => {
            switch(error.code) {
              case 'auth/email-already-in-use':
                Alert.alert(
                  "Email Already Exists",
                  "The email address you entered is already in use by another account. Please retry with a different email address.",
                );
                break;
              default:
                alert(error.message);
            }
        });
      }
      catch(error) {
          switch(error.code) {
              case 'auth/wrong-password':
                  Alert.alert(
                      "Invalid Password",
                      "The current password you have entered is incorrect. Please try again."
                  );
                  break;
              case 'auth/too-many-requests':
                  Alert.alert(
                      "Too Many Requests",
                      "You are creating too many requests. Please try again later."
                  );
                  break;
              default:
                  alert(error.message);
          }
      }
    }
  }

  const changePassword = async() => {
    if (confirmPassword != newPassword)
        Alert.alert(
            "Passwords Don't Match",
            "Passwords do not match. Please retry entering your passwords."
        );
    else if (newPassword.length < 6)
        Alert.alert(
            "Password Too Short",
            "The new password you have entered is too short. Please enter a password with at least 6 characters."
        );
    else if (password == newPassword)
        Alert.alert(
          "Password Not Unique",
          "Your new password should be different from your current password."
        );
    else if (newPassword == confirmPassword) {
      try {
          await firebase.auth().signInWithEmailAndPassword(userData.email, password);
          firebase.auth().currentUser.updatePassword(newPassword)
          .then(() => {
              setPasswordVisible(false);
              setPassword('');
              setNewPassword('');
              setConfirmPassword('');
              Alert.alert(
                  "Password Changed",
                  "Your password has been successfully changed."
              );
          })
          .catch((error) => {
              alert(error.code);
          });
      }
      catch(error) {
          switch(error.code) {
              case 'auth/wrong-password':
                  Alert.alert(
                      "Invalid Password",
                      "The current password you have entered is incorrect. Please try again."
                  );
                  break;
              case 'auth/too-many-requests':
                  Alert.alert(
                      "Too Many Requests",
                      "You are creating too many requests. Please try again later."
                  );
                  break;
              default:
                  alert(error.message);
          }
      }
    }
  }

  const deleteAccount = async() => {
    if (password) {
      try {
        await firebase.auth().signInWithEmailAndPassword(userData.email, password);
        if (userData.pfp) {
          let imageRef = firebase.storage().refFromURL(userData.pfp);
          imageRef.delete();
        }
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).delete();
        firebase.auth().currentUser.delete()
        .then(() => {
          firebase.auth().signOut();
        })
        .catch((error) => {
          alert(error.code);
        });
      }
      catch(error) {
          switch(error.code) {
              case 'auth/wrong-password':
                  Alert.alert(
                      "Invalid Password",
                      "The current password you have entered is incorrect. Please try again."
                  );
                  break;
              case 'auth/too-many-requests':
                  Alert.alert(
                      "Too Many Requests",
                      "You are creating too many requests. Please try again later."
                  );
                  break;
              default:
                  alert(error.code);
          }
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
      <View style={global.appContainer}>

          {/* Delete account pop up */} 
          <Dialog.Container visible={deleteVisible}>
            <Dialog.Title>Delete Account</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this account? You cannot undo this action.
            </Dialog.Description>
            <Dialog.Input
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(pass) => setPassword(pass)}
            />
            <Dialog.Button label="Cancel" onPress={() => {setPassword(''); setDeleteVisible(false)}}/>
            <Dialog.Button label="Delete" style={{color: password ? 'red' : 'lightgrey'}} onPress={() => deleteAccount()}/>
          </Dialog.Container>

          {/* Change email pop up */} 
          <Dialog.Container visible={emailVisible}>
            <Dialog.Title>Change Email</Dialog.Title>
            <Dialog.Description>
              Please enter your new email and current password.
            </Dialog.Description>
            <Dialog.Input
              placeholder="Enter new email"
              keyboardType='email-address'
              autoCapitalize={false}
              maxLength={320}
              onChangeText={(email) => setEmail(email)}
            />
            <Dialog.Input
              placeholder="Confirm new email"
              keyboardType='email-address'
              autoCapitalize={false}
              maxLength={320}
              onChangeText={(email) => setConfirmEmail(email)}
            />
            <Dialog.Input
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(pass) => setPassword(pass)}
            />
            <Dialog.Button label="Cancel" onPress={() => {setEmail(''); setConfirmEmail(''); setPassword(''); setEmailVisible(false)}}/>
            {(!password || !email || !confirmEmail) && <Dialog.Button label="Change" style={{color: 'lightgrey'}}/>}
            {password && email && confirmEmail && <Dialog.Button label="Change" style={{color: 'red'}} onPress={() => changeEmail()}/>}
          </Dialog.Container>

          {/* Change password pop up */} 
          <Dialog.Container visible={passwordVisible}>
            <Dialog.Title>Change Password</Dialog.Title>
            <Dialog.Description>
              Please enter your current password and new password.
            </Dialog.Description>
            <Dialog.Input
              placeholder="Enter current password"
              secureTextEntry={true}
              onChangeText={(pass) => setPassword(pass)}
            />
            <Dialog.Input
              placeholder="Enter new password"
              secureTextEntry={true}
              onChangeText={(pass) => setNewPassword(pass)}
            />
            <Dialog.Input
              placeholder="Confirm new password"
              secureTextEntry={true}
              onChangeText={(pass) => setConfirmPassword(pass)}
            />
            <Dialog.Button label="Cancel" onPress={() => {setPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordVisible(false)}}/>
            {(!password || !newPassword || !confirmPassword) && <Dialog.Button label="Change" style={{color: 'lightgrey'}}/>}
            {password && newPassword && confirmPassword && <Dialog.Button label="Change" style={{color: 'red'}} onPress={() => changePassword()}/>}
          </Dialog.Container>

          {/* Main Content */}
          <View style={global.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={global.topbarTitle}>Settings</Text>
            <SaveButton/>
          </View>
          <View style={styles.settingsContainer}>
            <View style={styles.profile}>
              <TouchableOpacity disabled={inProgress} onPress={() => choosePhoto()}>
                <View>                
                  {image && <Image source={{uri: image.uri}} style={styles.profilePicture}/>}
                  {loading && <Image style={styles.profilePicture}/>}
                  {!loading && !image && <Image source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}} style={styles.profilePicture}/>}
                  <Icon name="camera-outline" size={40} color='white' style={styles.camera}/>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.section}>PROFILE</Text>
            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Name</Text>
                <TextInput
                  placeholder="Enter a name"
                  placeholderTextColor='#818181'
                  maxLength={18}
                  editable={!inProgress}
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
                  editable={!inProgress}
                  value={username}
                  onChangeText={(newUsername) => updateSettings('username', newUsername)}
                  style={styles.input}
                ></TextInput>
              </View>
              <View style={{height: 100, ...styles.field, alignItems: 'flex-start'}}>
                <Text style={styles.fieldTitle}>Bio</Text>
                <TextInput 
                  placeholder='Add a bio to your profile'
                  placeholderTextColor='#818181'
                  multiline={true}
                  maxLength={150}
                  blurOnSubmit={true}
                  editable={!inProgress}
                  value={bio}
                  height={70}
                  textAlignVertical='top'
                  onChangeText={(newBio) => updateSettings('bio', newBio)}
                  style={{...styles.input, paddingTop: 0, width: 200}}
                ></TextInput>
                <Text style={{color: '#494949', position: 'absolute', right: 10, bottom: 5}}>{bio.length}/150</Text>
              </View>
            </View>

            <View style={{height: 50}}>
              <Text style={{...styles.section, paddingTop: 20, height: 50}}>ACCOUNT</Text>
            </View>
            
            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Email</Text>
                <TextInput
                  value={userData.email}
                  editable={false}
                  onChangeText={(newEmail) => updateSettings('name', newEmail)}
                  style={styles.input}
                ></TextInput>
                <Text onPress={async() => {if (await verify()) setEmailVisible(true)}} style={styles.changeText}>Change</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldTitle}>Password</Text>
                <TextInput
                  secureTextEntry
                  value='......'
                  editable={false}
                  onChangeText={(newUsername) => updateSettings('username', newUsername)}
                  style={styles.input}
                ></TextInput>
                <Text onPress={async() => {if (await verify()) setPasswordVisible(true)}} style={styles.changeText}>Change</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity disabled={inProgress} onPress={() => firebase.auth().signOut()} style={{...styles.button, backgroundColor: '#518BFF'}}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={inProgress} onPress={async() => {if (await verify()) setDeleteVisible(true)}} style={{...styles.button, backgroundColor: 'red'}}>
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
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
      paddingLeft: 30,
      paddingRight: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#363636',
      alignItems: 'center',
    },
    fieldTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#518BFF',
      marginRight: 15,
      width: 90,
    },
    input: {
      fontSize: 15,
      color: 'white',
      width: 180,
      marginRight: 10,
    },
    changeText: {
      color: '#518BFF',
      marginLeft: 'auto',
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
  });