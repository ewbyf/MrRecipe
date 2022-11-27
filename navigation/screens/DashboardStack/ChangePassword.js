import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";

export default function ChangePassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        try {
            setEmail(firebase.auth().currentUser.email);
        } catch (error) {
            alert(error.code);
        }
    },[]) 

    const changePassword = async() => {
        if (!password || !confirmPassword || !newPassword)
            Alert.alert(
                "Missing Password",
                "One or more of the input fields is blank. Please enter your password in the input fields."
            );
        else if (confirmPassword != newPassword)
            Alert.alert(
                "Passwords Don't Match",
                "Passwords do not match. Please retry entering your password."
            );
        else if (newPassword == confirmPassword) {
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                firebase.auth().currentUser.updatePassword(newPassword)
                .then(() => {
                    Alert.alert(
                        "Password Changed",
                        "Your password has been successfully changed."
                    );
                    navigation.navigate('DashboardScreen');
                })
                .catch((error) => {
                    alert(error.code);
                });
            }
            catch(error) {
                alert(error.code);
            }
        }
    }

    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <Icon name='arrow-back-outline' size={24} color='white' style={styles.backArrow} onPress={() => {navigation.goBack(null)}}/>
                <Text style={styles.topbarTitle}>Create a Password</Text>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Change Password</Text>
                <TextInput
                    placeholder="Current Password"
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    style={styles.inputField}
                    onChangeText={(password) => setPassword(password)}
                ></TextInput>
                <TextInput
                    placeholder="New Password"
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    style={styles.inputField}
                    onChangeText={(newPassword) => setNewPassword(newPassword)}
                ></TextInput>
                <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    style={styles.inputField}
                    onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                ></TextInput>

                <TouchableOpacity onPress={() => changePassword()} style={styles.button}>
                    <Text style={styles.buttonText}>Change Password</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appcontainer: {
        height: '100%',
        backgroundColor: '#222222',
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
    formContainer: {
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
        color: 'white',
    },
    button: {
        backgroundColor: '#518BFF',
        width: 200,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
      },
      buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
      },
    });