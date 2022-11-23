import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Register from "../screens/Register";

const Stack = createStackNavigator();

export default function LoginStack() {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      );
}