import React, { useState, useContext, useRef } from 'react'
import { Text, View, StyleSheet, ImageBackground, TouchableWithoutFeedback, Dimensions, ToastAndroid, Alert, Modal } from 'react-native'
import { TextInput } from 'react-native-paper'
import auth from '@react-native-firebase/auth'
import { UserContext } from '../context/UserContext'
import { RFValue } from 'react-native-responsive-fontsize'
import firestore from '@react-native-firebase/firestore'
import uuid from 'react-native-uuid';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

//   GoogleSignin.configure();

const { height, width } = Dimensions.get('window')

export default props => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [changeLoginOrNew, setChangeLoginOrNew] = useState(false)
    const { getEmail, getName, getId } = useContext(UserContext)
    const [emailEmpty, setEmailEmpty] = useState(false)
    const emailRef = useRef()

    const showToast = (message) => {
        ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    }

    const registerNewAccount = () => {
        let user = {
            name: name,
            email: email.toLowerCase()
        }
        firestore()
            .collection('users')
            .add(user)
            .then((doc) => {
                getId(doc._documentPath._parts[1])
                getName(user.name)
                getEmail(user.email)
            })
            .catch(err => console.log('erro', err.message))
    }

    const handleNewAccount = () => {
        auth()
            .createUserWithEmailAndPassword(email.toLowerCase(), password)
            .then(() => {
                registerNewAccount()
            })
            .catch(err => {
                if (err.message.includes('address is already in use')) {
                    Alert.alert('Dados inválidos', 'Email já registrado.')
                } else {
                    Alert.alert('Dados inválidos', err.message)
                }
            })
    }

    const handleSignIn = () => {
        auth()
            .signInWithEmailAndPassword(email.toLowerCase(), password)
            .then(() => {
                firestore().collection('users').where('email', '==', `${email.toLowerCase()}`).get().then((snapshot) => {
                    getId(snapshot._docs[0]._ref._documentPath._parts[1])
                    getName(snapshot._docs[0]._data.name)
                    getEmail(snapshot._docs[0]._data.email)
                })
            })
            .catch(err => {
                console.log(err.message)
                if (err.message.includes('badly formatted')) {
                    Alert.alert('Dados inválidos', 'Formato incorreto do email.')
                } else if (err.message.includes('incorrect, malformed or has expired')) {
                    Alert.alert('Dados inválidos', 'Email ou senha não cadastrado.')
                } else if (err.message.includes('blocked all requests from this device due to unusual activity')) {
                    Alert.alert('Dados inválidos', 'Conta bloqueada. Redefina a sua senha.')
                } else {
                    Alert.alert('Dados inválidos', err.message)
                }
            })
    }

    const handleForgotPassword = () => {
        auth()
            .sendPasswordResetEmail(email.toLowerCase())
            .then(() => showToast('Redefinição enviado por email'))
            .catch(err => {
                if (err.message.includes('badly formatted')) {
                    Alert.alert('Erro', 'Email informado em um formato incorreto')
                } else {
                    Alert.alert('Erro', err.message)
                }
            })
    }

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/loginScreen.png')} resizeMode='cover' style={{
                flex: 1,
                alignItems: 'center',
                width: '100%'
            }}>
                <View style={{ height: RFValue(height * 0.3) }} />
                <View style={{ flexDirection: 'row', width: '80%', height: RFValue(30), justifyContent: 'center', marginVertical: RFValue(30) }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: changeLoginOrNew ? RFValue(1) : RFValue(3), borderColor: changeLoginOrNew ? '#fff' : '#EE5200' }}>
                        <TouchableWithoutFeedback onPress={() => {
                            setEmail('')
                            setPassword('')
                            setName('')
                            setChangeLoginOrNew(false)
                        }}
                        >
                            <Text style={{ color: '#fff', fontSize: changeLoginOrNew ? RFValue(15) : RFValue(19) }}>Login</Text>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: changeLoginOrNew ? RFValue(3) : RFValue(1), borderColor: changeLoginOrNew ? '#EE5200' : '#fff', }}>
                        <TouchableWithoutFeedback onPress={() => {
                            setEmail('')
                            setPassword('')
                            setName('')
                            setChangeLoginOrNew(true)
                        }}>
                            <Text style={{ color: '#fff', fontSize: changeLoginOrNew ? RFValue(19) : RFValue(15) }}>Nova conta</Text>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                {!changeLoginOrNew ?
                    <>
                        <TextInput
                            onChangeText={text => {
                                setEmailEmpty(false)
                                setEmail(text)
                            }}
                            value={`${email}`}
                            style={styles.textInput}
                            mode='flat'
                            label='Email'
                            placeholder='Ex: email@email.com'
                            placeholderTextColor={'#aaa'}
                            keyboardType='email-address'
                            maxLength={30}
                            ref={emailRef}
                        />
                        {emailEmpty ? <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#999' }}>*Informe seu email para receber a redefinição de senha</Text> : false}
                        <TextInput
                            onChangeText={text => setPassword(text)}
                            value={`${password}`}
                            style={styles.textInput}
                            mode='flat'
                            label='Senha'
                            placeholder='Ex: 123456'
                            placeholderTextColor={'#aaa'}
                            keyboardType='default'
                            secureTextEntry
                            maxLength={30}
                        />

                        <TouchableWithoutFeedback onPress={() => {
                            if (email == '') {
                                emailRef.current.focus()
                                setEmailEmpty(true)
                                return
                            }
                            handleForgotPassword()
                        }}>
                            <Text style={{ alignSelf: 'flex-end', color: '#fff', marginRight: RFValue(25), marginTop: RFValue(15) }}>Esqueceu a senha ?</Text>

                        </TouchableWithoutFeedback>


                        <TouchableWithoutFeedback onPress={() => handleSignIn()}>
                            <View style={styles.buttonPause}>
                                <Text style={styles.buttonPauseText}>Fazer login</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </>
                    :
                    <>
                        <TextInput
                            onChangeText={text => setEmail(text)}
                            value={`${email}`}
                            style={styles.textInput}
                            mode='flat'
                            label='Email'
                            placeholder='Ex: email@email.com'
                            placeholderTextColor={'#aaa'}
                            keyboardType='email-address'
                            maxLength={30}
                        />
                        <TextInput
                            onChangeText={text => setName(text)}
                            value={`${name}`}
                            style={styles.textInput}
                            mode='flat'
                            label='Nome'
                            placeholder='Ex: Joäo da Silva'
                            placeholderTextColor={'#aaa'}
                            keyboardType='default'
                            maxLength={30}
                        />
                        <TextInput
                            onChangeText={text => setPassword(text)}
                            value={`${password}`}
                            style={styles.textInput}
                            mode='flat'
                            label='Senha'
                            placeholder='Ex: 123456'
                            placeholderTextColor={'#aaa'}
                            keyboardType='default'
                            secureTextEntry
                            maxLength={30}
                        />

                        <TouchableWithoutFeedback onPress={() => {
                            // signIn(email, name)
                            handleNewAccount()
                        }}
                        >
                            <View style={styles.buttonPause}>
                                <Text style={styles.buttonPauseText}>Cadastrar novo usuário</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </>

                }


            </ImageBackground >
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: { width: '90%', marginTop: RFValue(15), height: RFValue(50) },
    buttonPause: {
        height: RFValue(50),
        backgroundColor: '#EE5200',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RFValue(15),
        borderWidth: RFValue(1),
        borderColor: '#F23827',
        marginTop: RFValue(50)
    },
    buttonPauseText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: RFValue(20)
    },
})