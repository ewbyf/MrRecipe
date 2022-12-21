import { StyleSheet, View, Text, TextInput, Button, Alert, Image, ScrollView, TouchableOpacity, Animated, RefreshControl } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import React, { useRef } from 'react';
import { useSafeAreaInsets} from 'react-native-safe-area-context';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function Dashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const[userData, setUserData] = useState('');
  const[loading, setLoading] = useState(false);

  const DATA = [
    {
      name: 'pasta'
    },
    {
      name: 'rice'
    },
    {
      name: 'noodles'
    },
    {
      name: 'cake'
    },
    {
      name: 'chicken'
    },
    {
      name: 'steak'
    },
    {
      name: 'steak'
    },
    {
      name: 'steak'
    },
    {
      name: 'steak'
    }
  ]

  useEffect(() => {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setUserData(snapshot.data());
      }
      else
        Alert.alert("Unknown Error Occured", "Contact support with error.")
    })
    navigation.addListener("focus", () => setLoading(!loading));
  }, [navigation, loading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(800).then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.appcontainer}>

      {/* Profile picture pop up */}
      {/* <Animated.View
        style={{
          zIndex: 2,
          position: 'absolute',
          top: insets.top + 8,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',          
          opacity: scrollY.interpolate({
            inputRange: [145, 165],
            outputRange: [0, 1],
          }),
          transform: [{
              translateY: scrollY.interpolate({
                inputRange: [145, 175],
                outputRange: [40, 0],
                extrapolate: 'clamp'
            })
          }]
        }}
      >
        <Image style={{height: 40, width: 40}} source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}}/>
        <Text style={[styles.text, styles.topbarTitle]}>{userData.name}</Text>
      </Animated.View> */}
      
      {/* <Animated.Image 
        source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}}
        style={{
          borderRadius: 50,
          height: 35,
          width: 35,
          zIndex: 2,
          position: 'absolute',
          top: insets.top + 8,
          left: 0,
          right: 0,
          alignItems: 'center',
          opacity: scrollY.interpolate({
            inputRange: [145, 165],
            outputRange: [0, 1],
          }),
          transform: [{
              translateY: scrollY.interpolate({
                inputRange: [145, 175],
                outputRange: [40, 0],
                extrapolate: 'clamp'
            })
          }]
        }}/> */}

      {/* Header pop up */}
      <View style={{position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', zIndex: 2, paddingTop: 30, height: 110}}>
        <View style={{flex: 1, height: '100%', justifyContent: 'center'}}>
          <Animated.Image 
            source={{uri: userData.pfp ? userData.pfp : 'https://imgur.com/hNwMcZQ.png'}}
            style={{
              marginLeft: 'auto',
              borderRadius: 50,
              height: 35,
              width: 35,
              opacity: scrollY.interpolate({
                inputRange: [30, 100],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [30, 140],
                    outputRange: [60, 0],
                    extrapolate: 'clamp'
                })
              }]
          }}/>
        </View>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <Animated.View
            style={{
              textAlign: 'center',
              marginBottom: 0,
              opacity: scrollY.interpolate({
                inputRange: [135, 165],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [135, 175],
                    outputRange: [50, 0],
                    extrapolate: 'clamp'
                })
              }]
            }}
          >
            <Text style={styles.name}>{userData.name}</Text>
          </Animated.View>
          <Animated.View
            style={{
              textAlign: 'center',
              opacity: scrollY.interpolate({
                inputRange: [135, 165],
                outputRange: [0, 1],
              }),
              transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [135, 175],
                    outputRange: [50, 0],
                    extrapolate: 'clamp'
                })
              }]
            }}
          >
            <Text style={styles.username}>@{userData.username}</Text>
          </Animated.View>
        </View>
        <View style={{flex: 1}}><Text></Text></View>
      </View>

      {/* <Animated.View
        style={{
          zIndex: 2,
          position: 'absolute',
          top: insets.top + 8,
          left: 0,
          right: 0,
          alignItems: 'center',          
          opacity: scrollY.interpolate({
            inputRange: [145, 165],
            outputRange: [0, 1],
          }),
          transform: [{
              translateY: scrollY.interpolate({
                inputRange: [145, 175],
                outputRange: [40, 0],
                extrapolate: 'clamp'
            })
          }]
        }}
      >
        <Text style={[styles.text, styles.topbarTitle]}>{userData.name}</Text>
      </Animated.View> */}
        
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
        <Icon name='cog-outline' color='white' size={35} style={styles.gear} onPress={() => navigation.navigate('SettingsScreen')}/>
      </View>

      <View style={styles.dashboard}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
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

          <View style={styles.postsContainer}>
            <Text style={styles.postsTitle}>POSTS</Text>
            {(userData && userData.recipes.length == 0) && <Text style={{color: 'lightgrey', fontSize: 16, textAlign: 'center'}}>You have not posted any recipes</Text>}
            {(userData && userData.recipes.length > 0) && 
              <FlashList 
                data={DATA}
                renderItem={({item}) => (
                  <TouchableOpacity>
                    <View style={styles.list}>
                      <Text style={styles.listTitle}>{item.name}</Text>
                      <Text>Hidsadasdasas</Text>
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={1}
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
    position: 'absolute',
    right: '5%',
    top: '50%',
    marginTop: 12.5,
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
    marginVertical: 3,
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
  postsContainer: {
    width: '100%',
    height: '100%',
    maxHeight: '57%',
    marginVertical: 20,
    paddingTop: 10,
    paddingHorizontal: 10,
    marginBottom: 125,
    borderTopWidth: 1,
    borderTopColor: '#363636',
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
    padding: 10,
    margin: 5,
    backgroundColor: '#518BFF',
    borderRadius: 30,
  },
  listTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  }
});

