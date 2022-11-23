import { StyleSheet, View, Text, TextInput } from "react-native";

export default function Favorites({ navigation }) {
    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <Text style={styles.topbarTitle}>Favorites</Text>
                <TextInput placeholder='Search for Favorites' style={styles.searchbar}></TextInput>
            </View>
            <View>
                <Text>test</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appcontainer: {
      height: '100%',
    },
    topbar: {
      paddingTop: 30,
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
  });
  