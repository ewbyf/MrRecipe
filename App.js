import { StyleSheet, Text, View, TextInput } from 'react-native';

export default function App() {
  return (
    <View style={styles.appcontainer}>
      <View style={styles.topbar}>
        <Text>Mr. Recipe</Text>
        <TextInput placeholder='Search for Recipe' style={styles.searchbar}></TextInput>
      </View>
      <View>

      </View>
      <View style={styles.navbar}>
      </View>
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
    height: '15%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518BFF',
  },
  searchbar: {
    width: 300,
    marginTop: 10,
    borderWidth: 5,
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
    height: '10%',
    width: '100%',
    backgroundColor: '#518BFF',
  }
});
