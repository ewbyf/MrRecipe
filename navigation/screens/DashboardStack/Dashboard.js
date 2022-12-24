import { StyleSheet, View, Text, TextInput, Button, Alert, Image, ScrollView, TouchableOpacity, Animated, RefreshControl, ImageBackground, YellowBox, FlatList, Vibration } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import React, { useRef } from 'react';
import { useSafeAreaInsets} from 'react-native-safe-area-context';
import { Rating } from "react-native-ratings";

export default function Dashboard({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [reload, setReload] = useState(true);

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const fetchData = async() => {
    var tempList = [];
    let ref = '';
    
    await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setUserData(snapshot.data());
        ref = snapshot.data();
      }
      else
        Alert.alert("Unknown Error Occured", "Contact support with error.")
    })
    
    await Promise.all(ref.recipes.reverse().map((doc) => {
      return firebase.firestore().collection("recipes").doc(doc).get()
          .then((snap) => {
            if (snap.exists) {
              tempList.push(snap.data());
            }
          })
          .catch((error) => {
            alert(error.message);
          })
    }))
    setDataList(tempList);
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


  return (
    <View style={styles.appcontainer}>

      {/* Header pop up */}
      <View style={styles.animationContainer}>
        <View style={{flex: 1, height: '100%', justifyContent: 'center'}}>
          <Animated.Image 
            source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}}
            style={{
              marginLeft: 'auto',
              borderRadius: 50,
              height: 40,
              width: 40,
              opacity: scrollY.interpolate({
                inputRange: [100, 140],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [100, 140],
                    outputRange: [22, 0],
                    extrapolate: 'clamp'
                })
              }]
          }}/>
        </View>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', marginHorizontal: 10}}>
          <Animated.View
            style={{
              textAlign: 'center',
              opacity: scrollY.interpolate({
                inputRange: [135, 165],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [135, 195],
                    outputRange: [62, 0],
                    extrapolate: 'clamp'
                })
              }]
            }}
          >
            <Text style={[styles.name, {fontSize: 23.5}]}>{userData.name}</Text>
          </Animated.View>
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [165, 185],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [165, 195],
                    outputRange: [32, 0],
                    extrapolate: 'clamp'
                })
              }]
            }}
          >
            <Text style={[styles.username, {fontSize: 13.5}]}>@{userData.username}</Text>
          </Animated.View>
        </View>
        <View style={{flex: 1}}>
          <Icon name='cog-outline' color='white' size={35} style={styles.gear} onPress={() => navigation.navigate('SettingsScreen')}/>
        </View>
      </View>

        
      <View style={styles.topbar}>
        <Animated.View style={{
          opacity: scrollY.interpolate({
            inputRange: [135, 165],
            outputRange: [1, 0],
          }),
          transform: [{
              translateY: scrollY.interpolate({
                inputRange: [135, 175],
                outputRange: [0, 50],
                extrapolate: 'clamp'
            })
          }]}}>
          <Text style={styles.topbarTitle}>Profile</Text>
        </Animated.View>
      </View>

      <View style={styles.dashboard}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          onScroll={Animated.event([{nativeEvent: {contentOffset: { y: scrollY }}}],{ useNativeDriver: true })}
          style={{zIndex: 3}}
          contentContainerStyle={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        >
          <View style={{flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
            <View style={{alignItems: 'center'}}>
              <Animated.Image 
                source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}}
                style={{...styles.profilePicture,
                  transform: [{
                      scale: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0.6],
                        extrapolate: 'clamp',
                      })}, {
                      translateY: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 16],
                        extrapolate: 'clamp'})
                    }],
                }}/>

                <Text style={styles.name}>{userData.name}</Text>
                <Text style={styles.username}>@{userData.username}</Text>
            </View>
          </View>

          <View style={styles.bioContainer}>
            {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
          </View>

          <View style={styles.postTitleContainer}>
            <Text style={styles.postsTitle}>POSTS</Text>
          </View>

          <View style={styles.postsContainer}>
            {(userData && userData.recipes.length == 0) && <Text style={{color: 'lightgrey', fontSize: 16, textAlign: 'center'}}>You have not posted any recipes</Text>}
            {(userData && userData.recipes.length > 0) && 
              <FlashList 
                data={dataList}
                extraData={dataList}
                renderItem={({item}) => (
                  <TouchableOpacity style={{width: '100%'}}>
                    <ImageBackground source={{uri: item.image}} style={styles.list} imageStyle={{borderRadius: 15}}>
                      <Text style={styles.listTitle}>{item.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                        <View style={{flex: 1}}></View>
                        <Rating
                          style={styles.ratingBar}
                          ratingCount={5}
                          imageSize={16}
                          readonly={true}
                          type={'custom'}
                          ratingBackgroundColor={'transparent'}
                          tintColor={'#2E2E2E'}
                          startingValue={item.rating}
                        />
                        <Text style={styles.rating}>{item.rating}</Text>
                      </View>
                      <Text style={styles.listText}>Difficulty: {item.difficulty}</Text>
                      <Text style={styles.listText}>Total time: {(item.cooktime + item.preptime) / 60} hr</Text>
                      
                      <View style={styles.author}>
                        <Text style={styles.listText}>Posted By: {item.user}</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={2}
              />
            }
          </View>
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appcontainer: {
    height: '100%',
    backgroundColor: '#222222',
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
    paddingTop: 30,
    height: 110,
  },
  backArrow: {
      position: 'absolute',
      left: 20,
      bottom: '50%',
      marginBottom: -12,
  },
  topbar: {
    paddingTop: 30,
    height: 110,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518BFF',
  },
  topbarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  gear: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  dashboard: {
    flexDirection: 'column',
    height: '87%',
    maxHeight: '87%',
  },
  profilePicture: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginTop: 20,
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  username: {
    color: '#C9C9C9',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 3,
  },
  bioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: '10%',
  },
  bio: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
  },
  postTitleContainer: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#363636',
    backgroundColor: '#222222',
  },
  postsContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
    marginBottom: 125,
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
    alignItems: 'center',
    padding: 15,
    margin: 3,
    backgroundColor: '#28466E',
    borderRadius: 15,
  },
  listTitle: {
    color: '#FFD9AC',
    fontSize: 22,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    backgroundColor: '#28466E',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  listText: {
    color: '#FFD9AC',
    fontSize: 13,
    paddingHorizontal: 5,
    marginTop: 5,
    textAlign: 'center',
    backgroundColor: '#28466E',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  ratingBar: {
    flex: 1, 
    marginHorizontal: 30,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  rating: {
    color: '#f1c40f',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  author: {
    marginTop: 'auto',
  }
});

