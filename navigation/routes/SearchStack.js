import { createStackNavigator } from "@react-navigation/stack";
import Search from "../screens/Search";


const Stack = createStackNavigator();

export default function SearchStack() {
    return (
        <Stack.Navigator initialRouteName="SearchScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="SearchScreen" component={Search} />
        </Stack.Navigator>
      );
}