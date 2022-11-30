import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase } from '../../../config';
import { useState, useEffect } from "react";
import BackArrow from '../../../components/BackArrow'

export default function ChangePassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fieldsFilled, setFieldsFilled] = useState(false);

    useEffect(() => {
        try {
            setEmail(firebase.auth().currentUser.email);
        } catch (error) {
            alert(error.code);
        }
    },[])

    const SaveButton = ({onPress}) => (
        <Text onPress={() => changePassword()}style={{...styles.save, color: fieldsFilled ? 'white' : 'grey'}}>Save</Text>
    )

    const updateFields = (type, value) => {
        if (type == 'currentPassword') {
            setPassword(value);
        }
        else if (type == 'newPassword') {
            setNewPassword(value);
        }
        else if (type == 'confirmPassword') {
            setConfirmPassword(value);
        }
        
        if (password && newPassword && confirmPassword) {
            setFieldsFilled(true);
        }
        
        if (value == '')
            setFieldsFilled(false);
    }

    const changePassword = async() => {
        if (fieldsFilled) {
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
            else if (newPassword.length < 6)
                Alert.alert(
                    "Password Too Short",
                    "The new password you have entered is too short. Please enter a password with at least 6 characters."
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
                    switch(error.code) {
                        case 'auth/wrong-password':
                            Alert.alert(
                                "Password Too Short",
                                "The current password you have entered is incorrect. Please try again."
                            );
                            break;
                        case 'auth/too-many-requests':
                            Alert.alert(
                                "Too Many Requests",
                                "You are creating too many requests. Please try again later."
                            );
                            break;
                        default:
                            alert(error.code);
                    }
                }
            }
        }
    }

    return (
        <View style={styles.appcontainer}>
            <View style={styles.topbar}>
                <BackArrow navigation={navigation}/>
                <Text style={styles.topbarTitle}>Change Password</Text>
                <SaveButton/>
            </View>

            <View>
              <View style={{...styles.field, borderTopWidth: 1, borderTopColor: '#363636'}}>
                <Text style={styles.fieldTitle}>Current Password</Text>
                <TextInput
                    placeholder="Enter your current password"
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    maxLength={18}
                    style={styles.input}
                    onChangeText={(password) => updateFields("currentPassword", password)}
                ></TextInput>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldTitle}>New Password</Text>
                <TextInput
                    placeholder="Enter a new password"
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    maxLength={18}
                    style={styles.input}
                    onChangeText={(password) => updateFields("newPassword", password)}
                ></TextInput>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldTitle}>Confirm Password</Text>
                <TextInput 
                    placeholder='Confirm your new password'
                    placeholderTextColor='#818181'
                    autoCapitalize={false}
                    autoCorrect={false}
                    secureTextEntry={true}
                    maxLength={18}
                    style={styles.input}
                    onChangeText={(password) => updateFields("confirmPassword", password)}
                ></TextInput>
              </View>
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
    topbarTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    save: {
        position: 'absolute',
        right: 20,
        bottom: '50%',
        marginBottom: -11,
        fontSize: 18,
        fontWeight: 'bold',
    },
    title: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#518BFF',
    },
    section: {
        color: 'grey',
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 6,
        paddingLeft: 30,
    },
    field: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#363636',
    },
    fieldTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#518BFF',
        marginRight: 20,
        width: 90,
    },
    input: {
        fontSize: 16,
        color: 'white',
        width: 225,
    },
});