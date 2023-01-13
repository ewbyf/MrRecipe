import {
  StyleSheet,
  View,
  Text,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import global from "../../../../Styles";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { Rating } from "react-native-ratings";
import { firebase } from "../../../../config";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TapGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Recipes({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const [dataList, setDataList] = useState([
    { key: "1", value: { name: "a", rating: "a" } },
    { key: "1", value: { name: "a", rating: 1 } },
  ]);
  const [recentList, setRecentList] = useState([
    { key: "1", value: { name: "a", rating: 1 } },
  ]);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  function onAuthStateChanged(userParam) {
    fetchData(userParam);
    setUser(userParam);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const fetchData = async (userParam) => {
    let tempList = [];
    let tempList2 = [];

    let fav = [];

    const snapshot = await firebase
      .firestore()
      .collection("recipes")
      .orderBy("weight", "desc")
      .limit(50)
      .get();
    const snapshot2 = await firebase
      .firestore()
      .collection("recipes")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();
    if (userParam) {
      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snap) => {
          fav = snap.data().favorites;
        })
        .catch((error) => {
          alert(error.message);
        });
    }


    await Promise.all(
      snapshot.docs.map((doc) => {
        if (userParam && fav.indexOf(doc.id) >= 0) {
          tempList.push({
            key: doc.id,
            value: doc.data(),
            favorite: "#FF4343",
          });
        } else {
          tempList.push({ key: doc.id, value: doc.data(), favorite: "gray" });
        }
      }),
    );

    await Promise.all(
      snapshot2.docs.map((doc) => {
        if (userParam && fav.indexOf(doc.id) >= 0) {
          tempList2.push({
            key: doc.id,
            value: doc.data(),
            favorite: "#FF4343",
          });
        } else {
          tempList2.push({ key: doc.id, value: doc.data(), favorite: "gray" });
        }
      }),
    );

    setDataList(tempList);
    setRecentList(tempList2);
  };

  useEffect(() => {
    if (firebase.auth().currentUser) fetchData(user);
    navigation.addListener("focus", () => {
      setLoading(!loading);
    });
  }, [navigation, loading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData(user);
    wait(800).then(() => setRefreshing(false));
  }, []);

  const Featured = ({ item }) => {
    const favorite = async (doc) => {
      if (user) {
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
              setLiked("gray");
            } else {
              fav.push(doc);
              firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid)
                .update({ favorites: fav });
              temp[index].favorite = "#FF4343";
              setLiked("#FF4343");
            }
          })
          .catch((error) => {
            alert(error.message);
          });

        setDataList(temp);
      } else {
        Alert.alert(
          "Not Signed In",
          "You must be signed in to favorite a recipe.",
        );
      }
    };
    const scale = useSharedValue(0);

    const onDoubleTap = useCallback(async () => {
      if (user) {
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
            alert(error.message);
          });

        setDataList(temp);
      } else {
        Alert.alert(
          "Not Signed In",
          "You must be signed in to favorite a recipe.",
        );
      }
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
      <View
        style={{
          width: windowWidth - 40,
          height: (windowWidth - 40) * 0.8,
          borderRadius: 10,
        }}
      >
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() =>
            navigation.navigate("DishStack", { doc: item.key })
          }
        >
          <TapGestureHandler
            maxDelayMs={200}
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={() => onDoubleTap()}
          >
            <View style={styles.list}>
              <AnimatedImage
                source={require("../../../../assets/heart.png")}
                style={[styles.heart, rStyle]}
              />
              <Image
                source={{
                  uri: item.value.image
                    ? item.value.image
                    : "https://imgur.com/hNwMcZQ.png",
                }}
                style={styles.featuredImage}
              />
              <View style={{ flexDirection: "row", width: "100%" }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    {item.value.name}
                  </Text>
                  <Text style={{ color: "gray" }}>{item.value.difficulty}</Text>
                  <Text style={{ color: "gray" }}>
                    {parseFloat(((item.value.cooktime + item.value.preptime) / 60).toFixed(
                      2
                    ))}
                    + hrs
                  </Text>
                </View>
              </View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
        <View style={styles.featuredRating}>
          <Rating
            ratingCount={5}
            imageSize={16}
            readonly={true}
            type={"custom"}
            ratingBackgroundColor={"gray"}
            tintColor={"#282828"}
            startingValue={item.value.rating}
          />
          <Text style={[global.rating, { marginHorizontal: 8 }]}>
            {item.value.rating >= 0 ? parseFloat(item.value.rating.toFixed(2)) : 0} ({item.value.numratings})
          </Text>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => favorite(item.key)}
          >
            <Icon name="heart" color={liked} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const RecipeList = ({ item, list }) => {
    const favorite = async (doc, list) => {
      if (user) {
        let fav = [];
        let temp = [];
        let color = "gray";
        let index = -1;
        if (list == "trending") {
          temp = dataList;
          index = dataList.findIndex((item) => item.key == doc);
        } else {
          temp = recentList;
          index = recentList.findIndex((item) => item.key == doc);
        }

        await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then((snap) => {
            fav = snap.data().favorites;
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
            alert(error.message);
          });

        if (list == "trending") {
          setDataList(temp);
        } else {
          setRecentList(temp);
        }
        setLiked(color);
      } else {
        Alert.alert(
          "Not Signed In",
          "You must be signed in to favorite a recipe.",
        );
      }
    };
    const scale = useSharedValue(0);

    const onDoubleTap = useCallback(async () => {
      if (user) {
        setLiked("#FF4343");
        scale.value = withSpring(1, undefined, (isFinished) => {
          if (isFinished) {
            scale.value = withDelay(500, withSpring(0));
          }
        });
        let fav = [];
        let temp = [];
        let index = -1;
        let doc = item.key;
        if (list == "trending") {
          temp = dataList;
          index = dataList.findIndex((item) => item.key == doc);
        } else {
          temp = recentList;
          index = recentList.findIndex((item) => item.key == doc);
        }
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
            alert(error.message);
          });

        if (list == "trending") {
          setDataList(temp);
        } else {
          setRecentList(temp);
        }
      } else {
        Alert.alert(
          "Not Signed In",
          "You must be signed in to favorite a recipe.",
        );
      }
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
      <View
        style={{
          width: windowWidth / 1.5 - 20,
          height: windowWidth / 1.5 - 25,
          borderRadius: 10,
        }}
      >
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() =>
            navigation.navigate("DishStack", { doc: item.key })
          }
        >
          <TapGestureHandler
            maxDelayMs={200}
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={() => onDoubleTap()}
          >
            <View
              style={[
                styles.list,
                { marginHorizontal: 10, height: windowWidth / 1.5 - 25 },
              ]}
            >
              <AnimatedImage
                source={require("../../../../assets/heart.png")}
                style={[styles.heart, rStyle]}
              />
              <Image
                source={{
                  uri: (item.value.image
                    ? item.value.image
                    : "https://imgur.com/hNwMcZQ.png"),
                }}
                style={styles.smallImage}
              />
              <View style={{ width: "100%", height: 85 }}>
                <View>
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    {item.value.name}
                  </Text>
                  <Text style={{ color: "gray" }}>{item.value.difficulty}</Text>
                  <Text style={{ color: "gray" }}>
                    {parseFloat(((item.value.cooktime + item.value.preptime) / 60).toFixed(
                      2
                    ))}
                    + hrs
                  </Text>
                </View>
              </View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
        <View style={styles.ratingContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Rating
              ratingCount={5}
              imageSize={16}
              readonly={true}
              type={"custom"}
              ratingBackgroundColor={"gray"}
              tintColor={"#282828"}
              startingValue={item.value.rating}
            />
            <Text style={[global.rating, { marginHorizontal: 8 }]}>
              {item.value.rating >= 0 ? parseFloat(item.value.rating.toFixed(2)) : 0} ({item.value.numratings})
            </Text>
          </View>
          <TouchableOpacity onPress={() => favorite(item.key, list)}>
            <Icon name="heart" color={liked} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={global.appContainer}>
      <View style={global.topbar}>
          <Text style={global.topbarTitle}>Mr. Recipe</Text>
      </View>
      <ScrollView
        style={{ height: windowHeight, width: windowWidth }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            marginBottom: 250,
            width: windowWidth,
            height: windowHeight,
          }}
        >
          <Text style={styles.titleText}>Featured Recipe</Text>
          <View style={styles.featuredContainer}>
            <FlashList
              data={dataList.slice(0, 1)}
              renderItem={({ item }) => <Featured item={item} />}
              estimatedItemSize={1}
            />
          </View>
          <Text style={styles.titleText}>Trending</Text>
          <View style={styles.trendingContainer}>
            <FlashList
              data={dataList.slice(1)}
              renderItem={({ item }) => (
                <RecipeList item={item} list={"trending"} />
              )}
              estimatedItemSize={10}
              numColumns={1}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
          <Text style={styles.titleText}>Recent</Text>
          <View style={styles.trendingContainer}>
            <FlashList
              data={recentList}
              renderItem={({ item }) => (
                <RecipeList item={item} list={"recent"} />
              )}
              estimatedItemSize={10}
              numColumns={1}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    paddingLeft: 20,
    paddingTop: 20,
  },
  featuredContainer: {
    width: Dimensions.get("window").width,
    height: (Dimensions.get("window").width - 40) * 0.8,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  trendingContainer: {
    width: "100%",
    height: Dimensions.get("window").width / 1.5 - 25,
    marginTop: 10,
    paddingLeft: 10,
  },
  postsTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  list: {
    height: (Dimensions.get("window").width - 40) * 0.8,
    backgroundColor: "#282828",
    alignItems: "center",
    padding: 20,
    borderRadius: 30,
  },
  featuredImage: {
    width: "100%",
    aspectRatio: 5/3,
    borderRadius: 20,
    marginBottom: 10,
  },
  heart: {
    height: 100,
    width: 100,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -50,
    marginLeft: -30,
    zIndex: 10,
  },
  smallImage: {
    width: "100%",
    aspectRatio: 5/3,
    borderRadius: 20,
    marginBottom: 10,
  },
  featuredRating: {
    position: "absolute",
    bottom: 8,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  ratingContainer: {
    position: "absolute",
    left: 30,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: Dimensions.get("window").width / 2 - 10,
  },
});
