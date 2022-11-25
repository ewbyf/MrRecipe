import { StyleSheet, Text, View, TextInput, Image, TouchableHighlight } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { firebase } from '../config';

// Screens
import Recipes from './screens/Recipes';
import FavoritesStack from './routes/FavoritesStack';
import LoginStack from './routes/LoginStack';
import DashboardStack from './routes/DashboardStack';

import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export default function NavigationBar() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing)
      setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing)
    return null;
  
  if (!user) {
    return (
      <View style={styles.appcontainer}>
        <NavigationContainer>
          <Tab.Navigator 
            initialRouteName='Recipes' screenOptions={({route}) => ({
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
                      else if (routeName == 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                      }
                      else if (routeName == 'Post') {
                        iconName = focused ? 'add' : 'add-outline';
                      }
                      return (
                          focused? (
                          <View style={{ borderTopWidth: 3, width: '100%', height: '100%', padding: 1, borderColor: '#FFDDA1' }}>
                              <Icon style={{ alignSelf: "center", justifyContent: "center", alignItems: "center" }} name={iconName} size={size} color={color} />
                          </View>) :
                          (
                              <Icon name={iconName} size={size} color={color}/>
                          )
                      )
                  },
                  tabBarActiveBackgroundColor: '#518BFF',
                  tabBarInactiveBackgroundColor: '#518BFF',
                  tabBarActiveTintColor: '#FFDDA1',
                  tabBarInactiveTintColor: 'white',
                  tabBarStyle: {backgroundColor: '#518BFF'},
                  headerStyle: {backgroundColor: '#518BFF'},
                  headerShown: false,
              })}>
  
              <Tab.Screen name={'Recipes'} component={Recipes}/>
              <Tab.Screen name={'Search'} component={FavoritesStack}/>
              <Tab.Screen name={'Post'} component={FavoritesStack}/>
              <Tab.Screen name={'Favorites'} component={FavoritesStack}/>
              <Tab.Screen name={'Login'} component={LoginStack}/>
              
          </Tab.Navigator>
        </NavigationContainer>
        <View>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.appcontainer}>
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
                    else if (routeName == 'Profile') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    else if (routeName == 'Search') {
                      iconName = focused ? 'search' : 'search-outline';
                    }
                    else if (routeName == 'Post') {
                      iconName = focused ? 'add' : 'add-outline';
                    }
                    return (
                        focused? (
                        <View style={{ borderTopWidth: 3, width: '100%', height: '100%', padding: 1, borderColor: '#FFDDA1' }}>
                            <Icon style={{ alignSelf: "center", justifyContent: "center", alignItems: "center" }} name={iconName} size={size} color={color} />
                        </View>) :
                        (
                            <Icon name={iconName} size={size} color={color}/>
                        )
                    )
                },
                tabBarActiveBackgroundColor: '#518BFF',
                tabBarInactiveBackgroundColor: '#518BFF',
                tabBarActiveTintColor: '#FFDDA1',
                tabBarInactiveTintColor: 'white',
                tabBarStyle: {backgroundColor: '#518BFF'},
                headerStyle: {backgroundColor: '#518BFF'},
                headerShown: false,
            })}>

            <Tab.Screen name={'Recipes'} component={Recipes}/>
            <Tab.Screen name={'Search'} component={FavoritesStack}/>
            <Tab.Screen name={'Post'} component={FavoritesStack}/>
            <Tab.Screen name={'Favorites'} component={FavoritesStack}/>
            <Tab.Screen name={'Profile'} component={DashboardStack}/>

        </Tab.Navigator>
      </NavigationContainer>
      <View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appcontainer: {
    height: '100%',
  },
});
