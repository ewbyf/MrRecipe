import { createStackNavigator } from "@react-navigation/stack";
import Favorites from "../screens/Favorites";

const Stack = createStackNavigator();

export default function FavoritesStack() {
    return (
        <Stack.Navigator initialRouteName="FavoritesScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="FavoritesScreen" component={Favorites} />
        </Stack.Navigator>
      );
}