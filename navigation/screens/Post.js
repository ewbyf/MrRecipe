import { StyleSheet, View, TouchableOpacity, Text, TextInput, FlatList, Alert, Image, Button} from "react-native";
import { useState, useEffect } from "react";
import { firebase } from '../../config';
import BackArrow from '../../components/BackArrow';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from "react-native-gesture-handler";
import { SelectList } from "react-native-dropdown-select-list";

export default function Post({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [selected, setSelected] = useState("");

  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  const [ingredients, setIngredients] = useState([{key: 0, value: ''}]);
  const [instructions, setInstructions] = useState([{key: 0, value: ''}]);

  const data = [
    {key: 'a', value: 'Easy'},
    {key: 'b', value: 'Medium'},
    {key: 'c', value: 'Hard'},
    {key: 'd', value: 'Mr Recipe'},
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
      _inputs.push({key: '', value: ''});
      setIngredients(_inputs);
    }
    else {
      const _inputs = [...instructions];
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

  if (user) {
    return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Add a Recipe</Text>
          </View>
          <ScrollView>
            <View style={styles.items}>
              {!image && 
              <View style={styles.photoSelect}>
                <Icon name="image" size={75} color={'gray'}/>
                <View style={{alignItems: 'center', marginVertical: 5}}>
                  <TouchableOpacity onPress={choosePhoto}>
                    <Text style = {styles.addText}>Choose Photo</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{color: 'gray', fontSize: 15}}>or</Text>
                <View style={{alignItems: 'center', marginTop: 5}}>
                  <TouchableOpacity onPress={takePhoto}>
                    <Text style = {styles.addText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
              }
              {image && 
                <View style={{alignItems: 'center'}}>
                  <Image source={{uri: image.uri}} style={{width: 250, height: 250, marginTop: 20}}/>
                  <TouchableOpacity onPress={() => setImage(null)}>
                    <Text style = {{...styles.addText, marginTop: 5}}>Remove Photo</Text>
                  </TouchableOpacity>
                </View>
              }

              <View style={styles.section}>
                <Text style={styles.title}>TITLE</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Enter a title"
                  placeholderTextColor='#494949'
                ></TextInput>
              </View>
              <View style={styles.section}>
                <Text style={styles.title}>DESCRIPTION</Text>
                <TextInput 
                  style={{...styles.input, height: 100, paddingVertical: 8}}
                  placeholder="Enter a description"
                  placeholderTextColor='#494949'
                  multiline={true}
                  maxLength={200}
                  blurOnSubmit={true}
                  textAlignVertical='top'
                  onChangeText={(desc) => setDescription(desc)}
                ></TextInput>
                <Text style={{color: '#494949', position: 'absolute', right: 10, bottom: 5}}>{description.length}/200</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.title}>DIFFICULTY</Text>
                <SelectList
                  data={data}
                  setSelected={setSelected}
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

              <View style={styles.section}>
                <View style={styles.addContainer}>
                  <Text style={styles.title}>INGREDIENTS</Text>
                  <TouchableOpacity onPress = {()=> addHandler("ingredients")} style={{position: 'absolute', right: 10, top: '50%', marginTop: -12.5}}>
                  <Icon name='add-outline' color="#494949" size={25}/>
                    </TouchableOpacity> 
                </View>
                {ingredients.map((input, key) => (
                  <View style={[styles.section, {marginTop: 0, marginBottom: 6}]}>
                    <TextInput placeholderTextColor={'#494949'} placeholder="Enter ingredient and amount" value={input.value} style={styles.input} onChangeText={(text)=>inputHandler(text, key, "ingredients")}></TextInput>
                    <TouchableOpacity onPress = {()=> deleteHandler(key, "ingredients")} style={{position: 'absolute', right: 10, bottom: 10}}>
                      <Icon name="trash-outline" color='#FF4444' size={20} />
                    </TouchableOpacity> 
                  </View>
                ))}
                <TouchableOpacity onPress={() => addHandler("ingredients")} style={styles.addContainer}>
                  <Icon name='add-outline' color="#518BFF" size={30}/>

                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.title}>INSTRUCTIONS</Text>
                {instructions.map((input, key) => (
                    <View style={[styles.section, {marginTop: 0, marginBottom: 6}]}>
                    <TextInput placeholderTextColor={'#494949'} placeholder="Enter a step" value={input.value} style={styles.input} onChangeText={(text)=>inputHandler(text, key, "instructions")}/>
                    <TouchableOpacity onPress = {()=> deleteHandler(key, "instructions")} style={{position: 'absolute', right: 10, bottom: 10}}>
                      <Icon name="trash-outline" color='#FF4444' size={20} />
                    </TouchableOpacity> 
                  </View>
                ))}
                <TouchableOpacity onPress={() => addHandler("instructions")} style={styles.addContainer}>
                  <Icon name='add-circle-outline' color="#518BFF" size={20}/>
                  <Text style = {styles.addText}>Add Step</Text>
                </TouchableOpacity>
              </View>
  
            
              <TouchableOpacity style={styles.button}>
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
  appcontainer: {
    height: '100%',
    backgroundColor: '#222222',
  },
  topbar: {
    paddingTop: 30,
    height: 110,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518BFF',
  },
  topbarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
    color: '#518BFF',
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
});