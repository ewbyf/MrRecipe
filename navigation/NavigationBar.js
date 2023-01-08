import { StyleSheet, Text, View, TextInput, Image, TouchableHighlight, TouchableOpacity } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { firebase } from '../config';

// Screens
import RecipesStack from './routes/RecipesStack';
import FavoritesStack from './routes/FavoritesStack';
import LoginStack from './routes/LoginStack';
import DashboardStack from './routes/DashboardStack';
import SearchStack from './routes/SearchStack';
import PostScreen from './screens/Post'

import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export default function NavigationBar() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [buttonName, setButtonName] = useState('');

  const CustomTabBarButton = ({children, onPress}) => (
    <TouchableOpacity style={{
      top: -30,
      justifyContent: 'center',
      alignItems: 'center',
      ...styles.shadow,
    }} onPress={onPress}>
      <View style={
        styles.postButton
      }>
        {children}
      </View>
    </TouchableOpacity>
  )

  function onAuthStateChanged(user) {
    setUser(user);
    if (!user)
    setButtonName('Login');
    else
      setButtonName('Profile');
    if (initializing)
      setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing)
    return null;
    
  return (
    <View style={styles.appcontainer}>
      <NavigationContainer>
        <Tab.Navigator initialRouteName='RecipesStack' screenOptions={({route}) => ({
                headerShown: false,
                tabBarShowLabel: false, 
                tabBarStyle: {
                  ...styles.tabBar,
                  ...styles.shadow
                }
            })}>

            <Tab.Screen name={'RecipesStack'} component={RecipesStack} options={{
              tabBarIcon: ({focused}) => (
                <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
                  <Icon name={focused ? 'book' : 'book-outline'} color={focused ? '#FFDDA1' : 'white'} size={25}/>
                  <Text style={{fontSize: 13, color: focused ? '#FFDDA1' : 'white'}}>
                    Recipes
                  </Text>
                </View> 
              )
            }}/>
            <Tab.Screen name={'Search'} component={SearchStack} options={{
              tabBarIcon: ({focused}) => (
                <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
                  <Icon name={focused ? 'search' : 'search-outline'} color={focused ? '#FFDDA1' : 'white'} size={25}/>
                  <Text style={{fontSize: 13, color: focused ? '#FFDDA1' : 'white'}}>
                    Search
                  </Text>
                </View>
              )
            }}/>
            <Tab.Screen name={'Post'} component={PostScreen} options={{
              tabBarIcon: ({focused}) => (
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Icon name={focused ? 'add' : 'add-outline'} color='white' size={30}/>
                </View>
              ),
              tabBarButton: (props) => (
                <CustomTabBarButton {...props}/>
              ),
              tabBarStyle: {display: 'none'}
            }}/>
            <Tab.Screen name={'Favorites'} component={FavoritesStack} options={{
              tabBarIcon: ({focused}) => (
                <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
                  <Icon name={focused ? 'heart' : 'heart-outline'} color={focused ? '#FFDDA1' : 'white'} size={25}/>
                  <Text style={{fontSize: 13, color: focused ? '#FFDDA1' : 'white'}}>
                    Favorites
                  </Text>
                </View>
              )
            }}/>
            <Tab.Screen name={buttonName} component={user ? DashboardStack : LoginStack} options={{
              tabBarIcon: ({focused}) => (
                <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
                  <Icon name={focused ? 'person-circle' : 'person-circle-outline'} color={focused ? '#FFDDA1' : 'white'} size={25}/>
                  <Text style={{fontSize: 13, color: focused ? '#FFDDA1' : 'white'}}>
                    {buttonName}
                  </Text>
                </View>
              )
            }}/>

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
    backgroundColor: '#222222',
  },
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0, 
    backgroundColor: '#518BFF',
    height: 90,
    borderRadius: 15,
    borderTopWidth: 0,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  postButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFDDA1',
  }
});
