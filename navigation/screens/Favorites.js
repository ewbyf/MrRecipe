import { StyleSheet, View, Text, TextInput, Image, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import global from "../../Styles";
import { useState, useEffect, useRef } from "react";
import { firebase } from '../../config';
import { FlashList } from "@shopify/flash-list";
import { Rating } from "react-native-ratings";
import Icon from "react-native-vector-icons/Ionicons";

export default function Favorites({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  function onAuthStateChanged(userParam) {
    fetchData(userParam);
    setUser(userParam);
    if (initializing)
      setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const fetchData = async(userParam) => {
    if (userParam) {
      var tempList = [];
      let fav = [];
  
      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
            fav = snapshot.data().favorites;
          } else
            Alert.alert("Unknown Error Occured", "Contact support with error.");
        });
  
      await Promise.all(
        fav.map(async(doc) => {
          return firebase
            .firestore()
            .collection("recipes")
            .doc(doc)
            .get()
            .then((snap) => {
              tempList.push({key: doc, value: snap.data()});
            })
            .catch((error) => {
              alert(error.message);
            });
        }),
      );
      setFavorites(tempList);
    }
  };

  useEffect(() => {
    fetchData(user);
    navigation.addListener("focus", () => {setLoading(!loading)});
  }, [navigation, loading]);

  const unfavorite = async(doc) => {
    let temp = favorites;
    temp.splice(favorites.findIndex(item => item.key == doc), 1);

    await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((snap) => {
      let fav = snap.data().favorites;
      fav.splice(snap.data().favorites.indexOf(doc), 1);
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({favorites: fav});
    })
    .catch((error) => {
      alert(error.message);
    })

    setFavorites([...temp]);
  }
  
  if (initializing) return null;

  if (user) {
    return (
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Favorites</Text>
              <TextInput placeholder='Search for Favorites' style={global.searchbar}></TextInput>
          </View>
          <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 3}}
          >
            <View style={styles.postsContainer}>
              {favorites.length == 0 && (
                <Text
                  style={{
                    color: "lightgrey",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  You have no favorites
                </Text>
              )}
              {user && favorites.length > 0 && (
                <FlashList
                  data={favorites}

                  renderItem={({ item }) => (
                    <TouchableOpacity style={global.itemContainer} onPress={() => navigation.navigate("DishScreen", {doc: item.key})}>
                      <View style={[global.list]}>
                        <Image source={{uri: (item.value.image ? item.value.image : 'https://imgur.com/hNwMcZQ.png')}} style={global.listImage}/>
                        <View style={{width: '100%', height: 85}}>
                          <View>
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.value.name}</Text>
                            <Text style={{color: 'gray'}}>{item.value.difficulty}</Text>
                            <Text style={{color: 'gray'}}>{((item.value.cooktime + item.value.preptime) / 60).toFixed(1)}+ hrs</Text>
                          </View>
                        </View>
                      </View>
                      <View style={global.ratingContainer}>
                        <Rating
                          ratingCount={5}
                          imageSize={16}
                          readonly={true}
                          type={'custom'}
                          ratingBackgroundColor={'gray'}
                          tintColor={'#282828'}
                          startingValue={item.value.rating}
                        />
                        <Text style={global.rating}>{item.value.rating} ({item.value.numratings})</Text>   
                        <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => unfavorite(item.key)}>
                          <Icon name='heart' color={'#FF4343'} size={20} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  )}
                  estimatedItemSize={10}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </ScrollView>
      </View>
    );
  }

  return (
      <View style={global.appContainer}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Favorites</Text>
              <TextInput placeholder='Search for Favorites' style={global.searchbar}></TextInput>
          </View>
          <View style={{height: Dimensions.get('window').height - 284, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>You are currently logged out.</Text>
            <Text style={{fontSize: 18, marginTop: 15, color: 'white'}}><Text onPress={() => navigation.navigate('Login')} style={{fontSize: 18, color: '#518BFF'}}>Sign in</Text> to view favorites</Text>
          </View>
      </View>
  );
}
  
const styles = StyleSheet.create({
  postsContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    marginBottom: 150,
    marginTop: 10,
  },
});
