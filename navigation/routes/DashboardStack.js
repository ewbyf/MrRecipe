import { createStackNavigator } from "@react-navigation/stack";
import Dashboard from "../screens/Account/Dashboard";


const Stack = createStackNavigator();

export default function DashboardStack() {
    return (
        <Stack.Navigator initialRouteName="DashboardScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="DashboardScreen" component={Dashboard} />
        </Stack.Navigator>
      );
}