import { StyleSheet, View, Text, TextInput } from "react-native";
import global from "../../../Styles";
import BackArrow from '../../../components/BackArrow';
import { useState, useEffect } from "react";
import { firebase } from '../../../config';
import { useRoute } from "@react-navigation/native";


export default function Dish({props, navigation}) {
    const route = useRoute();

    useEffect(() => {
        console.debug(route.params.doc)
    }, [])

    return (
        <View style={global.appContainer}>
            <View style={global.topbar}>
                <BackArrow navigation={navigation}/>
                <Text style={global.topbarTitle}>Recipe</Text>
            </View>

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
    author: {
      marginTop: 'auto',
    }
  });