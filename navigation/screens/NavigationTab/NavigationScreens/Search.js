import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  RefreshControl,
  Alert
} from "react-native";
import { SearchBar } from "@rneui/themed";
import global from "../../../../Styles";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { firebase } from "../../../../config";
import Icon from "react-native-vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Rating } from "react-native-ratings";
import {
  TapGestureHandler,
  GestureHandlerRootView,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Search({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [press, setPress] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [recipesSelected, setRecipesSelected] = useState(true);

  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };


  function onAuthStateChanged(userParam) {
    fetchData(userParam);
    setUser(userParam);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const fetchData = async (userParam) => {
    let tempList = [];
    let fav = [];

    const shuffle = (arr) => {
      var j, x, i;
      for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
      }
      return arr;
    };

    if (userParam) {
      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
            fav = snapshot.data().favorites;
          } else
            Alert.alert("Unknown Error Occured", "Contact support with error.");
        });
    }

    let recipes = await firebase
      .firestore()
      .collection("recipes")
      .orderBy("weight", "desc")
      .limit(50)
      .get();
    
    recipes = shuffle(recipes.docs);

    await Promise.all(
      recipes.map(async (doc) => {
        if (fav.indexOf(doc.id) >= 0) {
          tempList.push({
            key: doc.id,
            value: doc.data(),
            favorite: "#FF4343",
          });
        }
        else {
          tempList.push({ key: doc.id, value: doc.data(), favorite: "gray" });
        }
      })
    );
    setDataList(tempList);
  };

  useEffect(() => {
    fetchData(user);
    navigation.addListener("focus", () => {
      setLoading(!loading);
    });
  }, [navigation, loading]);

  const Recipes = ({ item }) => {
    const favorite = async (doc) => {
      if (user) {
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
            alert(error.message);
          });

        setDataList(temp);
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
      <TouchableOpacity style={global.itemContainer}>
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() =>
            navigation.navigate("DishStack", {
              doc: item.key,
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
                source={require("../../../../assets/heart.png")}
                style={[styles.heart, rStyle]}
              />
              <Image
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
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
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

  const searchRecipe = (val) => {
    firebase.firestore().collection("recipes")
    .whereGreaterThanOrEqualTo("name", val)
    .whereLessThanOrEqualTo("name", val + "\uF7FF")
    .get()
    .then((doc) => {
      console.log(doc[0])
    })
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData(user);
    wait(800).then(() => setRefreshing(false));
  }, []);

  if (initializing) {
    return (
      <View style={global.appContainer}>
        <View style={global.searchTopbar}>
          <SearchBar
            lightTheme
            round
            cancelButtonProps={{ color: "white" }}
            containerStyle={global.searchbar}
            inputContainerStyle={{ backgroundColor: "white" }}
            placeholder="Search for users and recipes"
            inputStyle={{ fontSize: 15 }}
          />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={global.appContainer}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[global.searchTopbar, {height: (press ? 160 : 130)}]}>
          <SearchBar
            lightTheme
            round
            showCancel
            platform={Platform.OS == "ios" ? "ios" : "android"}
            cancelButtonProps={{ color: "white" }}
            containerStyle={global.searchbar}
            inputContainerStyle={{ backgroundColor: "white" }}
            placeholder="Search for users and recipes"
            inputStyle={{ fontSize: 15 }}
            onFocus={() => setPress(true)}
            onChangeText={(val) => {setSearchValue(val); searchRecipe(val)}}
            value={searchValue}
            onCancel={() => setPress(false)}
          />
          {press && (
            <View style={{flexDirection: 'row', position: 'absolute', bottom: 0}}>
              <TouchableOpacity onPress={() => setRecipesSelected(true)} style={[tab, {borderBottomWidth: (recipesSelected ? 1 : 0)}]}>
                <View>
                  <Text style={styles.tabTitle}>
                    Recipes
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRecipesSelected(false)} style={[tab, {borderBottomWidth: (!recipesSelected ? 1 : 0)}]}>
                <View>
                  <Text style={styles.tabTitle}>
                    Users
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      <ScrollView showsVerticalScrollIndicator={false} style={{ zIndex: 3 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.postsContainer}>
          {!press && !searchValue && (
            <FlashList
              data={dataList}
              renderItem={({ item }) => <Recipes item={item} />}
              estimatedItemSize={10}
              numColumns={2}
            />
          )}
          
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  signinText: {
    width: 300,
    borderWidth: 5,
    marginTop: 15,
    borderColor: "white",
    borderRadius: 20,
    padding: 7,
    backgroundColor: "#518BFF",
    color: "black",
    flexDirection: "row",
    marginTop: 20,
  },
  postsContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    marginBottom: 150,
    marginTop: 10,
  },
  heart: {
    height: 75,
    width: 75,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -22,
    zIndex: 10,
  },
  tabTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    borderBottomColor: "white"
  }
});
