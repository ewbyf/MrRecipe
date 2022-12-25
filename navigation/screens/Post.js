import { StyleSheet, View, TouchableOpacity, Text, TextInput, FlatList, Alert, Image, Button} from "react-native";
import global from "../../Styles";
import { useState, useEffect } from "react";
import { firebase } from '../../config';
import BackArrow from '../../components/BackArrow';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from "react-native-gesture-handler";
import { SelectList } from "react-native-dropdown-select-list";
import Dialog from 'react-native-dialog';

export default function Post({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [cookHrs, setCookHrs] = useState("0");
  const [cookMin, setCookMin] = useState("0");
  const [prepHrs, setPrepHrs] = useState("0");
  const [prepMin, setPrepMin] = useState("0");
  const [ingredients, setIngredients] = useState([{key: 0, value: ''}]);
  const [instructions, setInstructions] = useState([{key: 0, value: ''}]);

  const [discardVisible, setDiscardVisible] = useState(false);
  const [fieldChanged, setFieldChanged] = useState(false);

  const data = [
    {key: 'Easy', value: 'Easy'},
    {key: 'Medium', value: 'Medium'},
    {key: 'Hard', value: 'Hard'},
  ];

  // Check if users signed in
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing)
      setInitializing(false);
  }

  useEffect(() => {
  const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing)
    return null;

  const takePhoto = async() => {
    if ((await ImagePicker.getCameraPermissionsAsync()).granted == false) {
      await ImagePicker.requestCameraPermissionsAsync();
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled) {
      const source = {uri : result.assets[0].uri};
      setImage(source);
    }
  }

  const choosePhoto = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (!result.canceled) {
      const source = {uri : result.assets[0].uri};
      setImage(source);
    }
  }

  const uploadPhoto = async() => {
    if (image == null)
      return null;

    const response = await fetch(image.uri);
    const blob = await response.blob();
    const filename = image.uri.substring(image.uri.lastIndexOf('/') + 1);
    var ref = firebase.storage().ref().child(filename).put(blob);
    try { 
      await ref;
      const url = await firebase.storage().ref().child(filename).getDownloadURL();
      return url;
    }
    catch(error) {
      alert(error.code);
    }
  }

  const addHandler = (type) => {
    if (type == "ingredients") {
      const _inputs = [...ingredients];
      if (ingredients[_inputs.length-1].value == '') {
        Alert.alert("Blank Ingredient", "Please enter an ingredient and amount for the blank field before creating a new one.");
        return;
      }
      _inputs.push({key: '', value: ''});
      setIngredients(_inputs);
    }
    else {
      const _inputs = [...instructions];
      if (instructions[_inputs.length-1].value == '') {
        Alert.alert("Blank Step", "Please enter a step before creating a new one.");
        return;
      }
      _inputs.push({key: '', value: ''});
      setInstructions(_inputs);
    }
  }
  
  const deleteHandler = (key, type) => {
    if (type == "ingredients") {
      const _inputs = ingredients.filter((ingredients, index) => index != key);
      setIngredients(_inputs);
    }
    else {
      const _inputs = instructions.filter((instructions, index) => index != key);
      setInstructions(_inputs);
    }
  }

  const inputHandler = (text, key, type) => {
    if (type == "ingredients") {
      const _inputs = [...ingredients];
      _inputs[key].value = text;
      _inputs[key].key = key;
      setIngredients(_inputs);
    }
    else {
      const _inputs = [...instructions];
      _inputs[key].value = text;
      _inputs[key].key = key;
      setInstructions(_inputs);
    }
  }

  const convertNumber = (text) => {
    return text.replace(/[^0-9]/g, '');
  }

  const publish = async() => {
    if (!name) {
      Alert.alert("Missing Name", "Please enter a name for your recipe");
    }
    else if (!difficulty) {
      Alert.alert("Missing Difficulty", "Please select a difficulty for your recipe");
    }
    else if (cookHrs == 0 && cookMin == 0) {
      Alert.alert("Invalid Cook Time", "Please enter a valid cook time for your recipe");
    }
    else if (!ingredients[0].value) {
      Alert.alert("Missing Ingredient", "Please enter at least one ingredient for your recipe");
    }
    else if (!instructions[0].value) {
      Alert.alert("Missing Step", "Please enter at least one step for your recipe");
    }
    else {
        const preptime = Number(prepMin) + Number(prepHrs) * 60;
        const cooktime = Number(cookMin) + Number(cookHrs) * 60;
        const ingredientsArray = []
        const instructionsArray = []
        const rated = [];
        const comments = [];

        for (let i = 0; i < ingredients.length; i++){
          if (ingredients[i].value){
            ingredientsArray.push(ingredients[i].value);
          }
        }
        for (let i = 0; i < instructions.length; i++){
          if (instructions[i].value){
            instructionsArray.push(instructions[i].value);
          }
        }

        const ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
        
        let imgUrl = await uploadPhoto();
        
        ref.get()
        .then((snapshot) => {
          if (snapshot.exists) {
            firebase.firestore().collection('recipes').add({
              name, description, rating: 0, numratings: 0, difficulty, cooktime, preptime, ingredients: ingredientsArray, instructions: instructionsArray, image: imgUrl, rated, comments, user: snapshot.data().name, username: snapshot.data().username, userpfp: snapshot.data().pfp, uid: firebase.auth().currentUser.uid
            })
            .then((doc) => {
              const recipes = [...snapshot.data().recipes];
              recipes.push(doc.id);
              ref.update({recipes});
              reset();
              navigation.goBack(null);
            })
            .catch((error) => {
              alert(error.message);
            })
          }
          else
            Alert.alert("Unknown Error Occured", "Contact support with error.")
        })
        .catch((error) => {
          alert(error.message);
        })
    }
  }

  const reset = () => {
    setImage(null);
    setName('');
    setDescription('');
    setCookHrs(0);
    setCookMin(0);
    setPrepHrs(0);
    setPrepMin(0);
    setInstructions([{key: 0, value: ''}]);
    setIngredients([{key: 0, value: ''}]);
  }

  const checkFieldChanged = () => {
    if (image || name || description || cookHrs != 0 || cookMin != 0 || prepHrs != 0 || prepMin != 0 || instructions[0].value || ingredients[0].value || instructions.length > 1 || ingredients.length > 1) {
      return true;
    }
    else {
      return false;
    }
  }

  if (user) {
    return (
      <View style={global.appContainer}>
          {/* Discard changes pop up */} 
          <Dialog.Container visible={discardVisible}>
            <Dialog.Title>Unsaved Changes</Dialog.Title>
            <Dialog.Description>
              Your current changes are unsaved. Would you like to discard or save them? Note: Your saved changes will be lost if you close the app or sign out.
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={() => {setDiscardVisible(false)}}/>
            <Dialog.Button label="Discard" style={{color: 'red'}} onPress={() => {setDiscardVisible(false); reset(); navigation.goBack(null)}}/>
            <Dialog.Button label="Save" style={{color: '#518BFF'}} onPress={() => {setDiscardVisible(false); navigation.goBack(null)}}/>
          </Dialog.Container>

          <View style={global.topbar}>
            <Icon name='arrow-back-outline' size={30} color='white' style={styles.backArrow} onPress={() => {if (checkFieldChanged()) {setDiscardVisible(true)} else {navigation.goBack(null)}}}/>
            <Text style={global.topbarTitle}>Add a Recipe</Text>
          </View>
          <ScrollView>
            <View style={styles.items}>
              {!image && 
              <View style={styles.photoSelect}>
                <Icon name="image" size={75} color={'gray'}/>
                <View style={{alignItems: 'center', marginVertical: 5}}>
                  <TouchableOpacity onPress={choosePhoto}>
                    <Text style = {[styles.addText, {color: '#518BFF'}]}>Choose Photo</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{color: 'gray', fontSize: 15}}>or</Text>
                <View style={{alignItems: 'center', marginTop: 5}}>
                  <TouchableOpacity onPress={takePhoto}>
                    <Text style = {[styles.addText, {color: '#518BFF'}]}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
              }
              {image && 
                <View style={{alignItems: 'center'}}>
                  <Image source={{uri: image.uri}} style={{width: 250, height: 250, marginTop: 20}}/>
                  <TouchableOpacity onPress={() => setImage(null)}>
                    <Text style = {{...styles.addText, marginTop: 5, color: '#518BFF'}}>Remove Photo</Text>
                  </TouchableOpacity>
                </View>
              }

              <View style={styles.section}>
                <Text style={styles.title}>NAME</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Enter the name of your recipe"
                  placeholderTextColor='#494949'
                  maxLength={50}
                  value={name}
                  onChangeText={(title) => setName(title)}
                ></TextInput>
              </View>
              <View style={styles.section}>
                <Text style={styles.title}>DESCRIPTION</Text>
                <TextInput 
                  style={{...styles.input, height: 100, paddingVertical: 8}}
                  placeholder="Enter a description for your recipe"
                  placeholderTextColor='#494949'
                  multiline={true}
                  maxLength={200}
                  blurOnSubmit={true}
                  textAlignVertical='top'
                  value={description}
                  onChangeText={(desc) => setDescription(desc)}
                ></TextInput>
                <Text style={{color: '#494949', position: 'absolute', right: 10, bottom: 5}}>{description.length}/200</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.title}>DIFFICULTY</Text>
                <SelectList
                  data={data}
                  setSelected={(diff) => setDifficulty(diff)}
                  search={false}
                  inputStyles={{color: 'white'}}
                  boxStyles={{
                    borderWidth: 0,
                    backgroundColor: '#151515',
                    paddingHorizontal: 10,
                    borderRadius: 8,
                  }}
                  arrowicon={<View style={{justifyContent: 'center', right: 6}}><Icon name='chevron-down-outline' size={16} style={{color: '#494949'}}/></View>}
                  dropdownStyles={{backgroundColor: '#151515', borderWidth: 0}}
                  dropdownTextStyles={{color: '#adadad'}}
                  dropdownItemStyles={{borderWidth: 0}}
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={[styles.section, {width: '50%'}]}>
                  <Text style={styles.title}>PREP TIME</Text>
                  <View style={{...styles.section, flexDirection: 'row', marginTop: 0}}>
                    <TextInput 
                      style={styles.inputTime}
                      placeholder="0"
                      placeholderTextColor='#494949'
                      keyboardType="numeric"
                      maxLength={2}
                      multiline={true}
                      numberOfLines={1}
                      value={prepHrs}
                      onChangeText={(text) => setPrepHrs(convertNumber(text))}
                    />
                    <Text style={styles.timeText}>hrs</Text>
                    <TextInput 
                      style={{...styles.inputTime, marginLeft: 10}}
                      placeholder="0"
                      placeholderTextColor='#494949'
                      keyboardType="numeric"
                      maxLength={2}
                      multiline={true}
                      numberOfLines={1}
                      value={prepMin}
                      onChangeText={(text) => setPrepMin(convertNumber(text))}
                    />
                    <Text style={styles.timeText}>min</Text>
                  </View>
                </View>
                <View style={[styles.section, {width: '50%'}]}>
                  <View style={{marginLeft: 'auto'}}>
                    <Text style={styles.title}>COOK TIME</Text>
                    <View style={{...styles.section, flexDirection: 'row', marginTop: 0}}>
                      <TextInput 
                        style={styles.inputTime}
                        placeholder="0"
                        placeholderTextColor='#494949'
                        keyboardType="numeric"
                        maxLength={2}
                        multiline={true}
                        numberOfLines={1}
                        value={cookHrs}
                        onChangeText={(text) => setCookHrs(convertNumber(text))}
                      />
                      <Text style={styles.timeText}>hrs</Text>
                      <TextInput 
                        style={{...styles.inputTime, marginLeft: 10}}
                        placeholder="0"
                        placeholderTextColor='#494949'
                        keyboardType="numeric"
                        maxLength={2}
                        multiline={true}
                        numberOfLines={1}
                        value={cookMin}
                        onChangeText={(text) => setCookMin(convertNumber(text))}
                      />
                      <Text style={styles.timeText}>min</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.title}>INGREDIENTS</Text>
                <View style={[styles.section, {marginTop: 0, marginBottom: 6}]}>
                    <TextInput maxLength={50} placeholderTextColor={'#494949'} placeholder="Enter ingredient and amount" value={ingredients[0].value} style={styles.input} onChangeText={(text)=>inputHandler(text, 0, "ingredients")}/>
                </View>
                {ingredients.slice(1).map((input, key) => (
                  <View style={[styles.section, {marginTop: 0, marginBottom: 6}]}>
                    <TextInput maxLength={50} placeholderTextColor={'#494949'} placeholder="Enter ingredient and amount" value={input.value} style={styles.input} onChangeText={(text)=>inputHandler(text, key+1, "ingredients")}/>
                    <TouchableOpacity onPress = {()=> deleteHandler(key+1, "ingredients")} style={{position: 'absolute', right: 10, bottom: 10}}>
                      <Icon name="trash-outline" color='#FF4444' size={20} />
                    </TouchableOpacity> 
                  </View>
                ))}
                <TouchableOpacity onPress={() => addHandler("ingredients")} style={[styles.addContainer, {justifyContent: 'center'}]}>
                  <Icon name='add-circle-outline' color="#494949" size={20}/>
                  <Text style = {styles.addText}>Add Ingredient</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.title}>INSTRUCTIONS</Text>
                <View style={[styles.section, {marginTop: 0, marginBottom: 6}]}>                    
                    <TextInput maxLength={200} placeholderTextColor={'#494949'} placeholder="Enter a step" style={[styles.input, {paddingLeft: 30}]} value={instructions[0].value} onChangeText={(text) => inputHandler(text, 0, "instructions")}/>
                    <Text style={{position: 'absolute', left: 10, bottom: 10, color: '#494949'}}>1.</Text>
                </View>
                {instructions.slice(1).map((input, key) => (
                    <View maxLength={200} style={[styles.section, {marginTop: 0, marginBottom: 6}]}>
                    <TextInput placeholderTextColor={'#494949'} placeholder="Enter a step" value={input.value} style={[styles.input, {paddingLeft: 30}]} onChangeText={(text)=>inputHandler(text, key+1, "instructions")}/>
                    <Text style={{position: 'absolute', left: 10, bottom: 10, color: '#494949'}}>{key+2}.</Text>
                    <TouchableOpacity onPress = {()=> deleteHandler(key+1, "instructions")} style={{position: 'absolute', right: 10, bottom: 10}}>
                      <Icon name="trash-outline" color='#FF4444' size={20} />
                    </TouchableOpacity> 
                  </View>
                ))}
                <TouchableOpacity onPress={() => addHandler("instructions")} style={[styles.addContainer, {justifyContent: 'center'}]}>
                  <Icon name='add-circle-outline' color="#494949" size={20}/>
                  <Text style = {styles.addText}>Add Step</Text>
                </TouchableOpacity>
              </View>
  
            
              <TouchableOpacity onPress={() => publish()} style={styles.button}>
                <Text style={styles.buttonText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </View>
    );
  }

  return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Recipes</Text>
          </View>
          <View style={{height: '74%', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>You are currently logged out.</Text>
            <Text style={{fontSize: 18, marginTop: 15, color: 'white'}}><Text onPress={() => navigation.navigate('Login')} style={{fontSize: 18, color: '#518BFF'}}>Sign in</Text> to post recipes</Text>
          </View>
      </View>
  );
}
  
const styles = StyleSheet.create({
  backArrow: {
    position: 'absolute',
    left: 20,
    bottom: '50%',
    marginBottom: -15,
  },
  photoSelect: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: 250,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#518BFF',
  },
  items: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#518BFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#151515',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 8,
    color: 'white',
  },
  inputTime: {
    backgroundColor: '#151515',
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 40,
    width: 40,
    color: 'white',
    textAlign: 'center',
    marginRight: 5,
  },
  section: {
    width: '100%',
    marginVertical: 8,
  },
  addContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    fontSize: 16,
    color: '#494949',
  },
  button: {
    backgroundColor: '#518BFF',
    width: 175,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#494949',
    textAlignVertical: 'center',
  }
});