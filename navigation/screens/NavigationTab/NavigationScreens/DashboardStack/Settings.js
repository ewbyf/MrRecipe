import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import global from "../../../../../Styles";
import { firebase } from "../../../../../config";
import { useState, useEffect } from "react";
import BackArrow from "../../../../../components/BackArrow";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Dialog from "react-native-dialog";
import { showMessage } from "react-native-flash-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FastImage from 'react-native-fast-image';

export default function Settings({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [bio, setBio] = useState("");

  const [changedSettings, setChangedSettings] = useState(false);
  const [image, setImage] = useState(null);

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signOut, setSignOut] = useState(false);

  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUserData(snapshot.data());
          initialize(snapshot.data());
          setLoading(false);
        }
      });
  }, []);

  const initialize = (snapshot) => {
    setName(snapshot.name);
    setUsername(snapshot.username);
    setOriginalUsername(snapshot.username);
    setBio(snapshot.bio);
  };

  const updateSettings = (type, value) => {
    if (type == "name") {
      setName(value);
    } else if (type == "username") {
      setUsername(value);
    } else if (type == "bio") {
      setBio(value);
    } else if (type == "email") {
      setEmail(value);
    }

    setChangedSettings(true);
    if (value == "" && type != "bio") setChangedSettings(false);
  };

  const saveSettings = async () => {
    if (changedSettings) {
      const doc = await firebase
        .firestore()
        .collection("users")
        .where("username_lowercase", "==", username.toLowerCase())
        .get();
      if (
        !doc.empty &&
        originalUsername.toLowerCase() != username.toLowerCase()
      ) {
        showMessage({
          message: "Username already taken",
          icon: "danger",
          type: "danger",
        });
      } else {
        let imgUrl = await uploadPhoto();

        if (imgUrl == null && userData.pfp) {
          imgUrl = userData.pfp;
        } else if (userData.pfp) {
          let imageRef = firebase.storage().refFromURL(userData.pfp);
          imageRef.delete();
        }

        await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            name,
            name_lowercase: name.toLowerCase(),
            name_array: name.toLowerCase().match(/\b(\w+)\b/g),
            username,
            bio,
            username_lowercase: username.toLowerCase(),
            pfp: imgUrl,
          })
          .then(() => {
            showMessage({
              message: "Settings successfully saved!",
              type: "success",
            });
            navigation.navigate("DashboardScreen");
          })
          .catch((error) => {
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
          });
      }
    }
    setInProgress(false);
  };

  const SaveButton = () => (
    <Text
      disabled={inProgress || !changedSettings}
      onPress={async () => {
        setInProgress(true);
        await saveSettings();
      }}
      style={{ ...styles.save, color: changedSettings ? "white" : "grey" }}
    >
      Save
    </Text>
  );

  const choosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
    });

    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      setImage(source);
      setChangedSettings(true);
    }
  };

  const uploadPhoto = async () => {
    if (image == null) return null;

    const response = await fetch(image.uri);
    const blob = await response.blob();
    const filename = image.uri.substring(image.uri.lastIndexOf("/") + 1);
    var ref = firebase.storage().ref().child(filename).put(blob);
    try {
      await ref;
      const url = await firebase
        .storage()
        .ref()
        .child(filename)
        .getDownloadURL();
      return url;
    } catch (error) {
      showMessage({
        message: error.message,
        icon: "danger",
        type: "danger",
      });
    }
  };

  const verify = async () => {
    await firebase.auth().currentUser.reload();
    if (firebase.auth().currentUser.emailVerified) {
      return true;
    } else {
      Alert.alert(
        "Verification Required",
        "Do you need a verification email to be sent?",
        [
          { text: "Cancel" },
          {
            text: "Send",
            onPress: () => {
              firebase
                .auth()
                .currentUser.sendEmailVerification({
                  handleCodeInApp: true,
                  url: "https://mr-recipe-799e9.firebaseapp.com",
                })
                .then(() => {
                  showMessage({
                    message:
                      "Verification email has been sent. Please check your junk mail",
                    type: "success",
                  });
                })
                .catch((error) => {
                  switch (error.code) {
                    case "auth/too-many-requests":
                      showMessage({
                        message: "Too many requests. Try again later",
                        icon: "danger",
                        type: "danger",
                      });
                      break;
                    default:
                      showMessage({
                        message: error.message,
                        icon: "danger",
                        type: "danger",
                      });
                  }
                });
            },
          },
        ]
      );
    }
  };

  const changeEmail = async () => {
    if (email != confirmEmail)
      showMessage({
        message: "Emails don't match",
        icon: "danger",
        type: "danger",
      });
    else {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(userData.email, password);
        firebase
          .auth()
          .currentUser.updateEmail(email)
          .then(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid)
              .update({ email })
              .then(() => {
                setEmailVisible(false);
                setEmail("");
                setConfirmEmail("");
                setPassword("");

                firebase
                  .firestore()
                  .collection("users")
                  .doc(firebase.auth().currentUser.uid)
                  .get()
                  .then((snapshot) => {
                    if (snapshot.exists) {
                      setUserData(snapshot.data());
                    }
                  });

                showMessage({
                  message: "Email successfully changed!",
                  type: "success",
                });
              })
              .catch((error) => {
                showMessage({
                  message: error.message,
                  icon: "danger",
                  type: "danger",
                });
              });
          })
          .catch((error) => {
            switch (error.code) {
              case "auth/email-already-in-use":
                showMessage({
                  message: "Email already exists",
                  icon: "danger",
                  type: "danger",
                });
                break;
              default:
                showMessage({
                  message: error.message,
                  icon: "danger",
                  type: "danger",
                });
            }
          });
      } catch (error) {
        switch (error.code) {
          case "auth/wrong-password":
            showMessage({
              message: "Invalid password entered",
              icon: "danger",
              type: "danger",
            });
            break;
          case "auth/too-many-requests":
            showMessage({
              message: "Too many requests. Try again later",
              icon: "danger",
              type: "danger",
            });
            break;
          default:
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
        }
      }
    }
  };

  const changePassword = async () => {
    if (confirmPassword != newPassword)
      showMessage({
        message: "Passwords don't match",
        icon: "danger",
        type: "danger",
      });
    else if (newPassword.length < 6)
      showMessage({
        message: "Password should be at least 6 characters",
        icon: "danger",
        type: "danger",
      });
    else if (password == newPassword)
      showMessage({
        message: "Password is the same as previous",
        icon: "danger",
        type: "danger",
      });
    else if (newPassword == confirmPassword) {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(userData.email, password);
        firebase
          .auth()
          .currentUser.updatePassword(newPassword)
          .then(() => {
            setPasswordVisible(false);
            setPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showMessage({
              message: "Password successfully changed!",
              type: "success",
            });
          })
          .catch((error) => {
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
          });
      } catch (error) {
        switch (error.code) {
          case "auth/wrong-password":
            showMessage({
              message: "Invalid password entered",
              icon: "danger",
              type: "danger",
            });
            break;
          case "auth/too-many-requests":
            showMessage({
              message: "Too many requests. Try again later",
              icon: "danger",
              type: "danger",
            });
            break;
          default:
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
        }
      }
    }
  };

  const deleteAccount = async () => {
    if (password) {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(userData.email, password);
        if (userData.pfp) {
          let imageRef = firebase.storage().refFromURL(userData.pfp);
          imageRef.delete();
        }

        // Deletes comments
        await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then(async (snap) => {
            await snap.data().comments.map((item) => {
              firebase
                .firestore()
                .collection("recipes")
                .doc(item.recipe)
                .get()
                .then(async (snap2) => {
                  if (snap2.exists) {
                    let temp = snap2.data().comments;
                    temp.splice(
                      temp.findIndex((i) => i.key == item.key),
                      1
                    );
                    await firebase
                      .firestore()
                      .collection("recipes")
                      .doc(item.recipe)
                      .update({ comments: temp });
                  }
                });
            });

            // Deletes ratings
            await snap.data().ratings.map((doc) => {
              firebase
                .firestore()
                .collection("recipes")
                .doc(doc)
                .get()
                .then(async (snap2) => {
                  if (snap2.exists) {
                    let temp = snap2.data().rated;
                    let numratings = snap2.data().numratings - 1;
                    let rating =
                      (snap2.data().rating * snap2.data().numratings -
                        temp[firebase.auth().currentUser.uid]) /
                      numratings;
                    let weight =
                      rating + 5 * (1 - Math.E ** (-numratings / 50));

                    delete temp[firebase.auth().currentUser.uid];

                    await firebase
                      .firestore()
                      .collection("recipes")
                      .doc(doc)
                      .update({ rated: temp, numratings, rating, weight });
                  }
                });
            });

            // Deletes recipes
            await snap.data().recipes.map((doc) => {
              firebase
                .firestore()
                .collection("recipes")
                .doc(doc)
                .get()
                .then((snap2) => {
                  if (snap2.exists) {
                    if (snap2.data().image) {
                      let imageRef = firebase
                        .storage()
                        .refFromURL(snap2.data().image);
                      imageRef.delete();
                    }
                  }
                });

              firebase.firestore().collection("recipes").doc(doc).delete();
            });
          });

        await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .delete();
        await firebase
          .auth()
          .currentUser.delete()
          .then(() => {
            firebase.auth().signOut();
            showMessage({
              message: "Account successfully deleted!",
              type: "success",
            });
          })
          .catch((error) => {
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
          });
      } catch (error) {
        switch (error.code) {
          case "auth/wrong-password":
            showMessage({
              message: "Invalid password entered",
              icon: "danger",
              type: "danger",
            });
            break;
          case "auth/too-many-requests":
            showMessage({
              message: "Too many requests. Try again later",
              icon: "danger",
              type: "danger",
            });
            break;
          default:
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
        }
      }
    }
  };

  const convertName = (text) => {
    return text.replace(/[\[\]]/g, "");
  };

  const convertUsername = (text) => {
    return text.replace(/[^0-9a-zA-Z_.-]/g, "");
  };

  return (
    <View style={global.appContainer}>
      {/* Sign out pop up */}
      <Dialog.Container visible={signOut}>
        <Dialog.Title>Sign out</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to sign out?
        </Dialog.Description>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setSignOut(false);
          }}
        />
        <Dialog.Button
          label="Sign Out"
          style={{ color: "red" }}
          onPress={() => {
            firebase.auth().signOut();
            showMessage({
              message: "Successfully signed out!",
              type: "success",
            });
          }}
        />
      </Dialog.Container>

      {/* Delete account pop up */}
      <Dialog.Container visible={deleteVisible}>
        <Dialog.Title>Delete Account</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this account? You cannot undo this
          action.
        </Dialog.Description>
        <Dialog.Input
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(pass) => setPassword(pass)}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setPassword("");
            setDeleteVisible(false);
          }}
        />
        <Dialog.Button
          label="Delete"
          style={{ color: password ? "red" : "lightgrey" }}
          onPress={() => deleteAccount()}
        />
      </Dialog.Container>

      {/* Change email pop up */}
      <Dialog.Container visible={emailVisible}>
        <Dialog.Title>Change Email</Dialog.Title>
        <Dialog.Description>
          Please enter your new email and current password.
        </Dialog.Description>
        <Dialog.Input
          placeholder="Enter new email"
          keyboardType="email-address"
          autoCapitalize={false}
          maxLength={320}
          onChangeText={(email) => setEmail(email)}
        />
        <Dialog.Input
          placeholder="Confirm new email"
          keyboardType="email-address"
          autoCapitalize={false}
          maxLength={320}
          onChangeText={(email) => setConfirmEmail(email)}
        />
        <Dialog.Input
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(pass) => setPassword(pass)}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setEmail("");
            setConfirmEmail("");
            setPassword("");
            setEmailVisible(false);
          }}
        />
        {(!password || !email || !confirmEmail) && (
          <Dialog.Button label="Change" style={{ color: "lightgrey" }} />
        )}
        {password && email && confirmEmail && (
          <Dialog.Button
            label="Change"
            style={{ color: "red" }}
            onPress={() => changeEmail()}
          />
        )}
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
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordVisible(false);
          }}
        />
        {(!password || !newPassword || !confirmPassword) && (
          <Dialog.Button label="Change" style={{ color: "lightgrey" }} />
        )}
        {password && newPassword && confirmPassword && (
          <Dialog.Button
            label="Change"
            style={{ color: "red" }}
            onPress={() => changePassword()}
          />
        )}
      </Dialog.Container>

      {/* Main Content */}
      <View style={global.topbar}>
        <BackArrow navigation={navigation} />
        <Text style={global.topbarTitle}>Settings</Text>
        <SaveButton />
      </View>
      <KeyboardAwareScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <TouchableOpacity disabled={inProgress} onPress={() => choosePhoto()}>
            <View>
              {image && (
                <FastImage
                  source={{ uri: image.uri }}
                  style={styles.profilePicture}
                />
              )}
              {loading && <FastImage style={styles.profilePicture} />}
              {!loading && !image && (
                <FastImage
                  source={{
                    uri: userData.pfp
                      ? userData.pfp
                      : "https://imgur.com/hNwMcZQ.png",
                  }}
                  style={styles.profilePicture}
                />
              )}
              <Icon
                name="camera-outline"
                size={40}
                color="white"
                style={styles.camera}
              />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>PROFILE</Text>
        <View>
          <View
            style={{
              ...styles.field,
              borderTopWidth: 1,
              borderTopColor: "#363636",
            }}
          >
            <Text style={styles.fieldTitle}>Name</Text>
            <TextInput
              placeholder="Enter a name"
              placeholderTextColor="#818181"
              maxLength={18}
              editable={!inProgress}
              value={name}
              onChangeText={(newName) =>
                updateSettings("name", convertName(newName))
              }
              style={styles.input}
            ></TextInput>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldTitle}>Username</Text>
            <TextInput
              placeholder="Enter a username"
              placeholderTextColor="#818181"
              maxLength={12}
              editable={!inProgress}
              value={username}
              onChangeText={(newUsername) =>
                updateSettings("username", convertUsername(newUsername))
              }
              style={styles.input}
            ></TextInput>
          </View>
          <View
            style={{ height: 100, ...styles.field, alignItems: "flex-start" }}
          >
            <Text style={styles.fieldTitle}>Bio</Text>
            <TextInput
              placeholder="Add a bio to your profile"
              placeholderTextColor="#818181"
              multiline={true}
              maxLength={80}
              blurOnSubmit={true}
              editable={!inProgress}
              value={bio}
              height={70}
              textAlignVertical="top"
              onChangeText={(newBio) => updateSettings("bio", newBio)}
              style={{ ...styles.input, paddingTop: 0, width: 200 }}
            ></TextInput>
            <Text
              style={{
                color: "#494949",
                position: "absolute",
                right: 10,
                bottom: 5,
              }}
            >
              {bio.length}/80
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }}>
          <Text style={{ ...styles.section, paddingTop: 20, height: 50 }}>
            ACCOUNT
          </Text>
        </View>
        <View>
          <View
            style={{
              ...styles.field,
              borderTopWidth: 1,
              borderTopColor: "#363636",
            }}
          >
            <Text style={styles.fieldTitle}>Email</Text>
            <TextInput
              value={userData.email}
              editable={false}
              onChangeText={(newEmail) => updateSettings("name", newEmail)}
              style={styles.input}
            ></TextInput>
            <Text
              onPress={async () => {
                if (await verify()) setEmailVisible(true);
              }}
              style={styles.changeText}
            >
              Change
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldTitle}>Password</Text>
            <TextInput
              secureTextEntry
              value="......"
              editable={false}
              onChangeText={(newUsername) =>
                updateSettings("username", newUsername)
              }
              style={styles.input}
            ></TextInput>
            <Text
              onPress={async () => {
                if (await verify()) setPasswordVisible(true);
              }}
              style={styles.changeText}
            >
              Change
            </Text>
          </View>
        </View>

        <View style={{ marginVertical: 50 }}>
          <TouchableOpacity
            style={[styles.button]}
            disabled={inProgress}
            onPress={() => setSignOut(true)}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
            <Icon
              name="exit-outline"
              color={"#518BFF"}
              size={22}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button]}
            disabled={inProgress}
            onPress={async () => {
              if (await verify()) setDeleteVisible(true);
            }}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
            <Icon
              name="trash-outline"
              color={"#FF4343"}
              size={22}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button]}
            disabled={inProgress}
            onPress={() =>
              Alert.alert(
                "Contact Support",
                "Please email ewbyf@umsystem.edu with any questions."
              )
            }
          >
            <Text style={[styles.signOutText, { color: "#FFDDA1" }]}>
              Contact Support
            </Text>
            <Icon
              name="mail-outline"
              color={"#FFDDA1"}
              size={22}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  save: {
    position: "absolute",
    right: 20,
    bottom: "50%",
    marginBottom: -14,
    fontSize: 18,
    fontFamily: 'NunitoExtraBold'
  },
  settingsContainer: {
    flexDirection: "column",
  },
  profile: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
  },
  profilePicture: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginTop: 10,
    opacity: 0.3,
  },
  camera: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
  },
  section: {
    color: "grey",
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 6,
    paddingLeft: 30,
    fontFamily: 'Helvetica'
  },
  field: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingLeft: 30,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#363636",
    alignItems: "center",
  },
  fieldTitle: {
    fontSize: 16,
    color: "#518BFF",
    marginRight: 15,
    width: 90,
    fontFamily: 'NunitoExtraBold'
  },
  input: {
    fontSize: 15,
    color: "white",
    width: 180,
    marginRight: 10,
  },
  changeText: {
    color: "#518BFF",
    marginLeft: "auto",
  },
  footer: {
    height: "25%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#363636",
    width: "100%",
    paddingVertical: 12.5,
    borderTopWidth: 1,
    borderTopColor: "#363636",
    marginBottom: 10,
  },
  signOutText: {
    fontSize: 17,
    color: "#518BFF",
    textAlign: "center",
    fontFamily: 'NunitoExtraBold'
  },
  deleteText: {
    fontSize: 17,
    color: "#FF4343",
    textAlign: "center",
    fontFamily: 'NunitoExtraBold'
  },
});
