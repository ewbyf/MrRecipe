import { createStackNavigator } from "@react-navigation/stack";
import People from "../screens/People";


const Stack = createStackNavigator();

export default function PeopleStack() {
    return (
        <Stack.Navigator initialRouteName="PeopleScreen" screenOptions={({route}) => ({
            headerShown: false,
        })}>
            <Stack.Screen name="PeopleScreen" component={People} />
        </Stack.Navigator>
      );
}