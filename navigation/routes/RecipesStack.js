import { createStackNavigator } from "@react-navigation/stack";

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";

import Recipes from "../screens/RecipeStack/Recipes"
import Dish from "../screens/RecipeStack/Dish"

const Stack = createStackNavigator();

export default function RecipesStack({ navigation, route }) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName == "DishScreen"){
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: styles.navbar});
        }
    }, [navigation, route]);
    return (
        <Stack.Navigator initialRouteName="RecipesScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="RecipesScreen" component={Recipes} />
            <Stack.Screen name="DishScreen" component={Dish} />
        </Stack.Navigator>
      );
}

const styles = StyleSheet.create({
    navbar: {
        position: 'absolute',
        bottom: 25, 
        left: 20,
        right: 20,
        elevation: 0, 
        backgroundColor: '#518BFF',
        height: 90,
        borderRadius: 15,
        borderTopWidth: 0,
        shadowColor: 'black',
        shadowOffset: {
        width: 0,
        height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5
    }
});
  