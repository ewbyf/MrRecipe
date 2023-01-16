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
import Icon from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import { firebase } from "../../../../../config";
import Dialog from "react-native-dialog";
import { showMessage } from "react-native-flash-message";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const loginUser = async () => {
    if (!email) {
      showMessage({
        message: "Email not entered",
        icon: "danger",
        type: "danger",
      });
    } else if (!password) {
      showMessage({
        message: "Password not entered",
        icon: "danger",
        type: "danger",
      });
    } else {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch((error) => {
          switch (error.code) {
            case "auth/user-not-found":
              showMessage({
                message: "Account not found",
                icon: "danger",
                type: "danger",
              });
              break;
            case "auth/invalid-email":
              showMessage({
                message: "Invalid email entered",
                icon: "danger",
                type: "danger",
              });
              break;
            case "auth/wrong-password":
              showMessage({
                message: "Invalid password entered",
                icon: "danger",
                type: "danger",
              });
              break;
            case "auth/too-many-requests":
              showMessage({
                message: "Too many attempts. Try again later",
                icon: "danger",
                type: "danger",
              });
              break;
            default:
              alert(error.message);
          }
        });
    }
  };

  const resetPassword = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(resetEmail);
      showMessage({
        message: "Password reset email sent!",
        type: "success",
      });
      setResetEmail("");
      setForgotVisible(false);
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          showMessage({
            message: "Account not found",
            icon: "danger",
            type: "danger",
          });
          break;
        case "auth/invalid-email":
          showMessage({
            message: "Invalid email entered",
            icon: "danger",
            type: "danger",
          });
          break;
        case "auth/missing-email":
          showMessage({
            message: "Email is missing",
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
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={global.appContainer}>
        {/* Forgot password pop up */}
        <Dialog.Container visible={forgotVisible}>
          <Dialog.Title>Forgot Password</Dialog.Title>
          <Dialog.Description>
            Please enter the email for your account.
          </Dialog.Description>
          <Dialog.Input
            placeholder="Enter email"
            onChangeText={(email) => setResetEmail(email)}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => {
              setResetEmail("");
              setForgotVisible(false);
            }}
          />
          <Dialog.Button
            label="Reset"
            disabled={!resetEmail}
            style={{ color: resetEmail ? "red" : "lightgrey" }}
            onPress={() => resetPassword()}
          />
        </Dialog.Container>

        <View style={global.topbar}>
          <Text style={global.topbarTitle}>Login</Text>
        </View>
        <View style={styles.login}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Mr. Recipe</Text>
          </View>
          <View style={styles.loginContainer}>
            <View style={{ flexDirection: "row" }}>
              <Icon
                name="mail-outline"
                size={20}
                color={"white"}
                style={styles.icon}
              />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor={"lightgrey"}
                style={styles.inputField}
                keyboardType="email-address"
                autoCapitalize={false}
                maxLength={320}
                onChangeText={(email) => {
                  setEmail(email);
                }}
                onSubmitEditing={() => {
                  loginUser();
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
                style={styles.inputField}
                onChangeText={(password) => {
                  setPassword(password);
                }}
                secureTextEntry={true}
                onSubmitEditing={() => {
                  loginUser();
                }}
              ></TextInput>
            </View>

            <TouchableOpacity onPress={() => loginUser()} style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <Text style={{ color: "white" }}>Don't have an account? </Text>
              <Text
                onPress={() => navigation.navigate("RegisterScreen")}
                style={{ color: "#518BFF", textDecorationLine: "underline" }}
              >
                Sign up
              </Text>
            </View>
            <Text
              onPress={() => setForgotVisible(true)}
              style={{
                color: "#518BFF",
                marginTop: 20,
                textDecorationLine: "underline",
              }}
            >
              Forgot password?
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  login: {
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
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 115,
  },
  title: {
    marginBottom: 10,
    fontFamily: "Pacifico",
    fontSize: 40,
    color: "#518BFF",
  },
  icon: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -10,
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
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    fontFamily: 'NunitoExtraBold'
  },
});
