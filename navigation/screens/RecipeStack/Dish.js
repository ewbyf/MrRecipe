import { StyleSheet, View, Text, TextInput } from "react-native";
import global from "../../../Styles";
import BackArrow from '../../../components/BackArrow';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';
import { useRoute } from "@react-navigation/native";


export default function Dish({props, navigation}) {
    const route = useRoute();
    const [recipeData, setRecipeData] = useState('');
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
      firebase.firestore().collection('recipes').doc(route.params.doc).get()
      .then((snapshot) => {
        setRecipeData(snapshot.data());
        setInitializing(false);
      })
      .catch((error) => {
        alert(error.message);
      })
    }, [])

    if (initializing) {
      return null;
    }

    return (
        <View style={global.appContainer}>
            <View style={global.topbar}>
                <BackArrow navigation={navigation}/>
                <Text style={global.topbarTitle}>Recipe</Text>
            </View>
            <View>
              <Text>{recipeData.name}</Text>
              <Text>{recipeData.description}</Text>
              <Text>{recipeData.difficulty}</Text>
              <Text>{recipeData.cooktime}</Text>
              <Text>{recipeData.preptime}</Text>
              <Text>{recipeData.rating}</Text>
              <Text>{recipeData.numratings}</Text>


              {recipeData.ingredients.map((data, key) => (
                <Text>{data}</Text>
              ))}
              {recipeData.instructions.map((data, key) => (
                <Text>{key+1}. {data}</Text>
              ))}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    postsContainer: {
      width: '100%',
      height: '100%',
      paddingHorizontal: 10,
      marginBottom: 150,
      marginTop: 20,
    },
    postsTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
      textAlign: 'center',
    },
    author: {
      marginTop: 'auto',
    }
  });