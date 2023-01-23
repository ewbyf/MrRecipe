import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
} from "react-native";
import global from "../../../Styles";
import { useState, useEffect } from "react";
import { firebase } from "../../../config";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { SelectList } from "react-native-dropdown-select-list";
import Dialog from "react-native-dialog";
import { useRoute } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FastImage from "react-native-fast-image";

export default function Edit({ navigation }) {
  const route = useRoute();
  const [recipeData, setRecipeData] = useState();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [cookHrs, setCookHrs] = useState("");
  const [cookMin, setCookMin] = useState("");
  const [prepHrs, setPrepHrs] = useState("");
  const [prepMin, setPrepMin] = useState("");
  const [ingredients, setIngredients] = useState([{ key: 0, value: "" }]);
  const [instructions, setInstructions] = useState([{ key: 0, value: "" }]);
  const [changed, setChanged] = useState(false);

  const [discardVisible, setDiscardVisible] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const data = [
    { key: "Easy", value: "Easy" },
    { key: "Medium", value: "Medium" },
    { key: "Hard", value: "Hard" },
  ];

  useEffect(() => {
    firebase
      .firestore()
      .collection("recipes")
      .doc(route.params.doc)
      .get()
      .then((snap) => {
        setRecipeData(snap.data());
        setImage(snap.data().image);
        setName(snap.data().name);
        setDescription(snap.data().description);
        setDifficulty(snap.data().difficulty);
        setCookHrs(Math.floor(snap.data().cooktime / 60).toString());
        setCookMin((snap.data().cooktime % 60).toString());
        setPrepMin((snap.data().preptime % 60).toString());
        setPrepHrs(Math.floor(snap.data().preptime / 60).toString());

        let tempIns = [];
        for (let i = 0; i < snap.data().instructions.length; i++) {
          tempIns.push({ key: i, value: snap.data().instructions[i] });
        }
        setInstructions(tempIns);

        let tempIng = [];
        for (let i = 0; i < snap.data().ingredients.length; i++) {
          tempIng.push({ key: i, value: snap.data().ingredients[i] });
        }
        setIngredients(tempIng);
      });
  }, []);

  const takePhoto = async () => {
    if ((await ImagePicker.getCameraPermissionsAsync()).granted == false) {
      await ImagePicker.requestCameraPermissionsAsync();
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 3],
    });
    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      setImage(source);
      if (!changed) setChanged(true);
    }
  };

  const choosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 3],
    });

    if (!result.canceled) {
      const source = result.assets[0].uri;
      setImage(source);
      if (!changed) setChanged(true);
    }
  };

  const uploadPhoto = async () => {
    if (image == null) return null;

    if (image == recipeData.image) return image;

    let imageRef = firebase.storage().refFromURL(recipeData.image);
    imageRef.delete();

    const response = await fetch(image);
    const blob = await response.blob();
    const filename = image.substring(image.lastIndexOf("/") + 1);
    var ref = firebase.storage().ref().child(filename).put(blob);
    try {
      await ref;
      const url = await firebase
        .storage()
        .ref()
        .child(filename)
        .getDownloadURL();
      return url;
    } catch (error) {
      showMessage({
        message: error.message,
        icon: "danger",
        type: "danger",
      });
    }
  };

  const addHandler = (type) => {
    if (type == "ingredients") {
      const _inputs = [...ingredients];
      if (ingredients[_inputs.length - 1].value == "") {
        showMessage({
          message: "Please enter an ingredient before creating another",
          icon: "danger",
          type: "danger",
        });
        return;
      }
      _inputs.push({ key: "", value: "" });
      setIngredients(_inputs);
    } else {
      const _inputs = [...instructions];
      if (instructions[_inputs.length - 1].value == "") {
        showMessage({
          message: "Please enter an ingredient before creating another",
          icon: "danger",
          type: "danger",
        });
        return;
      }
      _inputs.push({ key: "", value: "" });
      setInstructions(_inputs);
    }
  };

  const deleteHandler = (key, type) => {
    if (type == "ingredients") {
      const _inputs = ingredients.filter((ingredients, index) => index != key);
      setIngredients(_inputs);
    } else {
      const _inputs = instructions.filter(
        (instructions, index) => index != key
      );
      setInstructions(_inputs);
    }
  };

  const inputHandler = (text, key, type) => {
    if (type == "ingredients") {
      const _inputs = [...ingredients];
      _inputs[key].value = text;
      _inputs[key].key = key;
      setIngredients(_inputs);
    } else {
      const _inputs = [...instructions];
      _inputs[key].value = text;
      _inputs[key].key = key;
      setInstructions(_inputs);
    }
  };

  const convertNumber = (text) => {
    return text.replace(/[^0-9]/g, "");
  };

  const convertName = (text) => {
    return text.replace(/[^0-9a-zA-Z!:&$,\/()#%+ -]/g, "");
  };

  const convertText = (text) => {
    return text.replace(/[^0-9a-zA-Z.?:!&$,\/()#%+ -]/g, "");
  };

  const publish = async () => {
    if (
      name &&
      difficulty &&
      (cookHrs || cookMin) &&
      ingredients[0].value &&
      instructions[0].value
    ) {
      const preptime = Number(prepMin) + Number(prepHrs) * 60;
      const cooktime = Number(cookMin) + Number(cookHrs) * 60;
      const ingredientsArray = [];
      const instructionsArray = [];

      for (let i = 0; i < ingredients.length; i++) {
        if (ingredients[i].value) {
          ingredientsArray.push(ingredients[i].value);
        }
      }
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].value) {
          instructionsArray.push(instructions[i].value);
        }
      }
      const ref = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);

      let imgUrl = await uploadPhoto();

      await ref
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            firebase
              .firestore()
              .collection("recipes")
              .doc(route.params.doc)
              .update({
                name,
                name_lowercase: name.toLowerCase(),
                name_array: name.toLowerCase().match(/\b(\w+)\b/g),
                description,
                difficulty,
                cooktime,
                preptime,
                ingredients: ingredientsArray,
                instructions: instructionsArray,
                image: imgUrl,
              })
              .then(() => {
                navigation.goBack(null);
                setPublishing(false);
                showMessage({
                  message: "Recipe successfully edited!",
                  type: "success",
                });
                setChanged(false);
              })
              .catch((error) => {
                showMessage({
                  message: error.message,
                  icon: "danger",
                  type: "danger",
                });
              });
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
  };

  const checkFieldChanged = () => {
    if (
      recipeData.image != image ||
      recipeData.name != name ||
      recipeData.description != description ||
      Math.floor(recipeData.cooktime / 60).toString() != cookHrs ||
      Math.floor(recipeData.cooktime % 60).toString() != cookMin ||
      Math.floor(recipeData.preptime / 60).toString() != prepHrs ||
      Math.floor(recipeData.preptime % 60).toString() != prepMin ||
      instructions.length != recipeData.instructions.length ||
      ingredients.length != recipeData.ingredients.length
    ) {
      return true;
    }
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].value != recipeData.instructions[i]) {
        return true;
      }
    }
    for (let i = 0; i < ingredients.length; i++) {
      if (ingredients[i].value != recipeData.ingredients[i]) {
        return true;
      }
    }
    return false;
  };

  return (
    <View style={global.appContainer}>
      {/* Discard changes pop up */}
      <Dialog.Container visible={discardVisible}>
        <Dialog.Title>Unsaved Changes</Dialog.Title>
        <Dialog.Description>
          Your current changes are unsaved. Would you like to discard or save
          them? Note: Your saved changes will be lost if you close the app or
          sign out.
        </Dialog.Description>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setDiscardVisible(false);
          }}
        />
        <Dialog.Button
          label="Discard"
          style={{ color: "red" }}
          onPress={() => {
            setDiscardVisible(false);
            navigation.goBack(null);
          }}
        />
      </Dialog.Container>

      <View style={global.topbar}>
        <Icon
          name="arrow-back-outline"
          size={30}
          color="white"
          style={styles.backArrow}
          onPress={() => {
            if (checkFieldChanged()) {
              setDiscardVisible(true);
            } else if (navigation.canGoBack()) {
              navigation.goBack(null);
            }
          }}
        />
        <Text style={global.topbarTitle}>Edit Recipe</Text>
        <TouchableOpacity
          disabled={
            publishing ||
            !(
              name &&
              difficulty &&
              (cookHrs || cookMin) &&
              ingredients[0].value &&
              instructions[0].value &&
              changed
            )
          }
          onPress={() => {
            setPublishing(true);
            publish();
          }}
          style={styles.button}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color:
                  name &&
                  difficulty &&
                  (cookHrs || cookMin) &&
                  ingredients[0].value &&
                  instructions[0].value &&
                  changed
                    ? "white"
                    : "gray",
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.items}>
          {!image && (
            <View style={styles.photoSelect}>
              <Icon name="image" size={75} color={"gray"} />
              <View style={{ alignItems: "center", marginVertical: 5 }}>
                <TouchableOpacity onPress={choosePhoto}>
                  <Text style={[styles.addText, { color: "#518BFF" }]}>
                    Choose Photo
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: "gray",
                  fontSize: 15,
                  fontFamily: "NunitoBold",
                }}
              >
                or
              </Text>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                <TouchableOpacity onPress={takePhoto}>
                  <Text style={[styles.addText, { color: "#518BFF" }]}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {image && (
            <View style={{ alignItems: "center" }}>
              <FastImage
                source={{ uri: image.uri ? image.uri : image }}
                style={{
                  width: 350,
                  height: undefined,
                  marginTop: 20,
                  aspectRatio: 5 / 3,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setImage(null);
                  if (!changed) setChanged(true);
                }}
              >
                <Text
                  style={{
                    ...styles.addText,
                    marginTop: 5,
                    color: "#518BFF",
                  }}
                >
                  Remove Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.title}>NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the name of your recipe"
              placeholderTextColor="#494949"
              maxLength={50}
              value={name}
              editable={!publishing}
              onChangeText={(title) => {
                setName(convertName(title));
                if (!changed) setChanged(true);
              }}
            ></TextInput>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>DESCRIPTION</Text>
            <TextInput
              style={{ ...styles.input, height: 100, paddingVertical: 8 }}
              placeholder="Enter a description for your recipe"
              placeholderTextColor="#494949"
              multiline={true}
              maxLength={200}
              blurOnSubmit={true}
              textAlignVertical="top"
              value={description}
              editable={!publishing}
              onChangeText={(desc) => {
                setDescription(desc);
                if (!changed) setChanged(true);
              }}
            ></TextInput>
            <Text
              style={{
                color: "#494949",
                position: "absolute",
                right: 10,
                bottom: 5,
              }}
            >
              {description.length}/200
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>DIFFICULTY</Text>
            <SelectList
              data={data}
              setSelected={(diff) => {
                setDifficulty(diff);
                if (!changed && recipeData && diff != recipeData.difficulty)
                  setChanged(true);
              }}
              defaultOption={{ key: difficulty, value: difficulty }}
              search={false}
              disabled={publishing}
              inputStyles={{ color: "white" }}
              boxStyles={{
                borderWidth: 0,
                backgroundColor: "#151515",
                paddingHorizontal: 10,
                borderRadius: 8,
              }}
              arrowicon={
                <View style={{ justifyContent: "center", right: 6 }}>
                  <Icon
                    name="chevron-down-outline"
                    size={16}
                    style={{ color: "#494949" }}
                  />
                </View>
              }
              dropdownStyles={{ backgroundColor: "#151515", borderWidth: 0 }}
              dropdownTextStyles={{ color: "#adadad" }}
              dropdownItemStyles={{ borderWidth: 0 }}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.section, { width: "50%" }]}>
              <Text style={styles.title}>PREP TIME</Text>
              <View
                style={{
                  ...styles.section,
                  flexDirection: "row",
                  marginTop: 0,
                }}
              >
                <TextInput
                  style={styles.inputTime}
                  placeholder="0"
                  placeholderTextColor="#494949"
                  keyboardType="numeric"
                  maxLength={2}
                  multiline={true}
                  numberOfLines={1}
                  value={prepHrs}
                  editable={!publishing}
                  onChangeText={(text) => {
                    setPrepHrs(convertNumber(text));
                    if (!changed) setChanged(true);
                  }}
                />
                <View style={{ justifyContent: "center" }}>
                  <Text style={styles.timeText}>hrs</Text>
                </View>
                <TextInput
                  style={{ ...styles.inputTime, marginLeft: 10 }}
                  placeholder="0"
                  placeholderTextColor="#494949"
                  keyboardType="numeric"
                  maxLength={2}
                  multiline={true}
                  numberOfLines={1}
                  value={prepMin}
                  editable={!publishing}
                  onChangeText={(text) => {
                    setPrepMin(convertNumber(text));
                    if (!changed) setChanged(true);
                  }}
                />
                <View style={{ justifyContent: "center" }}>
                  <Text style={styles.timeText}>min</Text>
                </View>
              </View>
            </View>
            <View style={[styles.section, { width: "50%" }]}>
              <View style={{ marginLeft: "auto" }}>
                <Text style={styles.title}>COOK TIME</Text>
                <View
                  style={{
                    ...styles.section,
                    flexDirection: "row",
                    marginTop: 0,
                  }}
                >
                  <TextInput
                    style={styles.inputTime}
                    placeholder="0"
                    placeholderTextColor="#494949"
                    keyboardType="numeric"
                    maxLength={2}
                    multiline={true}
                    numberOfLines={1}
                    value={cookHrs}
                    editable={!publishing}
                    onChangeText={(text) => {
                      setCookHrs(convertNumber(text));
                      if (!changed) setChanged(true);
                    }}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={styles.timeText}>hrs</Text>
                  </View>
                  <TextInput
                    style={{ ...styles.inputTime, marginLeft: 10 }}
                    placeholder="0"
                    placeholderTextColor="#494949"
                    keyboardType="numeric"
                    maxLength={2}
                    multiline={true}
                    numberOfLines={1}
                    value={cookMin}
                    editable={!publishing}
                    onChangeText={(text) => {
                      setCookMin(convertNumber(text));
                      if (!changed) setChanged(true);
                    }}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={styles.timeText}>min</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>INGREDIENTS</Text>
            <View style={[styles.section, { marginTop: 0, marginBottom: 6 }]}>
              <TextInput
                maxLength={50}
                placeholderTextColor={"#494949"}
                placeholder="Enter ingredient and amount"
                value={ingredients[0].value}
                style={styles.input}
                editable={!publishing}
                onChangeText={(text) => {
                  inputHandler(convertText(text), 0, "ingredients");
                  if (!changed) setChanged(true);
                }}
              />
            </View>
            {ingredients.slice(1).map((input, key) => (
              <View
                style={[styles.section, { marginTop: 0, marginBottom: 6 }]}
                key={key}
              >
                <TextInput
                  maxLength={50}
                  placeholderTextColor={"#494949"}
                  placeholder="Enter ingredient and amount"
                  value={input.value}
                  style={styles.input}
                  editable={!publishing}
                  onChangeText={(text) => {
                    inputHandler(convertText(text), key + 1, "ingredients");
                    if (!changed) setChanged(true);
                  }}
                />
                <TouchableOpacity
                  onPress={() => deleteHandler(key + 1, "ingredients")}
                  style={{ position: "absolute", right: 10, bottom: 10 }}
                >
                  <Icon name="trash-outline" color="#FF4343" size={20} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => addHandler("ingredients")}
              style={[styles.addContainer, { justifyContent: "center" }]}
            >
              <Icon name="add-circle-outline" color="#494949" size={20} />
              <Text style={styles.addText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>INSTRUCTIONS</Text>
            <View style={[styles.section, { marginTop: 0, marginBottom: 6 }]}>
              <TextInput
                maxLength={200}
                placeholderTextColor={"#494949"}
                placeholder="Enter a step"
                style={[styles.input, { paddingLeft: 30 }]}
                value={instructions[0].value}
                editable={!publishing}
                onChangeText={(text) => {
                  inputHandler(convertText(text), 0, "instructions");
                  if (!changed) setChanged(true);
                }}
              />
              <Text
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 10,
                  color: "#494949",
                }}
              >
                1.
              </Text>
            </View>
            {instructions.slice(1).map((input, key) => (
              <View
                maxLength={200}
                key={key}
                style={[styles.section, { marginTop: 0, marginBottom: 6 }]}
              >
                <TextInput
                  placeholderTextColor={"#494949"}
                  placeholder="Enter a step"
                  value={input.value}
                  editable={!publishing}
                  style={[styles.input, { paddingLeft: 30 }]}
                  onChangeText={(text) => {
                    inputHandler(convertText(text), key + 1, "instructions");
                    if (!changed) setChanged(true);
                  }}
                />
                <Text
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 10,
                    color: "#494949",
                  }}
                >
                  {key + 2}.
                </Text>
                <TouchableOpacity
                  onPress={() => deleteHandler(key + 1, "instructions")}
                  style={{ position: "absolute", right: 10, bottom: 10 }}
                >
                  <Icon name="trash-outline" color="#FF4343" size={20} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => addHandler("instructions")}
              style={[styles.addContainer, { justifyContent: "center" }]}
            >
              <Icon name="add-circle-outline" color="#494949" size={20} />
              <Text style={styles.addText}>Add Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backArrow: {
    position: "absolute",
    left: 20,
    bottom: "50%",
    marginBottom: -15,
  },
  button: {
    position: "absolute",
    top: "50%",
    marginTop: 19,
    right: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "NunitoExtraBold",
  },
  photoSelect: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 250,
    width: 250,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "white",
  },
  items: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    color: "#518BFF",
    fontSize: 15,
    marginBottom: 6,
    fontFamily: "NunitoExtraBold",
  },
  input: {
    backgroundColor: "#151515",
    paddingLeft: 10,
    paddingRight: 30,
    height: 40,
    borderRadius: 8,
    color: "white",
  },
  inputTime: {
    textAlignVertical: "top",
    backgroundColor: "#151515",
    paddingHorizontal: 10,
    paddingTop: 11,
    borderRadius: 8,
    height: 40,
    width: 40,
    color: "white",
    textAlign: "center",
    marginRight: 5,
  },
  section: {
    width: "100%",
    marginVertical: 8,
  },
  addContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  addText: {
    fontSize: 16,
    color: "#494949",
    fontFamily: "NunitoBold",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#494949",
    textAlignVertical: "center",
  },
});
