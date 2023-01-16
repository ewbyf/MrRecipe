import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
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
import Dialog from "react-native-dialog";
import { showMessage } from "react-native-flash-message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export default function Dish({ navigation }) {
  const route = useRoute();
  const [recipeData, setRecipeData] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [rating, setRating] = useState(0);
  const [authorData, setAuthorData] = useState();
  const [userData, setUserData] = useState();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [reload, setReload] = useState(false);

  function onAuthStateChanged(userParam) {
    if (userParam) fetchUser();
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const fetchUser = async () => {
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

  const fetchRecipe = async () => {
    firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .get()
      .then((snapshot) => {
        setRecipeData(snapshot.data());
      });
  };

  useEffect(() => {
    dayjs.extend(relativeTime);
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
    navigation.addListener("focus", () => {
      setReload(!reload);
    });
  }, [navigation, reload]);

  const deleteRecipe = async () => {
    let recipes = authorData.recipes;
    recipes.splice(recipes.indexOf(route.params.doc), 1);

    await firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .delete()
      .then(() => {
        if (recipeData.image) {
          let imageRef = firebase.storage().refFromURL(recipeData.image);
          imageRef.delete();
        }

        firebase.firestore().collection("users").doc(authorData.uid).update({
          recipes,
        });
        setDeleteVisible(false);
        if (navigation.canGoBack()) navigation.goBack(null);
      })
      .catch((error) =>
        showMessage({
          message: error.message,
          icon: "danger",
          type: "danger",
        })
      );
  };

  const Heart = () => {
    const [liked, setLiked] = useState("gray");

    useEffect(() => {
      if (userData) {
        firebase
          .firestore()
          .collection("users")
          .doc(userData.uid)
          .get()
          .then((snap) => {
            if (snap.data().favorites.indexOf(route.params.doc) != -1) {
              setLiked("#FF4343");
            }
          })
          .catch((error) => {
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
          });
      }
    }, []);

    const favorite = async () => {
      if (userData) {
        await firebase
          .firestore()
          .collection("users")
          .doc(userData.uid)
          .get()
          .then((snap) => {
            let fav = snap.data().favorites;
            if (fav.indexOf(route.params.doc) != -1) {
              fav.splice(snap.data().favorites.indexOf(route.params.doc), 1);
              firebase
                .firestore()
                .collection("users")
                .doc(userData.uid)
                .update({ favorites: fav });
              setLiked("gray");
            } else {
              fav.push(route.params.doc);
              firebase
                .firestore()
                .collection("users")
                .doc(userData.uid)
                .update({ favorites: fav });
              setLiked("#FF4343");
            }
          })
          .catch((error) => {
            showMessage({
              message: error.message,
              icon: "danger",
              type: "danger",
            });
          });
      } else {
        showMessage({
          message: "Must be signed in to favorite a recipe",
          icon: "danger",
          type: "danger",
        });
      }
    };

    return (
      <TouchableOpacity onPress={() => favorite()}>
        <Icon name="heart" color={liked} size={30} />
      </TouchableOpacity>
    );
  };

  const Body = () => {
    const [recipeRating, setRecipeRating] = useState();
    const [recipeNumRatings, setRecipeNumRatings] = useState();
    const [currentRated, setCurrentRated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      firebase
        .firestore()
        .collection("recipes")
        .doc(route.params.doc)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setRecipeRating(snapshot.data().rating);
            setRecipeNumRatings(snapshot.data().numratings);
            setLoading(false);
          }
        });
    }, []);

    if (loading) return null;

    const rate = async (rating) => {
      if (userData) {
        let newRating = 0;
        let numRatings = 0;
        let rated = {};

        await firebase
          .firestore()
          .collection("recipes")
          .doc(route.params.doc)
          .get()
          .then((snap) => {
            numRatings = snap.data().numratings;
            rated = snap.data().rated;
          });

        if (Object.keys(rated).includes(userData.uid) || currentRated) {
          newRating =
            (recipeData.rating * recipeData.numratings -
              recipeData.rated[userData.uid] +
              rating) /
            recipeData.numratings;
          setRecipeRating(
            (recipeRating * recipeNumRatings - rated[userData.uid] + rating) /
              recipeNumRatings
          );
        } else {
          newRating =
            (recipeData.rating * recipeData.numratings + rating) /
            (recipeData.numratings + 1);
          numRatings++;
          setRecipeRating(
            (recipeRating * recipeNumRatings + rating) / (recipeNumRatings + 1)
          );
          setRecipeNumRatings(recipeNumRatings + 1);
          setCurrentRated(true);

          firebase
            .firestore()
            .collection("users")
            .doc(userData.uid)
            .get()
            .then((snap) => {
              let temp = snap.data().ratings;
              temp.push(route.params.doc);
              firebase
                .firestore()
                .collection("users")
                .doc(userData.uid)
                .update({ ratings: temp });
            });
        }

        rated[userData.uid] = rating;

        let weight = newRating + 5 * (1 - Math.E ** (-numRatings / 50));

        firebase
          .firestore()
          .collection("recipes")
          .doc(route.params.doc)
          .update({ rating: newRating, numratings: numRatings, rated, weight });
      } else {
        showMessage({
          message: "Must be signed in to leave a rating",
          icon: "danger",
          type: "danger",
        });
      }
    };

    return (
      <View>
        <View style={styles.details}>
          {recipeData.description && (
            <Text style={styles.desc}>{recipeData.description}</Text>
          )}
          {!recipeData.description && (
            <Text style={[styles.desc, { fontStyle: "italic" }]}>
              No description provided
            </Text>
          )}
          <View style={styles.timeContainer}>
            <View style={{ justifyContent: "space-between" }}>
              <Text style={styles.timeText}>
                <Text style={styles.nunitoText}>Prep Time:</Text>{" "}
                {Math.floor(recipeData.preptime / 60)} hrs{" "}
                {recipeData.preptime % 60} min
              </Text>
              <Text style={styles.timeText}>
                <Text style={styles.nunitoText}>
                  Cook Time:
                </Text>{" "}
                {Math.floor(recipeData.cooktime / 60)} hrs{" "}
                {recipeData.cooktime % 60} min
              </Text>
            </View>
            <View>
              <Text style={styles.difficulty}>
                <Text
                  style={styles.nunitoText}
                >
                  Difficulty:
                </Text>{" "}
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
                  startingValue={recipeRating}
                />
                <Text style={[global.rating, { marginRight: 0 }]}>
                  {parseFloat(recipeRating.toFixed(2))} ({recipeNumRatings})
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.profileRow}>
            <View style={{ flexDirection: "row", flex: 4 }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                disabled={pressed}
                onPress={() => {
                  if (authorData.uid == route.params.id) {
                    if (navigation.canGoBack()) {
                      setPressed(true);
                      navigation.goBack(null);
                    }
                  } else {
                    navigation.push("ProfileScreen", {
                      doc: route.params.doc,
                      id: authorData.uid,
                    });
                  }
                }}
              >
                <Image
                  source={{
                    uri: authorData.pfp
                      ? authorData.pfp
                      : "https://imgur.com/hNwMcZQ.png",
                  }}
                  style={styles.authorPfp}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.username} numberOfLines={1}>
                    {authorData.username}
                  </Text>
                  <Text style={{ color: "gray" }}>
                    {authorData.recipes.length}{" "}
                    {authorData.recipes.length == 1 ? "Post" : "Posts"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Heart />
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

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
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
          </View>
        </View>
      </View>
    );
  };

  const Comments = () => {
    const [posting, setPosting] = useState(false);
    const [comment, setComment] = useState("");
    const [commentsData, setCommentsData] = useState();
    const [loading, setLoading] = useState(true);
    const [numComments, setNumComments] = useState();

    useEffect(() => {
      firebase
        .firestore()
        .collection("recipes")
        .doc(route.params.doc)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setCommentsData(snapshot.data().comments);
            setNumComments(snapshot.data().comments.length);
            setLoading(false);
          }
        });
    }, []);

    const submitComment = async () => {
      if (userData) {
        if (comment.replace(/\s/g, "")) {
          let timestamp = firebase.firestore.Timestamp.fromDate(new Date());
          let tempComments = [];

          firebase
            .firestore()
            .collection("recipes")
            .doc(route.params.doc)
            .get()
            .then((snap) => {
              tempComments = snap.data().comments;
            });

          await firebase
            .firestore()
            .collection("users")
            .doc(userData.uid)
            .get()
            .then((snap) => {
              let key = timestamp + snap.data().username;
              let temp = snap.data().comments;
              temp.push({ key, recipe: route.params.doc });

              firebase
                .firestore()
                .collection("users")
                .doc(userData.uid)
                .update({
                  comments: temp,
                });

              tempComments.push({
                key,
                uid: snap.data().uid,
                comment,
                timestamp,
              });
              setCommentsData([
                ...commentsData,
                { key, uid: snap.data().uid, comment, timestamp },
              ]);
            });

          await firebase
            .firestore()
            .collection("recipes")
            .doc(route.params.doc)
            .update({
              comments: tempComments,
            })
            .then(() => {
              showMessage({
                message: "Comment successfully posted!",
                type: "success",
              });
              setNumComments(numComments + 1);
              setComment("");
            });
        }
      } else {
        showMessage({
          message: "Must be signed in to post a comment",
          icon: "danger",
          type: "danger",
        });
      }
      setPosting(false);
    };

    const CommentList = () => {
      if (commentsData.length == 0) {
        return null;
      }

      return (
        <View style={{ height: "100%", marginBottom: 40 }}>
          <FlashList
            data={commentsData.slice().reverse()}
            renderItem={({ item }) => <CommentRender item={item} />}
            estimatedItemSize={10}
          />
        </View>
      );
    };

    if (loading) return null;

    return (
      <View>
        <Text style={styles.commentsTitle}>{numComments} Comments</Text>
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
            color={comment.replace(/\s/g, "") ? "#518BFF" : "gray"}
            style={{ marginLeft: "auto" }}
            onPress={() => {
              setPosting(true);
              submitComment();
            }}
          />
        </View>
        <CommentList />
      </View>
    );
  };

  const CommentRender = ({ item }) => {
    const [commenterData, setCommenterData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      firebase
        .firestore()
        .collection("users")
        .doc(item.uid)
        .get()
        .then((snap) => {
          if (snap.exists) {
            setCommenterData(snap.data());
          }
          setLoading(false);
        });
    }, []);

    if (loading || !commenterData) return null;

    return (
      <View style={{ minHeight: 40, marginTop: 15 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            disabled={pressed}
            onPress={() => {
              if (item.uid == route.params.id) {
                setPressed(true);
                navigation.goBack(null);
              } else {
                navigation.push("ProfileScreen", {
                  doc: route.params.doc,
                  id: item.uid,
                });
              }
            }}
          >
            <Image
              source={{
                uri: commenterData.pfp
                  ? commenterData.pfp
                  : "https://imgur.com/hNwMcZQ.png",
              }}
              style={styles.smallPfp}
            />
          </TouchableOpacity>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                disabled={pressed}
                onPress={() => {
                  if (item.uid == route.params.id) {
                    setPressed(true);
                    navigation.goBack(null);
                  } else {
                    navigation.push("ProfileScreen", {
                      doc: route.params.doc,
                      id: item.uid,
                    });
                  }
                }}
              >
                <Text
                  style={[styles.username, { fontSize: 15 }]}
                  numberOfLines={1}
                >
                  {commenterData.name}
                  <Text
                    style={{
                      color: "gray",
                      fontSize: 12.5,
                      fontFamily: "NunitoExtraBold",
                    }}
                  >
                    {" "}
                    @{commenterData.username}
                  </Text>
                </Text>
              </TouchableOpacity>
              <Text style={{ color: "gray", fontSize: 12.5 }}>
                {" "}
                • {dayjs(item.timestamp.toDate()).fromNow()}
              </Text>
            </View>
            <Text style={{ color: "white", fontSize: 15, marginTop: 3 }}>
              {item.comment}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (initializing) {
    return (
      <View style={global.appContainer}>
        <View style={global.topbar}></View>
      </View>
    );
  }

  return (
    <View style={global.appContainer}>
      {/* Delete recipe pop up */}
      <Dialog.Container visible={deleteVisible}>
        <Dialog.Title>Delete Recipe</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this recipe? You cannot undo this
          action.
        </Dialog.Description>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setDeleteVisible(false);
          }}
        />
        <Dialog.Button
          label="Delete"
          style={{ color: "red" }}
          onPress={() => deleteRecipe()}
        />
      </Dialog.Container>

      <View style={global.topbar}>
        <BackArrow navigation={navigation} />
        <Text
          style={[global.topbarTitle, { maxWidth: "70%" }]}
          numberOfLines={2}
        >
          {recipeData.name}
        </Text>
        {userData && authorData.username == userData.username && (
          <Menu style={styles.dotsContainer}>
            <MenuTrigger
              text="..."
              customStyles={{ triggerText: styles.dots }}
            />
            <MenuOptions
              customStyles={{
                optionsContainer: { width: 150, borderRadius: 15 },
              }}
            >
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
                    <Text style={{ color: "gray", fontSize: 12 }}>Options</Text>
                  </View>
                }
              />
              <MenuOption
                onSelect={() =>
                  navigation.navigate("EditScreen", { doc: route.params.doc })
                }
                children={
                  <View style={styles.popup}>
                    <Text>Edit</Text>
                    <Icon name="pencil-outline" size={18} />
                  </View>
                }
                customStyles={{
                  optionWrapper: {
                    borderTopWidth: 1,
                    borderTopColor: "lightgrey",
                  },
                }}
              />
              <MenuOption
                onSelect={() => setDeleteVisible(true)}
                children={
                  <View style={styles.popup}>
                    <Text style={{ color: "#FF4343" }}>Delete</Text>
                    <Icon name="trash-outline" color={"#FF4343"} size={18} />
                  </View>
                }
                customStyles={{
                  optionWrapper: {
                    borderTopWidth: 1,
                    borderTopColor: "lightgrey",
                  },
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

        <Body />

        <Comments />
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
    width: "100%",
    borderRadius: 20,
    aspectRatio: 5 / 3,
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
    textAlign: "center",
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
    maxWidth: Dimensions.get("window").width / 2 + 30,
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
  nunitoText: { color: "#518BFF", fontFamily: "NunitoExtraBold" },
  title: {
    color: "#518BFF",
    fontSize: 18,
    fontFamily: "NunitoExtraBold",
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
    fontFamily: 'NunitoExtraBold'
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
