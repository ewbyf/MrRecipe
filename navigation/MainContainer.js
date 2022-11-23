import { StyleSheet, Text, View, TextInput, Image, TouchableHighlight } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'

import Recipes from './screens/Recipes';
import Favorites from './screens/Favorites';
import Login from './screens/Login';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  return (
    <View style={styles.appcontainer}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Mr. Recipe</Text>
        <TextInput placeholder='Search for Recipe' style={styles.searchbar}></TextInput>
      </View>
      <View>
        {/* Recipes */}
      </View>

      <NavigationContainer>
        <Tab.Navigator initialRouteName='Recipes' screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    let routeName = route.name;

                    if (routeName == 'Recipes') {
                        iconName = focused ? 'book' : 'book-outline';
                    }
                    else if (routeName == 'Favorites') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    }
                    else if (routeName == 'Login') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Icon name={iconName} size={size} color={color}/>
                },
            })}>

            <Tab.Screen name={'Recipes'} component={Recipes}/>
            <Tab.Screen name={'Favorites'} component={Favorites}/>
            <Tab.Screen name={'Login'} component={Login}/>

        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  appcontainer: {
    height: '100%',
  },
  topbar: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingTop: 20,
    height: '20%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518BFF',
  },
  topbarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchbar: {
    width: 300,
    borderWidth: 5,
    marginTop: 15,
    borderColor: 'white',
    borderRadius: 20,
    padding: 7,
    backgroundColor: 'white',
    color: 'black',
  },
  navbar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 40,
    height: '10%',
    width: '100%',
    backgroundColor: '#518BFF',
  },
});
