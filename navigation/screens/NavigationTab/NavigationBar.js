import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

import { firebase } from "../../../config";
import global from "../../../Styles"

// Screens
import RecipesScreen from "./NavigationScreens/Recipes";
import SearchScreen from "./NavigationScreens/Search";
import LoginStack from "../../routes/LoginStack";
import DashboardStack from "../../routes/DashboardStack";
import FavoritesScreen from "./NavigationScreens/Favorites";
import PostScreen from "./NavigationScreens/Post";
import { showMessage } from "react-native-flash-message";
import { useEffect, useState } from "react";

const Tab = createBottomTabNavigator();

export default function NavigationBar() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [buttonName, setButtonName] = useState("");

  const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
      style={{
        top: -30,
        justifyContent: "center",
        alignItems: "center",
        ...styles.shadow,
      }}
      onPress={() => {
        if (user) {
          firebase.auth().currentUser.reload();
          if (firebase.auth().currentUser.emailVerified) {
            onPress();
          }
          else {
            showMessage({
              message: "Must be verified to post a recipe",
              icon: "danger",
              type: "danger",
            });
          }
        }
        else {
          showMessage({
            message: "Must be signed in to post a recipe",
            icon: "danger",
            type: "danger",
          });
        }
      }}
    >
      <View style={styles.postButton}>{children}</View>
    </TouchableOpacity>
  );

  onAuthStateChanged = async(user) => {
    await checkBanned(user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const checkBanned = async(userParam) => {
    if (userParam) {
      await firebase
        .firestore()
        .collection("banned")
        .where("email", "==", firebase.auth().currentUser.email)
        .get()
        .then((snap) => {
          if (!snap.empty) {
            firebase
              .auth()
              .currentUser.delete()
              .then(() => {
                firebase.auth().signOut();
                showMessage({
                  message: "Your account has been banned",
                  icon: "danger",
                  type: "danger",
                });
                setButtonName("Login");
              });
          }
          else {
            setButtonName("Profile");
          }
        });
    }
    else {
      setButtonName("Login");
    }
  };

  if (initializing) {
    return (
      <View style={global.appContainer}>
        <View style={global.topbar}>
          <Text style={[global.topbarTitle, {fontFamily: 'Pacifico', fontWeight: 'normal', fontSize: 28}]}>Mr. Recipe</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.appcontainer}>
      <Tab.Navigator
        initialRouteName="Recipes"
        screenOptions={() => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            ...styles.tabBar,
            ...styles.shadow,
          },
        })}
      >
        <Tab.Screen
          name={"Recipes"}
          component={RecipesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Icon
                  name={focused ? "book" : "book-outline"}
                  color={focused ? "#FFDDA1" : "white"}
                  size={25}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? "#FFDDA1" : "white",
                    fontFamily: "Sora",
                  }}
                >
                  Recipes
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={"Search"}
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Icon
                  name={focused ? "search" : "search-outline"}
                  color={focused ? "#FFDDA1" : "white"}
                  size={25}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? "#FFDDA1" : "white",
                    fontFamily: "Sora",
                  }}
                >
                  Search
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={"Post"}
          component={PostScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Icon
                  name={focused ? "add" : "add-outline"}
                  color="white"
                  size={30}
                />
              </View>
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tab.Screen
          name={"Favorites"}
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Icon
                  name={focused ? "heart" : "heart-outline"}
                  color={focused ? "#FFDDA1" : "white"}
                  size={25}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? "#FFDDA1" : "white",
                    fontFamily: "Sora",
                  }}
                >
                  Favorites
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={buttonName}
          component={user ? DashboardStack : LoginStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Icon
                  name={focused ? "person-circle" : "person-circle-outline"}
                  color={focused ? "#FFDDA1" : "white"}
                  size={25}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? "#FFDDA1" : "white",
                    fontFamily: "Sora",
                  }}
                >
                  {buttonName}
                </Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  appcontainer: {
    height: "100%",
    backgroundColor: "#222222",
  },
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: "#518BFF",
    height: 90,
    borderRadius: 15,
    borderTopWidth: 0,
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  postButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFDDA1",
  },
});
