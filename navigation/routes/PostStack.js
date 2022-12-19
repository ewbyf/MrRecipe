import { createStackNavigator } from "@react-navigation/stack";
import Post from "../screens/Post";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import React from "react";

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
