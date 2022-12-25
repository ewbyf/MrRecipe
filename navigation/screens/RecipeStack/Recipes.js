import { StyleSheet, View, Text, TextInput, RefreshControl, TouchableOpacity, ImageBackground, Alert, ScrollView } from "react-native";
import global from "../../../Styles";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import React from 'react';
import { Rating } from "react-native-ratings";
import { firebase } from '../../../config';

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
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View style={styles.postsContainer}>
              <FlashList
                data={dataList}
                extraData={dataList}
                renderItem={({item}) => (
                  <TouchableOpacity style={{width: '100%'}} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                    <ImageBackground source={{uri: (item.value.image)}} style={global.list} imageStyle={{borderRadius: 15}}>
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
  });
  