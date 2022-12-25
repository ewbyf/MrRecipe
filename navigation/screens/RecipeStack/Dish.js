import { StyleSheet, View, Text, TextInput } from "react-native";
import global from "../../../Styles";
import { useState, useEffect } from "react";
import { firebase } from '../../../config';



export default function Dish({navigation}) {
    return (
        <View styles={global.appContainer}>
            <Text>hi</Text>
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