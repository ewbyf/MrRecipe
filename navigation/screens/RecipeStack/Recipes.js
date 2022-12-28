import { StyleSheet, View, Text, TextInput, RefreshControl, TouchableOpacity, ImageBackground, Alert, ScrollView, Dimensions, Image } from "react-native";
import global from "../../../Styles";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect, useRef, useCallback } from "react";
import React from 'react';
import { Rating } from "react-native-ratings";
import { firebase } from '../../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import { TapGestureHandler, GestureHandlerRootView, Gesture } from "react-native-gesture-handler";
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Recipes({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const [dataList, setDataList] = useState([{key: '1', value: {name: 'a', rating: 'a'}}, {key: '1', value: {name: 'a', rating: 'a'}}]);
  const [recentList, setRecentList] = useState([{key: '1', value: {name: 'a', rating: 'a'}}]);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing)
      setInitializing(false);
  }

  useEffect(() => {
  const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const fetchData = async() => {
    let tempList = [];
    let tempList2 = [];

    let fav = [];

    const snapshot = await firebase.firestore().collection('recipes').orderBy('rating', 'desc').get()
    const snapshot2 = await firebase.firestore().collection('recipes').orderBy('timestamp', 'desc').get()
    if (user) {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
      .then((snap) => {
        fav = snap.data().favorites;
      })
      .catch((error) => {
        alert(error.message);
      })
    }

    await Promise.all(snapshot.docs.map((doc) => {
      if (user && fav.indexOf(doc.id) >= 0) {
        tempList.push({key: doc.id, value: doc.data(), favorite: 'red'});
      }
      else {
        tempList.push({key: doc.id, value: doc.data(), favorite: 'gray'});
      }
    }))

    await Promise.all(snapshot2.docs.map((doc) => {
      if (user && fav.indexOf(doc.id) >= 0) {
        tempList2.push({key: doc.id, value: doc.data(), favorite: 'red'});
      }
      else {
        tempList2.push({key: doc.id, value: doc.data(), favorite: 'gray'});
      }
    }))

    setDataList(tempList);
    setRecentList(tempList2);
  }

  useEffect(() => {
    fetchData();
    navigation.addListener("focus", () => {setLoading(!loading)});
  }, [navigation, loading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
    wait(800).then(() => setRefreshing(false));
  }, []);

  const Featured = ({ item }) => {
    const favorite = async(doc) => {
      if (user) {
        let fav = [];
        let temp = [];
        let color = 'gray';
        let index = -1;

        temp = dataList;
        index = dataList.findIndex(item => item.key == doc);
  
        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then((snap) => {
          fav = snap.data().favorites;
          if (fav.indexOf(doc) != -1) {
            fav.splice(snap.data().favorites.indexOf(doc), 1);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
            temp[index].favorite = 'gray';
          }
          else {
            fav.push(doc);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
            temp[index].favorite = 'red';
            color = 'red';
          }
        })
        .catch((error) => {
          alert(error.message);
        })
  
        setDataList(temp);
        setLiked(color);
      }
      else {
        Alert.alert("Not Signed In", "You msut be signed in to favorite a recipe.");
      }
    }
    const scale = useSharedValue(0);

    const onDoubleTap = useCallback(async() => {
      if (user) {
        setLiked('red');
        scale.value = withSpring(1, undefined, (isFinished) => {
          if (isFinished) {
            scale.value = withDelay(500, withSpring(0));
          }
        });
        let fav = [];
        let temp = [];
        let index = -1;
        let doc = item.key;
        temp = dataList;
        index = dataList.findIndex(item => item.key == doc);
        temp[index].favorite = 'red';
  
        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then((snap) => {
          fav = snap.data().favorites;
          if (fav.indexOf(doc) == -1) {
            fav.push(doc);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
          }
          else {
            return;
          }
        })
        .catch((error) => {
          alert(error.message);
        })

        setDataList(temp);
      }
      else {
        Alert.alert("Not Signed In", "You msut be signed in to favorite a recipe.");
      }
    }, []);

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ scale: Math.max(scale.value, 0) }],
    }));
    

    const doubleTapRef = useRef();
    const lastItemId = useRef(item.key);
    const [liked, setLiked] = useState(item.favorite);
    if (item.key !== lastItemId.current) {
      lastItemId.current = item.key;
      setLiked(item.favorite);
    }

    return (
      <View style={{width: windowWidth-40, height: 300, borderRadius: 10}} >
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() => navigation.navigate("DishScreen", {doc: item.key})}
        >
          <TapGestureHandler
            maxDelayMs={200}
            ref={doubleTapRef}
            numberOfTaps={2}
            // onActivated={() => favorite(item.key)}
            onActivated={() => onDoubleTap()}
          >
            <View style={styles.list}>
              <AnimatedImage
                source={require('../../../assets/heart.png')}
                style={[
                  styles.heart,
                  rStyle,
                ]}
                resizeMode={'center'}
              />
              <Image source={{uri: (item.value.image ? item.value.image : 'https://imgur.com/hNwMcZQ.png')}} style={styles.featuredImage}/>
              <View style={{flexDirection: 'row', width: '100%'}}>
                <View style={{flex: 1}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.value.name}</Text>
                  <Text style={{color: 'gray'}}>{item.value.difficulty}</Text>
                  <Text style={{color: 'gray'}}>{((item.value.cooktime + item.value.preptime) / 60).toFixed(1)}+ hrs</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Rating
                    ratingCount={5}
                    imageSize={16}
                    readonly={true}
                    type={'custom'}
                    ratingBackgroundColor={'gray'}
                    tintColor={'#282828'}
                    startingValue={item.value.rating}
                  />
                  <Text style={styles.rating}>{item.value.rating} of 5</Text>
                  <TouchableOpacity onPress={() => favorite(item.key)}>
                    <Icon name='heart' color={liked} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      </View>
    )
  }

  const RecipeList = ({ item, list}) => {
    const favorite = async(doc, list) => {
      if (user) {
        let fav = [];
        let temp = [];
        let color = 'gray';
        let index = -1;
        if (list == "trending") {
          temp = dataList;
          index = dataList.findIndex(item => item.key == doc);
        }
        else {
          temp = recentList;
          index = recentList.findIndex(item => item.key == doc);
        }
  
        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then((snap) => {
          fav = snap.data().favorites;
          if (fav.indexOf(doc) != -1) {
            fav.splice(snap.data().favorites.indexOf(doc), 1);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
            temp[index].favorite = 'gray';
          }
          else {
            fav.push(doc);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
            temp[index].favorite = 'red';
            color = 'red';
          }
        })
        .catch((error) => {
          alert(error.message);
        })
  
        if (list == "trending") {
          setDataList(temp);
        }
        else {
          setRecentList(temp);
        }
        setLiked(color);
      }
      else {
        Alert.alert("Not Signed In", "You msut be signed in to favorite a recipe.");
      }
    }
    const scale = useSharedValue(0);

    const onDoubleTap = useCallback(async() => {
      if (user) {
        setLiked('red');
        scale.value = withSpring(1, undefined, (isFinished) => {
          if (isFinished) {
            scale.value = withDelay(500, withSpring(0));
          }
        });
        let fav = [];
        let temp = [];
        let index = -1;
        let doc = item.key;
        if (list == "trending") {
          temp = dataList;
          index = dataList.findIndex(item => item.key == doc);
        }
        else {
          temp = recentList;
          index = recentList.findIndex(item => item.key == doc);
        }
        temp[index].favorite = 'red';
  
        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then((snap) => {
          fav = snap.data().favorites;
          if (fav.indexOf(doc) == -1) {
            fav.push(doc);
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
          }
          else {
            return;
          }
        })
        .catch((error) => {
          alert(error.message);
        })
  
        if (list == "trending") {
          setDataList(temp);
        }
        else {
          setRecentList(temp);
        }
      }
      else {
        Alert.alert("Not Signed In", "You msut be signed in to favorite a recipe.");
      }
    }, []);

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ scale: Math.max(scale.value, 0) }],
    }));

    const doubleTapRef = useRef();
    const lastItemId = useRef(item.key);
    const [liked, setLiked] = useState(item.favorite);
    if (item.key !== lastItemId.current) {
      lastItemId.current = item.key;
      setLiked(item.favorite);
    }

    return (
      <View style={{width: windowWidth/1.5 - 20, height: 250, borderRadius: 10}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={() => navigation.navigate("DishScreen", {doc: item.key})}
        >
          <TapGestureHandler
            maxDelayMs={200}
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={() => onDoubleTap()}
          >
            <View style={[styles.list, {marginHorizontal: 10, height: 250}]}>
              <AnimatedImage
                source={require('../../../assets/heart.png')}
                style={[
                  styles.heart,
                  rStyle,
                ]}
                resizeMode={'center'}
              />
              <Image source={{uri: (item.value.image ? item.value.image : 'https://imgur.com/hNwMcZQ.png')}} style={styles.smallImage}/>
              <View style={{width: '100%', height: 85}}>
                <View>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.value.name}</Text>
                  <Text style={{color: 'gray'}}>{item.value.difficulty}</Text>
                  <Text style={{color: 'gray'}}>{((item.value.cooktime + item.value.preptime) / 60).toFixed(1)}+ hrs</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 'auto', alignItems: 'center'}}>
                  <Rating
                    ratingCount={5}
                    imageSize={16}
                    readonly={true}
                    type={'custom'}
                    ratingBackgroundColor={'gray'}
                    tintColor={'#282828'}
                    startingValue={item.value.rating}
                  />
                  <Text style={styles.rating}>{item.value.rating} of 5</Text>   
                </View>
              </View>
              <TouchableOpacity style={{position: 'absolute', bottom: 6, right: 20}} onPress={() => favorite(item.key, list)}>
                <Icon name='heart' color={liked} size={20} />
              </TouchableOpacity>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      </View>
    )
  }

  if (initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={global.appContainer}>
      <View style={global.searchTopbar}>
          <Text style={global.topbarTitle}>Mr. Recipe</Text>
          <TextInput placeholder='Search for Recipe' style={global.searchbar}></TextInput>
      </View>
      <ScrollView style={{height: windowHeight, width: windowWidth}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
        <View style={{marginBottom: 300, width: windowWidth, height: windowHeight}}>
          <Text style={styles.titleText}>Featured Recipe</Text>
          <View style={styles.featuredContainer}>
            <FlashList
              data={dataList.slice(0, 1)}
              renderItem={({item}) => (
                <Featured item={item} />
              )}
              estimatedItemSize={1}
            />
          </View>
          <Text style={styles.titleText}>Trending</Text>
          <View style={styles.trendingContainer}>
            <FlashList
              data={dataList.slice(1)}
              extraData={dataList}
              renderItem={({item}) => (
                <RecipeList item={item} list={"trending"} />
                
              )}
              estimatedItemSize={10}
              numColumns={1}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
          <Text style={styles.titleText}>Recent</Text>
          <View style={styles.trendingContainer}>
            <FlashList
              data={recentList}
              renderItem={({item}) => (
                <RecipeList item={item} list={"recent"} />
              )}
              estimatedItemSize={10}
              numColumns={1}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
          <View>
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingTop: 20,
  },
  featuredContainer: {
    width: Dimensions.get("window").width,
    height: 300,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  trendingContainer: {
    width: '100%',
    height: 250,
    marginTop: 10,
    paddingLeft: 10,
  },
  postsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  list: {
    height: 300,
    backgroundColor: "#282828",
    alignItems: 'center',
    padding: 20,
    borderRadius: 30,
  },
  featuredImage: {
    height: 200,
    width: Dimensions.get("window").width-80,
    borderRadius: 20,
    marginBottom: 10
  },
  heart: {
    height: 100,
    width: 100,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -30,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 10,
    zIndex: 10,
  },
  smallImage: {
    height: 125,
    width: '100%',
    borderRadius: 20,
    marginBottom: 10
  },
  ratingContainer: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  rating: {
      color: 'gray',
      fontSize: 12,
      marginHorizontal: 10,
      fontWeight: 'bold',
  },
});
  