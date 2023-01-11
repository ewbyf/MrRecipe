import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import global from "../../../Styles";
import { AirbnbRating, Rating } from "react-native-ratings";
import BackArrow from "../../../components/BackArrow";
import { useState, useEffect, useRef } from "react";
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
import Dialog from 'react-native-dialog';
import { showMessage } from "react-native-flash-message";

export default function Dish({ navigation }) {
  const route = useRoute();
  const [posting, setPosting] = useState(false);
  const [recipeData, setRecipeData] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [rating, setRating] = useState(0);
  const [authorData, setAuthorData] = useState();
  const [userData, setUserData] = useState();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [pressed, setPressed] = useState(false);

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

  const fetchRecipe = async() => {
    firebase
    .firestore()
    .collection("recipes")
    .doc(route.params.doc)
    .get()
    .then((snapshot) => {
      setRecipeData(snapshot.data());
    });
  }

  useEffect(() => {
    firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .get()
      .then((snapshot) => {
        setRecipeData(snapshot.data());
        let user = firebase.auth().currentUser;
        if (user && Object.keys(snapshot.data().rated).includes(user.uid)) {
          setRating(snapshot.data().rated[user.uid]);
        }
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

      if (Object.keys(rated).includes(userData.uid)) {
        newRating =
          (recipeData.rating * recipeData.numratings -
            recipeData.rated[userData.uid] +
            rating) /
          recipeData.numratings;
        rated[userData.uid] = rating;
      } else {
        newRating =
          (recipeData.rating * recipeData.numratings + rating) /
            (recipeData.numratings + 1);
        numRatings++;
        rated[userData.uid] = rating;

        firebase.firestore().collection("users").doc(userData.uid).get()
        .then((snap) => {
          let temp = snap.data().ratings;
          temp.push(route.params.doc);
          firebase.firestore().collection("users").doc(userData.uid).update({ratings: temp});
        })
      }

      let weight = newRating + (5 * (1 - Math.E ** (-numRatings / 50)));

      firebase
        .firestore()
        .collection("recipes")
        .doc(route.params.doc)
        .update({ rating: newRating, numratings: numRatings, rated, weight });

      fetchRecipe();
    } else {
      Alert.alert("Not Logged In", "You must be logged in to leave a rating.");
    }
  };

  const optionsStyles = {
    optionsContainer: {
      width: 150,
      borderRadius: 15,
    },
  };

  const deleteRecipe = async() => {
    let recipes = authorData.recipes;
    recipes.splice(recipes.indexOf(route.params.doc), 1);

    await firebase.firestore().collection('recipes').doc(route.params.doc).delete()
    .then(() => {
      if (recipeData.image) {
        let imageRef = firebase.storage().refFromURL(recipeData.image);
        imageRef.delete();
      }

      firebase
      .firestore()
      .collection("users")
      .doc(authorData.uid)
      .update({
        recipes
      });
      setDeleteVisible(false);
      navigation.goBack(null);
    })
    .catch((error) => alert(error.message));
  }

  const submitComment = async() => {
    if (userData) {
      if (comment.replace(/\s/g, "")) {
        let timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let tempComments = recipeData.comments;

        await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snap) => {
          let key = timestamp + snap.data().username;
          let temp = snap.data().comments;
          temp.push({key, recipe: route.params.doc});

          firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            comments: temp
          });

          tempComments.push({key, uid: snap.data().uid, comment, timestamp})
        });


        await firebase
        .firestore()
        .collection("recipes")
        .doc(route.params.doc)
        .update({ 
          comments: tempComments
         })
         .then(() => {
          showMessage({
            message: "Comment successfully posted!",
            type: "success",
          });
          fetchRecipe();
          setComment('');
         });
      }
    }
    else {
      Alert.alert("Not Signed In", "You must be signed in to post a comment.");
    }
    setPosting(false);
  }

  const Comments = () => {
    if (recipeData.comments.length == 0) {
      return null;
    }

    return (
      <View style={{height: '100%', marginBottom: 40}}>
        <FlashList
          data={recipeData.comments}
          renderItem={({ item }) => (
            <CommentRender item={item}/>
          )}
          estimatedItemSize={10}
        /> 
      </View>
    );
  }

  const CommentRender = ({item}) => {
    const [commenterData, setCommenterData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      firebase.firestore().collection('users').doc(item.uid).get()
      .then((snap) => {
        if (snap.exists) {
          setCommenterData(snap.data());
        }
        setLoading(false);
      });
    }, []);

    if (loading) return null;
    
    return (
      <View style={{minHeight: 40, marginTop: 15}}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity 
              disabled={pressed}
              onPress={() => {
                if (item.uid == route.params.id) {
                  setPressed(true);
                  navigation.goBack(null);
                }
                else {
                  navigation.push("ProfileScreen", {doc: route.params.doc, id: item.uid});
                }
              }}>
              <Image source={{uri: (commenterData.pfp ? commenterData.pfp : "https://imgur.com/hNwMcZQ.png")}} style={styles.smallPfp} />
            </TouchableOpacity>
            <View style={{maxWidth: '85%'}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity 
                  disabled={pressed}
                  onPress={() => {
                    if (item.uid == route.params.id) {
                      setPressed(true);
                      navigation.goBack(null);
                    }
                    else {
                      navigation.push("ProfileScreen", {doc: route.params.doc, id: item.uid});
                    }
                  }}>
                  <Text style={[styles.username, {fontSize: 15, marginBottom: 3}]}>{commenterData.username}</Text>
                </TouchableOpacity>
                <Text style={{color: 'gray'}}> • {item.timestamp.toDate().toDateString()}</Text>
              </View>
            
            <Text style={{color: 'white', fontSize: 15}}>{item.comment}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (initializing) {
    return null;
  }

  return (
    <View style={global.appContainer}>
      {/* Delete recipe pop up */} 
      <Dialog.Container visible={deleteVisible}>
        <Dialog.Title>Delete Recipe</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this recipe? You cannot undo this action.
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => {setDeleteVisible(false)}}/>
        <Dialog.Button label="Delete" style={{color: 'red'}} onPress={() => deleteRecipe()}/>
      </Dialog.Container>

      <View style={global.topbar}>
        <BackArrow navigation={navigation}/>
        <Text style={global.topbarTitle}>{recipeData.name}</Text>
        {userData && recipeData.username == userData.username && (
          <Menu style={styles.dotsContainer}>
            <MenuTrigger
              text="..."
              customStyles={{ triggerText: styles.dots }}
            />
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption
                disabled={true}
                children={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{color: 'gray', fontSize: 12}}>Options</Text>
                  </View>
                }
              />
              <MenuOption
                onSelect={() => navigation.navigate("EditScreen", {doc: route.params.doc})}
                children={
                  <View
                    style={styles.popup}
                  >
                    <Text>Edit</Text>
                    <Icon name="pencil-outline" size={18} />
                  </View>
                }
                customStyles={{
                  optionWrapper: { borderTopWidth: 1, borderTopColor: "lightgrey" },
                }}
              />
              <MenuOption
                onSelect={() => setDeleteVisible(true)}
                children={
                  <View
                    style={styles.popup}
                  >
                    <Text style={{color: '#FF4343'}}>Delete</Text>
                    <Icon name="trash-outline" color={'#FF4343'} size={18} />
                  </View>
                }
                customStyles={{
                  optionWrapper: { borderTopWidth: 1, borderTopColor: "lightgrey" },
                }}
              />
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
            {recipeData.description ? recipeData.description : "No description provided"}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              <Text style={{ color: "#518BFF", fontWeight: "bold" }}>
                Cook Time:
              </Text>{" "}
              {Math.floor(recipeData.cooktime / 60)} hrs{" "}
              {recipeData.cooktime % 60} min
            </Text>
            <Text style={styles.timeText}>
              <Text style={{ color: "#518BFF", fontWeight: "bold" }}>
                Prep Time:
              </Text>{" "}
              {Math.floor(recipeData.preptime / 60)} hrs{" "}
              {recipeData.preptime % 60} min
            </Text>
          </View>
          <View style={styles.profileRow}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                disabled={pressed}
                onPress={() => {
                  if (authorData.uid == route.params.id) {
                    if (navigation.canGoBack()) {
                      setPressed(true);
                      navigation.goBack(null);
                    }
                  }
                  else {
                    navigation.push("ProfileScreen", {doc: route.params.doc, id: authorData.uid});
                  }
                }}
              >
                <Image
                  source={{ uri: (authorData.pfp ? authorData.pfp : 'https://imgur.com/hNwMcZQ.png') }}
                  style={styles.authorPfp}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.username}>{authorData.username}</Text>
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
                  {parseFloat(recipeData.rating.toFixed(2))} ({recipeData.numratings})
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
            defaultRating={rating}
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
          <Image
            source={{
              uri:
                userData && userData.pfp
                  ? userData.pfp
                  : "https://imgur.com/hNwMcZQ.png",
            }}
            style={styles.smallPfp}
          />
          <TextInput
            style={{ ...styles.input }}
            placeholder="Add a comment..."
            placeholderTextColor="#494949"
            maxLength={150}
            blurOnSubmit={true}
            value={comment}
            onChangeText={(comment) => setComment(comment)}
          ></TextInput>
          <Icon
            name="send"
            disabled={posting}
            size={20}
            color={comment.replace(/\s/g, "") ? "#518BFF" : 'gray'}
            style={{ marginLeft: "auto" }}
            onPress={() => {
              setPosting(true);
              submitComment();
            }}
          />
        </View>
        <Comments/>
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
  popup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 5,
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
