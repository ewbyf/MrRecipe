import { createStackNavigator } from "@react-navigation/stack";
import Post from "../screens/Post";
import { StyleSheet } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import React from "react";
import DashboardStack from './DashboardStack';

const Stack = createStackNavigator();

export default function PostStack({ navigation, route }) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        navigation.setOptions({tabBarStyle: {display: 'none'}});
    }, [navigation, route]); 
    return (
        <Stack.Navigator initialRouteName="PostScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="PostScreen" component={Post} />
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
  