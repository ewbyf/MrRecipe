import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import global from "../../../../../Styles";
import Icon from "react-native-vector-icons/Ionicons";
import { firebase } from "../../../../../config";
import { FlashList } from "@shopify/flash-list";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Rating } from "react-native-ratings";
import {
  TapGestureHandler,
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { showMessage } from "react-native-flash-message";
import FastImage from 'react-native-fast-image';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function Dashboard({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const fetchData = async () => {
    let tempList = [];
    let fav = [];
    let ref = "";

    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUserData(snapshot.data());
          ref = snapshot.data();
          fav = snapshot.data().favorites;
        }
      });
    
    if (ref.recipes) {
      await Promise.all(
        ref.recipes.reverse().map(async (doc) => {
          return firebase
            .firestore()
            .collection("recipes")
            .doc(doc)
            .get()
            .then((snap) => {
              if (fav.indexOf(doc) >= 0) {
                tempList.push({
                  key: doc,
                  value: snap.data(),
                  favorite: "#FF4343",
                });
              } else {
                tempList.push({ key: doc, value: snap.data(), favorite: "gray" });
              }
            })
            .catch((error) => {
              showMessage({
                message: error.message,
                icon: "danger",
                type: "danger",
              });
            });
        })
      );
    }
    setDataList(tempList);
  };

  useEffect(() => {
    fetchData();
    navigation.addListener("focus", () => {
      setLoading(!loading);
    });
  }, [navigation, loading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
    wait(800).then(() => setRefreshing(false));
  }, []);

  const Posts = ({ item }) => {
    const favorite = async (doc) => {
      let color = "gray";

      let temp = dataList;
      let index = dataList.findIndex((item) => item.key == doc);

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snap) => {
          let fav = snap.data().favorites;
          if (fav.indexOf(doc) != -1) {
            fav.splice(snap.data().favorites.indexOf(doc), 1);
            firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid)
              .update({ favorites: fav });
            temp[index].favorite = "gray";
          } else {
            fav.push(doc);
            firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid)
              .update({ favorites: fav });
            temp[index].favorite = "#FF4343";
            color = "#FF4343";
          }
        })
        .catch((error) => {
          showMessage({
            message: error.message,
            icon: "danger",
            type: "danger",
          });
        });

      setDataList(temp);
      setLiked(color);
    };
    const scale = useSharedValue(0);

    const onDoubleTap = useCallback(async () => {
      setLiked("#FF4343");
      scale.value = withSpring(1, undefined, (isFinished) => {
        if (isFinished) {
          scale.value = withDelay(500, withSpring(0));
        }
      });
      let fav = [];
      let doc = item.key;
      let temp = dataList;
      let index = dataList.findIndex((item) => item.key == doc);
      temp[index].favorite = "#FF4343";

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snap) => {
          fav = snap.data().favorites;
          if (fav.indexOf(doc) == -1) {
            fav.push(doc);
            firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid)
              .update({ favorites: fav });
          } else {
            return;
          }
        })
        .catch((error) => {
          showMessage({
            message: error.message,
            icon: "danger",
            type: "danger",
          });
        });

      setDataList(temp);
    }, []);

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ scale: Math.max(scale.value, 0) }],
    }));

    const doubleTapRef = useRef();
    const lastItemId = useRef(item.key);
    const [liked, setLiked] = useState(item.favorite);

    if (item.key !== lastItemId.current) {
      lastItemId.current = item.key;
      setLiked(item.favorite);
    }

    return (
      <TouchableOpacity style={global.itemContainer}>
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() =>
            navigation.navigate("DishStack", {
              doc: item.key,
              id: firebase.auth().currentUser.uid,
            })
          }
        >
          <TapGestureHandler
            maxDelayMs={200}
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={() => onDoubleTap()}
          >
            <View style={[global.list]}>
              <AnimatedImage
                source={require("../../../../../assets/heart.png")}
                style={[styles.heart, rStyle]}
              />
              <FastImage
                source={{
                  uri: item.value.image
                    ? item.value.image
                    : "https://imgur.com/hNwMcZQ.png",
                }}
                style={global.listImage}
              />
              <View style={{ width: "100%", height: 85 }}>
                <View>
                  <Text
                    style={global.recipeTitle}
                    numberOfLines={1}
                  >
                    {item.value.name}
                  </Text>
                  <Text style={{ color: "gray" }}>{item.value.difficulty}</Text>
                  <Text style={{ color: "gray" }}>
                    {parseFloat(
                      (
                        (item.value.cooktime + item.value.preptime) /
                        60
                      ).toFixed(2)
                    )}
                    + hrs
                  </Text>
                </View>
              </View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
        <View style={global.ratingContainer}>
          <Rating
            ratingCount={5}
            imageSize={16}
            readonly={true}
            type={"custom"}
            ratingBackgroundColor={"gray"}
            tintColor={"#282828"}
            startingValue={item.value.rating}
          />
          <Text style={global.rating}>
            {item.value.rating} ({item.value.numratings})
          </Text>
          <TouchableOpacity
            style={{ marginLeft: "auto" }}
            onPress={() => favorite(item.key)}
          >
            <Icon name="heart" color={liked} size={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!userData) {
    return (
      <View style={global.appContainer}>
        <View style={global.topbar}>
          <Text style={global.topbarTitle}>Profile</Text>
        </View>

        <View style={styles.dashboard}>
          <View style={styles.postTitleContainer}>
            <Text style={styles.postsTitle}>POSTS</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={global.appContainer}>
      {/* Header pop up */}
      <View style={styles.animationContainer}>
        <View style={{ flex: 1, height: "100%", justifyContent: "center" }}>
          <AnimatedImage
            source={{
              uri: userData.pfp
                ? userData.pfp
                : "https://imgur.com/hNwMcZQ.png",
            }}
            style={{
              marginLeft: "auto",
              borderRadius: 50,
              height: 40,
              width: 40,
              opacity: scrollY.interpolate({
                inputRange: [100, 140],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [100, 140],
                    outputRange: [22, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            marginHorizontal: 10,
          }}
        >
          <Animated.View
            style={{
              textAlign: "center",
              opacity: scrollY.interpolate({
                inputRange: [135, 165],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [135, 195],
                    outputRange: [62, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.name, { fontSize: 22 }]}>{userData.name}</Text>
          </Animated.View>
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [165, 185],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [165, 195],
                    outputRange: [32, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.username, { fontSize: 13 }]}>
              @{userData.username}
            </Text>
          </Animated.View>
        </View>
        <View style={{ flex: 1 }}>
          <Icon
            name="cog-outline"
            color="white"
            size={35}
            style={styles.gear}
            onPress={() => navigation.navigate("SettingsScreen")}
          />
        </View>
      </View>

      <View style={global.topbar}>
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [135, 165],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [135, 175],
                  outputRange: [0, 50],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <Text style={global.topbarTitle}>Profile</Text>
        </Animated.View>
      </View>

      <View style={styles.dashboard}>
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={1}
          style={{ zIndex: 3 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <AnimatedImage
                source={{
                  uri: userData.pfp
                    ? userData.pfp
                    : "https://imgur.com/hNwMcZQ.png",
                }}
                style={{
                  ...styles.profilePicture,
                  transform: [
                    {
                      scale: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0.6],
                        extrapolate: "clamp",
                      }),
                    },
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 16],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                }}
              />

              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.username}>@{userData.username}</Text>
            </View>
          </View>

          <View style={styles.bioContainer}>
            {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
          </View>

          <View style={styles.postTitleContainer}>
            <Text style={styles.postsTitle}>POSTS</Text>
          </View>

          <View style={styles.postsContainer}>
            {userData && userData.recipes.length == 0 && (
              <Text
                style={{
                  color: "lightgrey",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                You have not posted any recipes
              </Text>
            )}
            {userData && userData.recipes.length > 0 && (
              <FlashList
                data={dataList}
                renderItem={({ item }) => <Posts item={item} />}
                estimatedItemSize={10}
                numColumns={2}
              />
            )}
          </View>
        </AnimatedScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
    paddingTop: 30,
    height: 110,
  },
  gear: {
    alignSelf: "flex-end",
    marginRight: 20,
  },
  dashboard: {
    flexDirection: "column",
  },
  profilePicture: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginTop: 20,
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  username: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 3,
    fontFamily: 'NunitoExtraBold'
  },
  bioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: "10%",
  },
  bio: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 12,
  },
  postTitleContainer: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#363636",
    backgroundColor: "#222222",
  },
  postsContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    marginBottom: 250,
  },
  postsTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    fontFamily: 'Helvetica'
  },
  heart: {
    height: 75,
    width: 75,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -35,
    marginLeft: -22,
    zIndex: 10,
  },
});
