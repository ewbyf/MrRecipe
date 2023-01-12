import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import global from "../../../../Styles";
import { useState, useEffect } from "react";
import { firebase } from '../../../../config';
import Icon from "react-native-vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Rating } from "react-native-ratings";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export default function Search({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

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
      let tempList = [];
      let fav = [];
      let deleted = 0;
  
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
              if (snap.exists) {
                tempList.push({key: doc, value: snap.data()});
              }
              else {
                fav.splice(fav.indexOf(doc), 1);
                deleted++;
              }
            })
            .catch((error) => {
              alert(error.message);
            });
        }),
      );

      if (deleted) {
        await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          favorites: fav
        });
      }

      setFavorites(tempList);
    }
  };

  useEffect(() => {
    fetchData(user);
    navigation.addListener("focus", () => {setLoading(!loading)});
  }, [navigation, loading]);

  if (initializing) {
    return (
      <View style={global.appContainer}>
        <View style={global.searchTopbar}>
            <Text style={global.topbarTitle}>Search</Text>
            <View>
              <TextInput placeholder='Search for Recipes and Users' style={global.searchbar}></TextInput>
              <Icon name="search-outline" style={{position: 'absolute', bottom: 10, left: 10}} size={16} color="lightgray"/>
            </View>
        </View>
    </View>
    );
  }

  return (
    <View style={global.appContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={global.searchTopbar}>
              <Text style={global.topbarTitle}>Search</Text>
              <View>
                <TextInput placeholder='Search for Recipes and Users' style={global.searchbar}></TextInput>
                <Icon name="search-outline" style={{position: 'absolute', bottom: 10, left: 10}} size={16} color="lightgray"/>
              </View>
          </View>
        </TouchableWithoutFeedback>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 3}}
        >
          <View style={styles.postsContainer}>
            {user && favorites.length > 0 && (
              <FlashList
                data={favorites}

                renderItem={({ item }) => (
                  <TouchableOpacity style={global.itemContainer} onPress={() => navigation.navigate("DishStack", {doc: item.key})}>
                    <View style={[global.list]}>
                      <Image source={{uri: (item.value.image ? item.value.image : 'https://imgur.com/hNwMcZQ.png')}} style={global.listImage}/>
                      <View style={{width: '100%', height: 85}}>
                        <View>
                          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>{item.value.name}</Text>
                          <Text style={{color: 'gray'}}>{item.value.difficulty}</Text>
                          <Text style={{color: 'gray'}}>{parseFloat(((item.value.cooktime + item.value.preptime) / 60).toFixed(2))}+ hrs</Text>
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
  
const styles = StyleSheet.create({
  signinText: {
    width: 300,
    borderWidth: 5,
    marginTop: 15,
    borderColor: 'white',
    borderRadius: 20,
    padding: 7,
    backgroundColor: '#518BFF',
    color: 'black',
    flexDirection: 'row',
    marginTop: 20
  },
  postsContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    marginBottom: 150,
    marginTop: 10,
  },
});
  