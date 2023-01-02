import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity } from "react-native";
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
    const [defaultRating, setdefaultRating] = useState(2);
    const [maxRating, setmaxRating] = useState([1,2,3,4,5]);
    const starImgFilled = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_filled.png';
    const starImgCorner = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_corner.png';

    const CustomRatingBar = () => {
      return (
        <View style={styles.ratingBar}>
          {
            maxRating.map((item, key) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={item}
                  onPress={() => setdefaultRating(item)}
                >
                  <Image
                    style={styles.starImg}
                    source={
                      item <= defaultRating
                      ? {uri: starImgFilled}
                      : {uri: starImgCorner}
                    }
                  />
                </TouchableOpacity>
              )
            })
          }
        </View>
      )
    }

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
              <View style={{flexDirection: 'row', marginTop: 'auto'}}>
                <Text style={styles.theStyle}>By:   </Text>
                <Image source={{uri: (recipeData.userpfp)}}style={styles.thePfp}/>
                <Text style={styles.theStyle}>{(recipeData.username)}</Text>
              </View>
              <Text style={styles.fieldText}>Difficulty: {recipeData.difficulty}</Text>
              <View style={{flexDirection: 'row', marginTop: 'auto'}}>
                <View style={{width: '50%'}}>
                  <Text style={styles.fieldText}>Cook Time: {(recipeData.cooktime)/60} hrs {(recipeData.cooktime)%60} min</Text>
                </View>
                <View style={{width: '50%', marginLeft: 'auto'}}>
                  <Text style={styles.fieldText}>Prep Time: {(recipeData.preptime)/60} hrs {(recipeData.preptime)%60} min</Text>
                </View>
              </View>
              <Text style={styles.theStyle}>Description</Text>
              <Text style={styles.theDesc}>{recipeData.description}</Text>
              <Text style={styles.theStyle}>Ingredients</Text>
              {recipeData.ingredients.map((data, key) => (
                <Text style={styles.instructions}>{data}</Text>
              ))}
              <Text style={styles.theStyle}>Instructions</Text>
              {recipeData.instructions.map((data, key) => (
                <Text style={styles.instructions}>{key+1}. {data}</Text>
              ))}
              <View style={{marginTop: 'auto'}}>
                <CustomRatingBar/>
              </View>
              <Text style={styles.theStyle}>Comments</Text>
              <View stlyes={styles.theBy}>
                <TextInput 
                    style={{...styles.input, height: 100, paddingVertical: 8}}
                    placeholder="Add Comment"
                    placeholderTextColor='#494949'
                    multiline={true}
                    maxLength={200}
                    blurOnSubmit={true}
                    textAlignVertical='top'
                  ></TextInput>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Publish</Text>
                  </TouchableOpacity>
              </View>
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
      borderRadius: 20,
      marginVertical: 20,
      marginHorizontal: 15,
    },
    theBush: {
      color: 'white',
      fontSize: 26,
      fontWeight: 'bold',
      paddingLeft: 15,
    },
    theDesc: {
      color: 'gray',
      fontSize: 14,
      marginHorizontal: 15,
      paddingTop: 5,
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
      paddingLeft: 15,
      paddingTop: 5,
    },
    instructions: {
      color: 'grey',
      fontSize: 14,
      paddingLeft: 15,
      paddingTop: 5
    },
    ratingBar: {
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 10,
      marginTop: 10,
      marginLeft: 20
    },
    fieldText: {
      color: 'white',
      fontSize: 16,
      fontWeigfht: 'bold',
      paddingTop: 5,
      paddingLeft: 15
    },
    input: {
      backgroundColor: '#151515',
      paddingHorizontal: 15,
      height: 40,
      borderRadius: 8,
      color: 'white',
    },
    theBy: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
      paddingLeft: 15,
      paddingTop: 5,
      flexDirection: 'row',
    },
    thePfp: {
      paddingLeft: 50,
      paddingTop: 50,
      borderRadius: 50,
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
    ratingBar: {
      justifyContent: 'center',
      flexDirection: 'row',
    },
    starImg: {
      width: 40,
      height: 40,
      resizeMode: 'cover',
    }
  });