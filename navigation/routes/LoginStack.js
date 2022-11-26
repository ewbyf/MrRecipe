import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/LoginStack/Login";
import Register from "../screens/LoginStack/Register";
import Confirmation from "../screens/LoginStack/Confirmation";
import Password from "../screens/LoginStack/Password";
import ForgotPassword from "../screens/LoginStack/ForgotPassword";

const Stack = createStackNavigator();

export default function LoginStack() {
    return (
        <Stack.Navigator initialRouteName="LoginScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="LoginScreen" component={Login} />
            <Stack.Screen name="RegisterScreen" component={Register} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPassword} />
            <Stack.Screen name="ConfirmationScreen" component={Confirmation} />
            <Stack.Screen name="PasswordScreen" component={Password} />
        </Stack.Navigator>
      );
}