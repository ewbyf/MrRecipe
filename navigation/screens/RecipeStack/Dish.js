import { StyleSheet, View, Text, TextInput, Image } from "react-native";
import global from "../../../Styles";
import { Rating } from "react-native-ratings";
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
              <Image source={{uri: (recipeData.image)}} style={styles.featuredImage}/>
              <View style={{flexDirection: 'row', marginTop: 'auto'}}>
                <Text style={styles.theBush}>{recipeData.name}</Text>
                <Rating
                  style={styles.ratingBar}
                  ratingCount={5}
                  imageSize={16}
                  readonly={true}
                  type={'custom'}
                  ratingBackgroundColor={'gray'}
                  tintColor={'#282828'}
                  startingValue={recipeData.rating}
                />          
              </View>
              <Text style={styles.theDesc}>{recipeData.description}</Text>
              <Text>{recipeData.difficulty}</Text>
              <Text>{recipeData.cooktime}</Text>
              <Text>{recipeData.preptime}</Text>
              <Text>{recipeData.rating}</Text>
              <Text>{recipeData.numratings}</Text>

              <Text style={styles.theStyle}>Ingredients</Text>
              {recipeData.ingredients.map((data, key) => (
                <Text>{data}</Text>
              ))}
              <Text style={styles.theStyle}>Instructions</Text>
              {recipeData.instructions.map((data, key) => (
                <Text style={styles.instructions}>{key+1}. {data}</Text>
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
    },
    featuredImage: {
      height: 200,
      width: 390,
      borderRadius: 20,
      marginBottom: 10
    },
    theBush: {
      color: 'white',
      fontSize: 26,
      fontWeight: 'bold',
      paddingLeft: 10,
      paddingTop: 5,
    },
    theDesc: {
      color: 'gray',
      fontSize: 12,
      marginHorizontal: 10,
      fontWeight: 'bold',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 10,
    },
    theStyle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      paddingLeft: 10,
      paddingTop: 5,
    },
    instructions: {
      color: 'grey',
      fontSize: 14,
      paddingLeft: 5,
      paddingTop: 5
    },
    ratingBar: {
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 10,
      marginTop: 15,
      marginLeft: 20
    },
  });