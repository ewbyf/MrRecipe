import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/LoginStack/Login";
import Register from "../screens/LoginStack/Register";

const Stack = createStackNavigator();

export default function LoginStack() {
    return (
        <Stack.Navigator initialRouteName="LoginScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="LoginScreen" component={Login} />
            <Stack.Screen name="RegisterScreen" component={Register} />
        </Stack.Navigator>
      );
}