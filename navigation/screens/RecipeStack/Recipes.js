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

  const [dataList, setDataList] = useState([]);

  const windowWidth = Dimensions.get('window').width;

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const fetchData = async() => {
    var tempList = [];
    const snapshot = await firebase.firestore().collection('recipes').orderBy('rating', 'desc').get()

    await Promise.all(snapshot.docs.map((doc) => {
      tempList.push({key: doc.id, value: doc.data()});

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
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Mr. Recipe</Text>
              <TextInput placeholder='Search for Recipe' style={global.searchbar}></TextInput>
          </View>
          <ScrollView style={{height: '100%'}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <Text style={styles.titleText}>Featured Recipe</Text>
            <View style={styles.featuredContainer}>
              <FlashList
                data={dataList}
                extraData={dataList}
                renderItem={({item}) => (
                  <TouchableOpacity style={{width: windowWidth-20, height: 300, borderRadius: 10}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                    <View style={styles.list}>
                      <Image source={{uri: (item.value.image)}} style={{height: 210, width: windowWidth-50, borderRadius: 20}}/>
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
                          <Icon name='heart' color={'gray'} size={18} />
                        </View>
                      </View>
                    </View>
                    {/* <ImageBackground source={{uri: (item.value.image)}} style={[global.list, {height: 250}]} imageStyle={{borderRadius: 15}}>
                      <Text style={global.listTitle}>{item.value.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                        <View style={{flex: 1}}></View>
                        <Rating
                          style={global.ratingBar}
                          ratingCount={5}
                          imageSize={16}
                          readonly={true}
                          type={'custom'}
                          ratingBackgroundColor={'transparent'}
                          tintColor={'#2E2E2E'}
                          startingValue={item.rating}
                        />
                        <Text style={global.rating}>{item.rating}</Text>
                      </View>
                      <Text style={global.listText}>Difficulty: {item.value.difficulty}</Text>
                      <Text style={global.listText}>Total time: {((item.value.cooktime + item.value.preptime) / 60).toFixed(2)} hr</Text>
                      
                      <View style={global.author}>
                        <Text style={global.listText}>Posted By: {item.value.user}</Text>
                      </View>
                    </ImageBackground> */}
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={1}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <Text style={styles.titleText}>Trending</Text>
            <View style={styles.trendingContainer}>
            <FlashList
                data={dataList}
                extraData={dataList}
                renderItem={({item}) => (
                  <TouchableOpacity style={{width: windowWidth-20, height: 300}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                    <View style={{height: 300, backgroundColor: "#494949"}}>
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={10}
                numColumns={1}
                showsHorizontalScrollIndicator={false}
                snapToAlignment={'start'}
                decelerationRate={"fast"}
                snapToInterval={windowWidth-20}
                horizontal
              />
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
    paddingTop: 10,
  },
  featuredContainer: {
    width: Dimensions.get("window").width,
    height: 300,
    padding: 10,
    paddingBottom: 0,
  },
  trendingContainer: {
    height: 300,
    padding: 10,
    // paddingHorizontal: 10,
    // marginBottom: 150,
    // marginTop: 20,
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
  ratingContainer: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  ratingBar: {
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 10,
  },
  rating: {
      color: 'gray',
      fontSize: 12,
      marginHorizontal: 10,
      fontWeight: 'bold',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 10,
  },
});
  