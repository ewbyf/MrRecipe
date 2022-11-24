import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Account/Login";
import Favorites from "../screens/Favorites";
import LoginStack from "./LoginStack";

const Stack = createStackNavigator();

export default function FavoritesStack() {
    return (
        <Stack.Navigator initialRouteName="FavoritesScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="FavoritesScreen" component={Favorites} />
            <Stack.Screen name="LoginScreen2" component={LoginStack} />
        </Stack.Navigator>
      );
}