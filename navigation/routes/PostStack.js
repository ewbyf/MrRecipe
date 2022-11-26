import { createStackNavigator } from "@react-navigation/stack";
import Post from "../screens/Post";


const Stack = createStackNavigator();

export default function PostStack() {
    return (
        <Stack.Navigator initialRouteName="PostScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="PostScreen" component={Post} />
        </Stack.Navigator>
      );
}