import { createStackNavigator } from "@react-navigation/stack";

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";

import Dashboard from "../screens/DashboardStack/Dashboard";
import Settings from "../screens/DashboardStack/Settings";

const Stack = createStackNavigator();

export default function DashboardStack({ navigation, route }) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName == "SettingsScreen" || routeName == "ChangePasswordScreen"){
            navigation.getParent
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            console.debug('b');
            navigation.setOptions({tabBarStyle: styles.navbar});
        }
    }, [navigation, route]);
    return (
        <Stack.Navigator initialRouteName="DashboardScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="DashboardScreen" component={Dashboard} />
            <Stack.Screen name="SettingsScreen" component={Settings}/>
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
  