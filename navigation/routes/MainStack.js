import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import NavigationBar from "../screens/NavigationTab/NavigationBar";
import Profile from "../screens/Profile";
import Dish from "../routes/DishStack";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="NavigatorScreen"
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="NavigatorScreen" component={NavigationBar} />
      <Stack.Screen name="ProfileScreen" component={Profile} />
      <Stack.Screen name="DishStack" component={Dish} />
    </Stack.Navigator>
  );
}
