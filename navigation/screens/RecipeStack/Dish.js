import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Touchable,
} from "react-native";
import global from "../../../Styles";
import { AirbnbRating, Rating } from "react-native-ratings";
import BackArrow from "../../../components/BackArrow";
import { useState, useEffect } from "react";
import { firebase } from "../../../config";
import { useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

export default function Dish({ props, navigation }) {
  const route = useRoute();
  const [recipeData, setRecipeData] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [oldRating, setOldRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [authorData, setAuthorData] = useState();
  const [userData, setUserData] = useState();
  const [opened, setOpened] = useState(false);

  function onAuthStateChanged(userParam) {
    if (userParam) fetchUser();
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const fetchUser = async() => {
    await firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setUserData(snapshot.data());
      }
    });
  };

  useEffect(() => {
    firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .get()
      .then((snapshot) => {
        setRecipeData(snapshot.data());
        firebase
          .firestore()
          .collection("users")
          .doc(snapshot.data().uid)
          .get()
          .then((snap) => {
            setAuthorData(snap.data());
            setInitializing(false);
          });
      });
  }, []);

  const rate = (rating) => {
    if (userData) {
      let newRating = 0;
      let numRatings = recipeData.numratings;
      let rated = recipeData.rated;
      if (rated.has(userData.uid)) {
        newRating = ((recipeData.rating * recipeData.numratings - recipeData.rated[userData.uid] + rating) / recipeData.numratings);
        rated[userData.uid] = rating;
      }
      else {
        newRating = ((recipeData.rating * recipeData.numratings + rating) / recipeData.numratings + 1);
        numRatings++;
        rated[userData.uid] = rating;
      }
      firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .update(
        {rating: newRating, numratings: numRatings, rated}
      );
    }
    else {
      Alert.alert("Not Logged In", "You must be logged in to leave a rating.")
    }
  }

  const optionsStyles = {
    optionText: {
      color: 'black',
      margin: 10,
    },
    optionsContainer: {
      padding: 5,
      width: 120,
    },
  };

  if (initializing) {
    return null;
  }

  return (
    <View style={global.appContainer}>
      <View style={global.topbar}>
        <BackArrow navigation={navigation} />
        <Text style={global.topbarTitle}>{recipeData.name}</Text>
        {userData && recipeData.username == userData.username && (
          <Menu style={styles.dotsContainer}>
            <MenuTrigger text='...' customStyles={{triggerText: styles.dots}} />
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption onSelect={() => alert(`Edit`)} text='Edit' />
              <MenuOption onSelect={() => alert(`Delete`)} text = 'Delete' />
            </MenuOptions>
          </Menu>
        )}
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ padding: 15 }}
      >
        <Image
          source={{
            uri: recipeData.image
              ? recipeData.image
              : "https://imgur.com/hNwMcZQ.png",
          }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.desc}>
            <Text style={{ color: "#518BFF", fontWeight: "bold" }}>
              Description:{" "}
            </Text>
            {recipeData.description}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              <Text style={{ color: "#518BFF", fontWeight: "bold" }}>
                Cook:
              </Text>{" "}
              {Math.floor(recipeData.cooktime / 60)} hrs{" "}
              {recipeData.cooktime % 60} min
            </Text>
            <Text style={styles.timeText}>
              <Text style={{ color: "#518BFF", fontWeight: "bold" }}>
                Prep:
              </Text>{" "}
              {Math.floor(recipeData.preptime / 60)} hrs{" "}
              {recipeData.preptime % 60} min
            </Text>
          </View>
          <View style={styles.profileRow}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => navigation.navigate("ProfileScreen")}
              >
                <Image
                  source={{ uri: recipeData.userpfp }}
                  style={styles.authorPfp}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.username}>{recipeData.username}</Text>
                  <Text style={{ color: "gray" }}>
                    {authorData.recipes.length} Posts
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.difficulty}>
                <Text style={{ color: "#518BFF" }}>Difficulty:</Text>{" "}
                {recipeData.difficulty}
              </Text>
              <View style={styles.ratingContainer}>
                <Rating
                  ratingCount={5}
                  imageSize={20}
                  readonly={true}
                  type={"custom"}
                  ratingBackgroundColor={"gray"}
                  tintColor={"#222222"}
                  startingValue={recipeData.rating}
                />
                <Text style={[global.rating, { marginRight: 0 }]}>
                  {recipeData.rating} ({recipeData.numratings})
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.recipeContainer}>
          <Text style={styles.title}>Ingredients</Text>
          {recipeData.ingredients.map((data, key) => (
            <View key={key} style={styles.listContainer}>
              <Text style={[styles.listText, { fontWeight: "bold" }]}>• </Text>
              <Text style={[styles.listText, { paddingRight: 15 }]}>
                {data}
              </Text>
            </View>
          ))}

          <Text style={[styles.title, { marginTop: 8 }]}>Instructions</Text>
          {recipeData.instructions.map((data, key) => (
            <View key={key} style={styles.listContainer}>
              <Text style={styles.listText}>{key + 1}. </Text>
              <Text style={[styles.listText, { paddingRight: 15 }]}>
                {data}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>Leave a Rating</Text>
        <View>
          <AirbnbRating
            showRating={false}
            size={25}
            unSelectedColor={"gray"}
            defaultRating={0}
            onFinishRating={(val) => rate(val)}
            ratingContainerStyle={{
              alignSelf: "flex-start",
              marginVertical: 5,
            }}
          />
        </View>

        <Text style={styles.commentsTitle}>
          {recipeData.comments.length} Comments
        </Text>
        <View style={styles.commentContainer}>
          <Image source={{ uri: ((userData && userData.pfp) ? userData.pfp : "https://imgur.com/hNwMcZQ.png") }} style={styles.smallPfp} />
          <TextInput
            style={{ ...styles.input, height: 35, paddingVertical: 8 }}
            placeholder="Add a comment..."
            placeholderTextColor="#494949"
            multiline={true}
            maxLength={200}
            blurOnSubmit={true}
          ></TextInput>
          <Icon
            name="send"
            size={20}
            color={"#518BFF"}
            style={{ marginLeft: "auto" }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    position: "absolute",
    right: 20,
    bottom: "50%",
    marginBottom: -10,
  },
  dots: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  image: {
    height: 200,
    borderRadius: 20,
  },
  details: {
    width: "100%",
    marginVertical: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#363636",
    backgroundColor: "#222222",
  },
  desc: {
    color: "gray",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  authorPfp: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  difficulty: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  title: {
    color: "#518BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  recipeContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#363636",
    backgroundColor: "#222222",
    paddingBottom: 10,
  },
  listContainer: {
    flexDirection: "row",
    marginLeft: 10,
    paddingTop: 5,
  },
  listText: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 8,
  },
  commentContainer: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  smallPfp: {
    height: 35,
    width: 35,
    borderRadius: 50,
    marginRight: 10,
  },
  input: {
    backgroundColor: "#151515",
    height: 40,
    paddingHorizontal: 10,
    width: Dimensions.get("window").width - 100,
    borderRadius: 8,
    color: "white",
  },
  button: {
    backgroundColor: "#518BFF",
    width: 100,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
