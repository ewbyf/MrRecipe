import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Dish from "../screens/DishStack/Dish";
import Edit from "../screens/DishStack/Edit";
import { useRoute } from "@react-navigation/native";
const Stack = createStackNavigator();

export default function DishStack() {
  const route = useRoute();
  return (
    <Stack.Navigator
      initialRouteName="DishScreen"
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Stack.Screen
        name="DishScreen"
        component={Dish}
        initialParams={{
          doc: route.params.doc,
          id: route.params.id ? route.params.id : null,
        }}
      />
      <Stack.Screen name="EditScreen" component={Edit} />
    </Stack.Navigator>
  );
}
