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

  const [userList, setUserList] = useState([]);
  const [recipesList, setRecipesList] = useState([]);

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

  const Recipes = ({ item, data, set }) => {
    const favorite = async (doc) => {
      if (user) {
        let color = "gray";

        let temp = data;
        let index = data.findIndex((item) => item.key == doc);

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

        if (set == "dataList") {
          setDataList(temp);
        }
        else {
          setRecipesList(temp)
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
        let doc = item.key;
        let temp = data;
        let index = data.findIndex((item) => item.key == doc);
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

        
        if (set == "dataList") {
          setDataList(temp);
        }
        else {
          setRecipesList(temp);
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

  const Users = ({ item }) => {
    return (
      <TouchableOpacity style={global.itemContainer} onPress={() => navigation.navigate("ProfileScreen", {id: item.key})}>
        <View style={[global.list, {paddingTop: 10}]}>
          <Image
            source={{
              uri: item.value.pfp
                ? item.value.pfp
                : "https://imgur.com/hNwMcZQ.png",
            }}
            style={styles.profileImage}
          />
          <View style={{ width: "100%", height: 85, marginTop: 10 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, textAlign: 'center' }}>{item.value.name}</Text>
            <Text style={{ color: "gray", textAlign: 'center' }}>@{item.value.username}</Text>
            <Text style={{ color: "white" }} numberOfLines={3 }>{item.value.bio}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const searchRecipe = async(val) => {
    if (val) {
      let users = [];
      let tempUsers = [];

      let recipes = [];
      let tempRecipes = [];
      let fav = [];

      val = val.toLowerCase();
      
      // Searched recipes

      await firebase.firestore().collection("recipes")
      .where("name_lowercase", ">=", val)
      .where("name_lowercase", "<=", val + "\uF7FF")
      .get()
      .then((snap) => {
        if (!snap.empty)
          tempRecipes = snap.docs;
      })

      if (tempRecipes.length) {
        if (user) {
          await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then((snapshot) => {
            if (snapshot.exists) {
              fav = snapshot.data().favorites;
            } else
              Alert.alert("Unknown Error Occured", "Contact support with error.");
          });
        }

        await Promise.all(
          tempRecipes.map(async (doc) => {
            if (fav.indexOf(doc.id) >= 0) {
              recipes.push({
                key: doc.id,
                value: doc.data(),
                favorite: "#FF4343",
              });
            }
            else {
              recipes.push({ key: doc.id, value: doc.data(), favorite: "gray" });
            }
          })
        );
      }

      await firebase.firestore().collection("recipes")
      .where("name_array", "array-contains", val)
      .get()
      .then((snap) => {
        if (!snap.empty)
          tempRecipes = snap.docs;
      })

      if (tempRecipes.length) {
        await Promise.all(
          tempRecipes.map(async (doc) => {
            if (recipes.findIndex(item => item.key == doc.id) < 0) {
              if (fav.indexOf(doc.id) >= 0) {
                recipes.push({
                  key: doc.id,
                  value: doc.data(),
                  favorite: "#FF4343",
                });
              }
              else {
                recipes.push({ key: doc.id, value: doc.data(), favorite: "gray" });
              }
            }
          })
        );
      }

      setRecipesList(recipes);

      // Searched users
      await firebase.firestore().collection("users")
      .where("username_lowercase", ">=", val)
      .where("username_lowercase", "<=", val + "\uF7FF")
      .get()
      .then((snap) => {
        if (!snap.empty)
          tempUsers = snap.docs;
      });

      if (tempUsers.length) {
        await Promise.all(
          tempUsers.map(async (doc) => {
            users.push({
              key: doc.id,
              value: doc.data(),
            });
          })
        );
      }

      await firebase.firestore().collection("users")
      .where("name_lowercase", ">=", val)
      .where("name_lowercase", "<=", val + "\uF7FF")
      .get()
      .then((snap) => {
        if (!snap.empty)
          tempUsers = snap.docs;
      });

      if (tempUsers.length) {
        await Promise.all(
          tempUsers.map(async (doc) => {
            if (users.findIndex(item => item.key == doc.id) < 0) {
              users.push({
                key: doc.id,
                value: doc.data(),
              });
            }
          })
        );
      }

      await firebase.firestore().collection("users")
      .where("name_array", "array-contains", val)
      .get()
      .then((snap) => {
        if (!snap.empty)
          tempUsers = snap.docs;
      });

      if (tempUsers.length) {
        await Promise.all(
          tempUsers.map(async (doc) => {
            if (users.findIndex(item => item.key == doc.id) < 0) {
              users.push({
                key: doc.id,
                value: doc.data(),
              });
            }
          })
        );
      }

      setUserList(users)
    }
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
            onCancel={() => {setPress(false)}}
          />
          {press && (
            <View style={{flexDirection: 'row', position: 'absolute', bottom: 0}}>
              <TouchableOpacity onPress={() => setRecipesSelected(true)} style={[styles.tab, {borderBottomWidth: (recipesSelected ? 1 : 0)}]}>
                <View>
                  <Text style={styles.tabTitle}>
                    Recipes
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRecipesSelected(false)} style={[styles.tab, {borderBottomWidth: (!recipesSelected ? 1 : 0)}]}>
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
          {searchValue && ((recipesList.length == 0 && recipesSelected) || (userList.length == 0 && !recipesSelected)) && (
            <View>
              <Text style={styles.noResults}>No results found</Text>
            </View>
          )}

          {!press && !searchValue && (
            <FlashList
              data={dataList}
              renderItem={({ item }) => <Recipes item={item} data={dataList} set={"dataList"} />}
              estimatedItemSize={10}
              numColumns={2}
            />
          )}

          {searchValue && recipesSelected && (
            <FlashList
              data={recipesList}
              renderItem={({ item }) => <Recipes item={item} data={recipesList} set={"recipesList"} />}
              estimatedItemSize={10}
              numColumns={2}
            />
          )}

          {searchValue && !recipesSelected && (
            <FlashList
              data={userList}
              renderItem={({ item }) => <Users item={item} />}
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
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  noResults: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  }
});
