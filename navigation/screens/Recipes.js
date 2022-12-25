import { StyleSheet, View, Text, TextInput, RefreshControl, TouchableOpacity, ImageBackground, Alert, ScrollView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import React from 'react';
import { Rating } from "react-native-ratings";
import { firebase } from '../../config';
import { debug } from "react-native-reanimated";


export default function Recipes({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);


  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const fetchData = async() => {
    var tempList = [];
    const snapshot = await firebase.firestore().collection('recipes').orderBy('rating', 'desc').get()

    await Promise.all(snapshot.docs.map((doc) => {
      tempList.push(doc.data());
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
          <View style={styles.topbar}>
              <Text style={styles.topbarTitle}>Mr. Recipe</Text>
              <TextInput placeholder='Search for Recipe' style={styles.searchbar}></TextInput>
          </View>
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View style={styles.postsContainer}>
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
                      <Text style={styles.listText}>Total time: {((item.cooktime + item.preptime) / 60).toFixed(2)} hr</Text>
                      
                      <View style={styles.author}>
                        <Text style={styles.listText}>Posted By: {item.user}</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={2}
              />
            </View>
          </ScrollView>
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
      height: '20%',
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
  