import { StyleSheet, View, TouchableOpacity, Text, TextInput, FlatList, Alert, Image, Button} from "react-native";
import { useState, useEffect } from "react";
import { firebase } from '../../config';
import BackArrow from '../../components/BackArrow';
import { SelectList } from 'react-native-dropdown-select-list'
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-picker";

export default function Post({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [selected, setSelected] = useState("");

  const data = [
    {key: '1', value: 'Easy'},
    {key: '2', value: 'Medium'},
    {key: '3', value: 'Hard'},
  ];

  const [textInput, setTextInput] = useState('');
  const[todos, setTodos] = useState([
    {id: 1, task: 'First ingredient'},
    {id: 2, task: 'Second ingredient'},
  ]);

  const ListItem = ({todo})=> {
    return <View style={styles.listItem}>
      <View style={{flex: 1}}>
        <Text 
          style={{fontWeight: 'bold', fontSize: 15, color: 'black'}}>
          {todo?.task}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.actionIcon]} 
        onPress={()=>deleteTodo(todo?.id)}>
        <Icon name="delete" size={20} color='#fff' />
      </TouchableOpacity>
    </View>;
  };

  const addTodo = ()=> {
    if(textInput == ""){
      Alert.alert('No way', 'You are a clown. twitter.com/Dreamybullxxx');
    }
    else{
      const newTodo ={
        id: Math.random(),
        task: textInput,
      };
      setTodos([...todos,newTodo]);
      setTextInput('');
    }
  };

  const deleteTodo = (todoId) => {
    const newTodos = todos.filter(item => item.id != todoId);
    setTodos(newTodos);
  };

  const state = {
    photo: null,
  };

  const handleChoosePhoto = () => {
    const options = {
      noData: true
    };
    ImagePicker.launchImageLibrary(options, response =>{
      console.log("response", response);
      if (response.uri) {
        setState({ photo: response });
      }
    });
  };

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

  if (user) {
    const {photo} = state; 
    return (
      <View style={styles.appcontainer}>
          <View style={styles.topbar}>
            <BackArrow navigation={navigation}/>
            <Text style={styles.topbarTitle}>Add a Recipe</Text>
          </View>
          <View styles={styles.items}>
              {photo && (
                <Image
                  source={{uri: photo.uri}}
                  style={{width: 300, height: 300}}
                />
              )}
              <Button
                title="Choose Photo"
                onPress={handleChoosePhoto}
              />
              <TextInput
                placeholder="Recipe Name"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Description"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Preparation Time (minutes)"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Cooking Time (minutes)"
                style={styles.input_container}
              ></TextInput>
              <TextInput
                placeholder="Procedure"
                style={styles.input_container}
              ></TextInput>

             <View styles={styles.ingredients}>
             <TextInput
                  placeholder="Add Ingredient" 
                  value={textInput}
                  onChangeText={(text)=>setTextInput(text)}
                  style={styles.input_container}
              ></TextInput>
            
              <TouchableOpacity onPress={addTodo}>
                  <View style={styles.iconContainer}>
                    <Icon name="add" color='white' size={30} />
                  </View>
              </TouchableOpacity>
             </View>

              <FlatList 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{padding:20, paddingBottom: 100}}
                data={todos} 
                renderItem={({item}) => <ListItem todo={item}/>}
              />

              <SelectList data={data} setSelected={setSelected} dropdownStyles={{backgroundColor: 'white'}}
                  boxStyles={{
                    backgroundColor: 'white',
                    marginHorizontal: 12.5,
                    borderRadius: 50,
                  }}
              />


              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Publish</Text>
              </TouchableOpacity>
          </View>
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
      height: '13%',
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
    searchbar: {
      width: 300,
      borderWidth: 5,
      marginTop: 15,
      borderColor: 'white',
      borderRadius: 20,
      padding: 7,
      backgroundColor: 'white',
      color: 'black',
    },
    signinText: {
      width: 300,
      borderWidth: 5,
      marginTop: 15,
      borderColor: 'white',
      borderRadius: 20,
      padding: 7,
      backgroundColor: '#518BFF',
      color: 'black',
      flexDirection: 'row',
      marginTop: 20
    },
    button: {
      backgroundColor: '#518BFF',
      width: 175,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginHorizontal: 102.5,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    items: {
      height: '87%',
      alignItems: 'center',
      justifyContent: 'center',
    },  
    input_container: {
      borderWidth: 0.5,
      padding: 12.5,
      marginHorizontal: 15, 
      fontSize: 16,
      marginTop: 20,
      borderRadius: 50,
      backgroundColor: 'white'
    },
    ingredients: {
      flexDirection: 'row',
    },
    iconContainer: {
      height: 50,
      width: 50,
      backgroundColor: '#518BFF',
      borderRadius: 25,
      elevation: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listItem: {
      padding: 20,
      backgroundColor: '#fff',
      flexDirection: 'row',
      elevation: 12,
      borderRadius: 7,
      marginVertical: 10,
    },
    actionIcon: {
      height: 25,
      width: 25,
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 5,
      borderRadius: 3,
    }
  });
  