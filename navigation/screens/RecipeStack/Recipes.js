import { StyleSheet, View, Text, TextInput, RefreshControl, TouchableOpacity, ImageBackground, Alert, ScrollView, Dimensions, Image } from "react-native";
import global from "../../../Styles";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import React from 'react';
import { Rating } from "react-native-ratings";
import { firebase } from '../../../config';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Recipes({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [dataList, setDataList] = useState([{key: '1', value: {name: 'a', rating: 'a'}}]);
  const [featuredList, setFeaturedList] = useState([]);

  const data = [{key: '1', value: {name: 'a', rating: 'a'}}];

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const fetchData = async() => {
    var tempList = [];
    var tempList2 = [];
    const snapshot = await firebase.firestore().collection('recipes').orderBy('rating', 'desc').get()

    await Promise.all(snapshot.docs.map((doc) => {
      tempList.push({key: doc.id, value: doc.data()});
    }))
    
    await firebase.firestore().collection('recipes').orderBy('rating', 'desc').limit(1).get()
    .then((snap) => {
      tempList2.push({key: snap.docs[0].id, value: snap.docs[0].data()});
    })
    .catch((error) => {
      alert(error.message);
    })

    setDataList(tempList);
    setFeaturedList(tempList2);
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
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Mr. Recipe</Text>
              <TextInput placeholder='Search for Recipe' style={global.searchbar}></TextInput>
          </View>
          <ScrollView style={{height: windowHeight, width: windowWidth}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View style={{marginBottom: 300, width: windowWidth, height: windowHeight}}>
              <Text style={styles.titleText}>Featured Recipe</Text>
              <View style={styles.featuredContainer}>
                <FlashList
                  data={featuredList}
                  renderItem={({item}) => (
                    <TouchableOpacity style={{width: windowWidth-40, height: 300, borderRadius: 10}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                      <View style={styles.list}>
                        <Image source={{uri: (item.value.image)}} style={styles.featuredImage}/>
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <View style={{flex: 1}}>
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.value.name}</Text>
                            <Text style={{color: 'gray'}}>{item.value.difficulty}</Text>
                            <Text style={{color: 'gray'}}>{((item.value.cooktime + item.value.preptime) / 60).toFixed(1)}+ hrs</Text>
                          </View>
                          <View style={styles.ratingContainer}>
                            <Rating
                              style={styles.ratingBar}
                              ratingCount={5}
                              imageSize={16}
                              readonly={true}
                              type={'custom'}
                              ratingBackgroundColor={'gray'}
                              tintColor={'#282828'}
                              startingValue={item.value.rating}
                            />
                            <Text style={styles.rating}>{item.value.rating} of 5</Text>
                            <Icon name='heart' color={'gray'} size={20} />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  estimatedItemSize={1}
                />
              </View>
              <Text style={styles.titleText}>Trending</Text>
              <View style={styles.trendingContainer}>
                <FlashList
                  data={dataList}
                  extraData={dataList}
                  renderItem={({item}) => (
                    <TouchableOpacity style={{width: windowWidth/1.5 - 20, height: 250, borderRadius: 10}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                      <View style={[styles.list, {marginHorizontal: 10, height: 250}]}>
                        <Image source={{uri: (item.value.image)}} style={styles.smallImage}/>
                        <View style={{width: '100%', height: 85}}>
                          <View style={{}}>
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
                        <Icon name='heart' color={'gray'} size={20} style={{position: 'absolute', bottom: 6, right: 20}}/>
                      </View>
                    </TouchableOpacity>
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
                  data={dataList}
                  extraData={dataList}
                  renderItem={({item}) => (
                    <TouchableOpacity style={{width: windowWidth/1.5 - 20, height: 250, borderRadius: 10}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                      <View style={[styles.list, {marginHorizontal: 10, height: 250}]}>
                        <Image source={{uri: (item.value.image)}} style={styles.smallImage}/>
                        <View style={{width: '100%', height: 85}}>
                          <View style={{}}>
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
                        <Icon name='heart' color={'gray'} size={20} style={{position: 'absolute', bottom: 6, right: 20}}/>
                      </View>
                    </TouchableOpacity>
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
      </View>
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
  