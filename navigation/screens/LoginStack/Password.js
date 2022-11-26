

import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'

export default function Password({ navigation }) {
    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <Icon name='arrow-back-outline' size={24} color='white' style={styles.backArrow} onPress={() => {navigation.goBack(null)}}/>
                <Text style={styles.topbarTitle}>Create a Password</Text>
            </View>
            <View style={styles.login}>
                <Text style={styles.title}>Create a Password</Text>
                <TextInput placeholder="Password" style={styles.inputField}></TextInput>
                <TextInput placeholder="Confirm Password" style={styles.inputField}></TextInput>

                <Button title='Create Account' style={styles.loginButton}/>
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
    login: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '87%',
    },
    title: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#518BFF',
    },
    inputField: {
        width: 200,
        marginVertical: 5,
        padding: 7,
        borderColor: '#518BFF',
        borderBottomWidth: 1,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#518BFF',
    },
    });