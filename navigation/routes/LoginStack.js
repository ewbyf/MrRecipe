import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Account/Login";
import Register from "../screens/Account/Register";
import Confirmation from "../screens/Account/Confirmation";
import Password from "../screens/Account/Password";
import ForgotPassword from "../screens/Account/ForgotPassword";
import Favorites from "../screens/Favorites";

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
            <Stack.Screen name="FavoritesScreen" component={Favorites} />
        </Stack.Navigator>
      );
}