import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import global from "../../../Styles";
import { AirbnbRating, Rating } from "react-native-ratings";
import BackArrow from '../../../components/BackArrow';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';
import { useRoute } from "@react-navigation/native";


export default function Dish({props, navigation}) {
    const route = useRoute();
    const [recipeData, setRecipeData] = useState('');
    const [initializing, setInitializing] = useState(true);
    const [oldRating, setOldRating] = useState(0);
    const [newRating, setNewRating] = useState(0);
    const [userData, setUserData] = useState();

    useEffect(() => {
      firebase.firestore().collection('recipes').doc(route.params.doc).get()
      .then((snapshot) => {
        setRecipeData(snapshot.data());
        firebase.firestore().collection('users').doc(snapshot.data().uid).get()
        .then((snap) => {
          setUserData(snap.data());
          setInitializing(false);
        })
      })
    }, [])
    
    if (initializing) {
      return null;
    }

    return (
        <View style={global.appContainer}>
          <View style={global.topbar}>
              <BackArrow navigation={navigation}/>
              <Text style={global.topbarTitle}>{recipeData.name}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{padding: 15}}>
            <Image source={{uri: (recipeData.image ? recipeData.image : 'https://imgur.com/hNwMcZQ.png')}} style={styles.featuredImage}/>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => navigation.navigate('ProfileScreen')}>
                  <Image source={{uri: (recipeData.userpfp)}}style={styles.authorPfp}/>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.username}>{(recipeData.username)}</Text>
                    <Text style={{color: 'gray'}}>{userData.recipes.length} Posts</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Rating
                  ratingCount={5}
                  imageSize={20}
                  readonly={true}
                  type={'custom'}
                  ratingBackgroundColor={'gray'}
                  tintColor={'#222222'}
                  startingValue={recipeData.rating}
                />
                <Text style={global.rating}>{recipeData.rating} ({recipeData.numratings})</Text>
              </View>       
            </View>

            <Text style={styles.fieldText}>Difficulty: {recipeData.difficulty}</Text>
            <View style={{flexDirection: 'row', marginTop: 'auto'}}>
              <View style={{width: '50%'}}>
                <Text style={styles.fieldText}>Cook: {Math.floor((recipeData.cooktime)/60)} hrs {(recipeData.cooktime)%60} min</Text>
              </View>
              <View style={{width: '50%', marginLeft: 'auto'}}>
                <Text style={styles.fieldText}>Prep: {Math.floor((recipeData.preptime)/60)} hrs {(recipeData.preptime)%60} min</Text>
              </View>
            </View>
            <Text style={styles.theStyle}>Description</Text>
            <Text style={styles.theDesc}>{recipeData.description}</Text>
            <Text style={styles.theStyle}>Ingredients</Text>
            {recipeData.ingredients.map((data, key) => (
              <Text key={key} style={styles.instructions}>{data}</Text>
            ))}
            <Text style={styles.theStyle}>Instructions</Text>
            {recipeData.instructions.map((data, key) => (
              <Text key={key} style={styles.instructions}>{key+1}. {data}</Text>
            ))}
            <View style={{marginTop: 'auto'}}>
              <AirbnbRating
                showRating={false}
                size={25}
                unSelectedColor={'gray'} 
                defaultRating={0}
                onFinishRating={(val) => setNewRating(val)}
              />
            </View>
            <Text style={styles.theStyle}>{recipeData.comments.length} Comments</Text>
            <View style={styles.theBy}>
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
          </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    featuredImage: {
      height: 200,
      borderRadius: 20,
    },
    username: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    theDesc: {
      color: 'gray',
      fontSize: 14,
      marginHorizontal: 15,
      paddingTop: 5,
      fontWeight: 'bold',
    },
    theStyle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      paddingTop: 5,
    },
    instructions: {
      color: 'grey',
      fontSize: 14,
      paddingTop: 5
    },
    fieldText: {
      color: 'white',
      fontSize: 16,
      fontWeigfht: 'bold',
      paddingTop: 5,
    },
    input: {
      backgroundColor: '#151515',
      height: 40,
      width: '100%',
      borderRadius: 8,
      color: 'white',
    },
    theBy: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
      paddingTop: 5,
    },
    authorPfp: {
      height: 50,
      width: 50,
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
      width: 30,
      height: 30,
      resizeMode: 'cover',
    }
  });