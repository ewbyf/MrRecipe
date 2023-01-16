import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import global from "../../../../../Styles";
import { useState } from "react";
import { firebase } from "../../../../../config";
import Icon from "react-native-vector-icons/Ionicons";
import BackArrow from "../../../../../components/BackArrow";
import { showMessage } from "react-native-flash-message";

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const usersDB = firebase.firestore().collection("users");

  const registerUser = async () => {
    const snapshot = await usersDB
      .where("username_lowercase", "==", username.toLowerCase())
      .get();
    if (!snapshot.empty)
      showMessage({
        message: "Username already exists",
        icon: "danger",
        type: "danger",
      });
    else if (!name)
      showMessage({
        message: "Name not entered",
        icon: "danger",
        type: "danger",
      });
    else if (!username)
      showMessage({
        message: "Username not entered",
        icon: "danger",
        type: "danger",
      });
    else if (!password)
      showMessage({
        message: "Password not entered",
        icon: "danger",
        type: "danger",
      });
    else {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async () => {
          let username_lowercase = username.toLowerCase();
          await firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .set({
              name,
              name_lowercase: name.toLowerCase(),
              name_array: name.toLowerCase().match(/\b(\w+)\b/g),
              username,
              username_lowercase,
              email,
              bio: "",
              pfp: "",
              recipes: [],
              favorites: [],
              comments: [],
              ratings: [],
              uid: firebase.auth().currentUser.uid,
            });
          await firebase
            .auth()
            .currentUser.sendEmailVerification({
              handleCodeInApp: true,
              url: "https://mr-recipe-799e9.firebaseapp.com",
            })
            .then(() => {
              showMessage({
                message:
                  "Account succesfully created! A verification email has been sent.",
                type: "success",
              });
            })
            .catch((error) => {
              alert(error.code);
            });
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/weak-password":
              showMessage({
                message: "Password needs to be at least 6 characters long",
                icon: "danger",
                type: "danger",
              });
              break;
            case "auth/invalid-email":
              showMessage({
                message: "Email not valid",
                icon: "danger",
                type: "danger",
              });
              break;
            case "auth/missing-email":
              showMessage({
                message: "Email not entered",
                icon: "danger",
                type: "danger",
              });
              break;
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
    }
    setLoading(false);
  };

  const convertName = (text) => {
    return text.replace(/[\[\]]/g, "");
  };

  const convertUsername = (text) => {
    return text.replace(/[^0-9a-zA-Z_.-]/g, "");
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={global.appContainer}>
        <View style={global.topbar}>
          <BackArrow navigation={navigation} />
          <Text style={global.topbarTitle}>Register</Text>
        </View>
        <View style={styles.register}>
          <View style={styles.logoContainer}></View>
          <Text style={styles.title}>Mr. Recipe</Text>
          <View style={{ flexDirection: "row" }}>
            <Icon
              name="person-circle-outline"
              size={20}
              color={"white"}
              style={styles.icon}
            />
            <TextInput
              placeholder="Name"
              placeholderTextColor="lightgrey"
              editable={!loading}
              style={styles.inputField}
              value={name}
              onChangeText={(name) => {
                setName(convertName(name));
              }}
              maxLength={18}
              onSubmitEditing={() => {
                registerUser();
              }}
            ></TextInput>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Icon
              name="person-outline"
              size={20}
              color={"white"}
              style={styles.icon}
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor="lightgrey"
              editable={!loading}
              autoCorrect={false}
              style={styles.inputField}
              value={username}
              onChangeText={(username) => {
                setUsername(convertUsername(username));
              }}
              maxLength={12}
              onSubmitEditing={() => {
                registerUser();
              }}
            ></TextInput>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Icon
              name="mail-outline"
              size={20}
              color={"white"}
              style={styles.icon}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="lightgrey"
              editable={!loading}
              style={styles.inputField}
              keyboardType="email-address"
              onChangeText={(email) => {
                setEmail(email);
              }}
              autoCapitalize={false}
              maxLength={320}
              onSubmitEditing={() => {
                registerUser();
              }}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Icon
              name="lock-closed-outline"
              size={20}
              color={"white"}
              style={styles.icon}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={"lightgrey"}
              editable={!loading}
              style={styles.inputField}
              onChangeText={(password) => {
                setPassword(password);
              }}
              secureTextEntry={true}
              onSubmitEditing={() => {
                registerUser();
              }}
            ></TextInput>
          </View>

          <TouchableOpacity
            disabled={loading}
            style={styles.button}
            onPress={() => {
              setLoading(true);
              registerUser();
            }}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  register: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingBottom: 110,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    marginBottom: 10,
    fontFamily: "Pacifico",
    fontSize: 40,
    color: "#518BFF",
  },
  inputField: {
    width: 200,
    marginVertical: 5,
    paddingVertical: 7,
    paddingHorizontal: 25,
    borderColor: "#518BFF",
    borderBottomWidth: 1,
    textAlign: "center",
    color: "white",
  },
  button: {
    backgroundColor: "#518BFF",
    width: 200,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 115,
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    fontFamily: 'NunitoExtraBold',
  },
  icon: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -10,
  },
});
