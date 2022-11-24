import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';

export default function Dashboard({ navigation }) {
    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <Text style={styles.topbarTitle}>Dashboard</Text>
            </View>
            <View style={styles.dashboard}>
              <Button title='Sign out' onPress={() => firebase.auth().signOut()}/>
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
      height: '13%',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#518BFF',
    },
    backArrow: {
        position: 'absolute',
        left: 20,
        bottom: '50%',
        marginBottom: -12,
    },
    topbarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    dashboard: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
    },
  });