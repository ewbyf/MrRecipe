import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import global from "../../../../Styles";
import { useState, useEffect } from "react";
import { firebase } from "../../../../config";
import { FlashList } from "@shopify/flash-list";
import { Rating } from "react-native-ratings";
import Icon from "react-native-vector-icons/Ionicons";
import { SearchBar } from "@rneui/themed";

export default function Favorites({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [press, setPress] = useState(false);
  const [recipesList, setRecipesList] = useState([]);

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
    if (userParam) {
      let tempList = [];
      let fav = [];
      let deleted = 0;

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
            fav = snapshot.data().favorites;
          }
        });

      await Promise.all(
        fav.map(async (doc) => {
          return firebase
            .firestore()
            .collection("recipes")
            .doc(doc)
            .get()
            .then((snap) => {
              if (snap.exists) {
                tempList.push({ key: doc, value: snap.data() });
              } else {
                fav.splice(fav.indexOf(doc), 1);
                deleted++;
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

      if (deleted) {
        await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            favorites: fav,
          });
      }

      setFavorites(tempList);
    }
  };

  useEffect(() => {
    fetchData(user);
    navigation.addListener("focus", () => {
      setLoading(!loading);
    });
  }, [navigation, loading]);

  const unfavorite = async (doc) => {
    let temp = favorites;
    temp.splice(
      favorites.findIndex((item) => item.key == doc),
      1
    );

    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snap) => {
        let fav = snap.data().favorites;
        fav.splice(snap.data().favorites.indexOf(doc), 1);
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ favorites: fav });
      })
      .catch((error) => {
        showMessage({
          message: error.message,
          icon: "danger",
          type: "danger",
        });
      });

    setFavorites([...temp]);
  };

  const searchRecipe = async (val) => {
    if (val) {
      let recipes = [];
      let tempRecipes = [];

      val = val.toLowerCase();

      // Searched recipes

      await firebase
        .firestore()
        .collection("recipes")
        .where("name_lowercase", ">=", val)
        .where("name_lowercase", "<=", val + "\uF7FF")
        .get()
        .then((snap) => {
          if (!snap.empty) tempRecipes = snap.docs;
        });

      if (tempRecipes.length) {
        await Promise.all(
          tempRecipes.map(async (doc) => {
            if (favorites.findIndex((item) => item.key == doc.id) >= 0) {
              recipes.push({
                key: doc.id,
                value: doc.data(),
              });
            }
          })
        );
      }

      await firebase
        .firestore()
        .collection("recipes")
        .where("name_array", "array-contains", val)
        .get()
        .then((snap) => {
          if (!snap.empty) tempRecipes = snap.docs;
        });

      if (tempRecipes.length) {
        await Promise.all(
          tempRecipes.map(async (doc) => {
            if (
              recipes.findIndex((item) => item.key == doc.id) < 0 &&
              favorites.findIndex((item) => item.key == doc.id) >= 0
            ) {
              recipes.push({
                key: doc.id,
                value: doc.data(),
              });
            }
          })
        );
      }

      setRecipesList(recipes);
    }
  };

  if (initializing) {
    return (
      <View style={global.appContainer}>
        <View style={global.searchTopbar}>
          <SearchBar
            lightTheme
            round
            containerStyle={global.searchbar}
            inputContainerStyle={{ backgroundColor: "white" }}
            placeholder="Search for favorites"
            inputStyle={{ fontSize: 15 }}
          />
        </View>
      </View>
    );
  }

  if (user) {
    return (
      <View style={global.appContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={global.searchTopbar}>
            <SearchBar
              lightTheme
              round
              showCancel
              platform={Platform.OS == "ios" ? "ios" : "android"}
              cancelButtonProps={{ color: "white" }}
              containerStyle={global.searchbar}
              inputContainerStyle={{ backgroundColor: "white" }}
              placeholder="Search for favorites"
              inputStyle={{ fontSize: 15 }}
              onFocus={() => setPress(true)}
              onChangeText={(val) => {
                setSearchValue(val);
                searchRecipe(val);
              }}
              value={searchValue}
              onCancel={() => {
                setPress(false);
              }}
            />
          </View>
        </TouchableWithoutFeedback>
        <ScrollView showsVerticalScrollIndicator={false} style={{ zIndex: 3 }}>
          <View style={styles.postsContainer}>
            {user && favorites.length > 0 && !press && !searchValue && (
              <FlashList
                data={favorites}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={global.itemContainer}
                    onPress={() =>
                      navigation.navigate("DishStack", { doc: item.key })
                    }
                  >
                    <View style={[global.list]}>
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
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {item.value.name}
                          </Text>
                          <Text style={{ color: "gray" }}>
                            {item.value.difficulty}
                          </Text>
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
                        onPress={() => unfavorite(item.key)}
                      >
                        <Icon name="heart" color={"#FF4343"} size={20} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={2}
                showsVerticalScrollIndicator={false}
              />
            )}
            {user && favorites.length > 0 && press && searchValue && (
              <FlashList
                data={recipesList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={global.itemContainer}
                    onPress={() =>
                      navigation.navigate("DishStack", { doc: item.key })
                    }
                  >
                    <View style={[global.list]}>
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
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {item.value.name}
                          </Text>
                          <Text style={{ color: "gray" }}>
                            {item.value.difficulty}
                          </Text>
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
                        onPress={() => unfavorite(item.key)}
                      >
                        <Icon name="heart" color={"#FF4343"} size={20} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={2}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={global.appContainer}>
      <View style={global.searchTopbar}>
        <SearchBar
          lightTheme
          round
          showCancel
          platform={Platform.OS == "ios" ? "ios" : "android"}
          cancelButtonProps={{ color: "white" }}
          containerStyle={global.searchbar}
          inputContainerStyle={{ backgroundColor: "white" }}
          placeholder="Search for favorites"
          inputStyle={{ fontSize: 15 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    marginBottom: 150,
    marginTop: 10,
  },
});
