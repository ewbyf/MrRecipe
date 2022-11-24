import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'

export default function Confirmation({ navigation }) {
    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <Icon name='arrow-back-outline' size={24} color='white' style={styles.backArrow} onPress={() => {navigation.goBack(null)}}/>
                <Text style={styles.topbarTitle}>Confirm Email</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Please confirm your email address by clicking on the link sent to your email.</Text>
                <Text>Didn't receive an email? Check your junk folder.</Text>
                <View style={{flexDirection: 'row', marginTop: 15}}>
                    <Text>Still not there? </Text>
                    <Text style={{color: '#518BFF'}}>Resend email</Text>
                </View>
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
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
        padding: 40,
    },
    title: {
      marginBottom: 20,
      fontSize: 24,
      color: '#518BFF',
      textAlign: 'center',
    },
  });