import React, { useState, useRef, useEffect, useContext } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, Dimensions, Alert, ToastAndroid, Image } from 'react-native'
import { TextInput } from 'react-native-paper'
import { RFValue } from 'react-native-responsive-fontsize'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
const { height, width } = Dimensions.get('window')
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../context/UserContext'

export default props => {
    const [codeNew, setCodeNew] = useState('')
    const [code, setCode] = useState('')
    const [newWorkspace, setNewWorkSpace] = useState(false)
    const [confirmCode, setConfirmCode] = useState(false)
    const [nameWorkspace, setNameWorkspace] = useState('')
    const nameRef = useRef()
    const { emailContext, nameContext, photoContext, idUserContext, workspacesContext, getPhoto, getEmail, getName, getId, getWorkspace, getIdPause } = useContext(UserContext)

    const showToast = (message) => {
        ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    }

    useEffect(() => {
        const getInfoUser = async () => {
            const e = auth().currentUser
            const users = await firestore().collection('users').get();
            const user = users._docs.filter(user => user._data.email == e.email)
            getName(user[0]._data.name)
            getEmail(user[0]._data.email)
            getId(user[0]._ref._documentPath._parts[1])
            getPhoto(user[0]._data.photo)
            getWorkspace(user[0]._data.workspace_default.id_workspace)
            getIdPause(user[0]._data.id_pause)
        }
        getInfoUser()
    }, [])


    const handleCheckWorkspace = async () => {
        const works = await firestore()
            .collection('workspaces').doc(code).get()
            .then(doc => {
                const nameWorkspace = doc._data.name
                firestore()
                    .collection('workspaces')
                    .doc(code)
                    .update({
                        users: firestore.FieldValue.arrayUnion(emailContext),
                    })
                    .then(doc => {
                        setConfirmCode(true)
                        showToast('Usuário incluído no workspace')
                        updateWorkspaceFromUser(code, nameWorkspace)
                        getWorkspace(code)
                    })
                    .catch(err => {
                        console.log(err)
                        setConfirmCode(false)
                        Alert.alert('Erro', 'Código inválido')
                    })
            })
            .catch(err => console.log(err))

    }

    const updateWorkspaceFromUser = async (code, nameWorkspace) => {
        await firestore()
            .collection('users').doc(idUserContext)
            .update({
                workspaces: firestore.FieldValue.arrayUnion({ id_workspace: code, name_workspace: nameWorkspace }),
                workspace_default: { id_workspace: code, name_workspace: nameWorkspace }
            })
            .then((doc) => console.log(doc))
            .catch(err => console.log('ERRO: ' + err))

    }

    const handleNewWorkspace = () => {
        let workspace = {
            name: nameWorkspace,
            email_adm: emailContext,
        }
        firestore()
            .collection('workspaces')
            .add(workspace)
            .then((doc) => setCodeNew(doc._documentPath._parts[1]))
            .catch(err => console.log('erro', err.message))
    }

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <View style={[styles.topView, confirmCode]}>
                    <Text style={styles.title}>Participe de um workspace</Text>
                    <TextInput
                        onChangeText={text => {
                            if (text.length == 0) setConfirmCode(false)
                            setCode(text)
                        }}
                        value={`${code}`}
                        style={styles.textInput}
                        mode='outlined'
                        label='Código do workspace'
                        placeholder='Ex: abc123'
                        placeholderTextColor={'#aaa'}
                        keyboardType='default'
                        maxLength={30}
                    />
                    <TouchableWithoutFeedback onPress={() => {
                        handleCheckWorkspace()
                    }}
                    >
                        <View style={styles.buttonPause}>
                            <Text style={styles.buttonPauseText}>Validar workspace</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    {confirmCode ?
                        <>
                            <Image style={styles.checkIcon} source={require('../assets/check.png')} />
                        </> : false}
                </View>
            </View>

            <View style={styles.middle}>
                <Text style={{ color: 'black', fontSize: RFValue(20) }}>ou</Text>
            </View>

            <View style={styles.box}>
                <View style={styles.bottomView}>
                    <Text style={styles.title}>Crie um novo workspace</Text>
                    <TextInput
                        ref={nameRef}
                        onChangeText={text => {
                            if (text.length == 0) setNewWorkSpace(false)
                            setNameWorkspace(text)
                        }}
                        value={`${nameWorkspace}`}
                        style={styles.textInput}
                        mode='outlined'
                        label='Nome do novo workspace'
                        placeholder='Ex: Squad 1'
                        placeholderTextColor={'#aaa'}
                        keyboardType='default'
                        maxLength={30}
                    />
                    <TouchableWithoutFeedback onPress={() => {
                        if (nameWorkspace == '') {
                            nameRef.current.focus()
                            return
                        }
                        handleNewWorkspace()
                        setNewWorkSpace(true)
                    }}
                    >
                        <View style={styles.buttonPause}>
                            <Text style={styles.buttonPauseText}>Criar novo Workspace</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    {newWorkspace ? <>
                        <TouchableWithoutFeedback onPress={() => console.log('copiar para area de trabalho')}>
                            <Text selectable adjustsFontSizeToFit numberOfLines={1} style={{ color:'black', fontSize: RFValue(30), fontWeight: 'bold', marginTop: RFValue(10) }}>{codeNew}</Text>
                        </TouchableWithoutFeedback>
                    </>
                        : false}


                </View>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonPause: {
        height: RFValue(50),
        backgroundColor: '#EE5200',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RFValue(15),
        borderWidth: RFValue(1),
        borderColor: '#F23827',
        marginTop: RFValue(20)
    },
    buttonPauseText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: RFValue(20)
    },
    textInput: { width: '90%', height: RFValue(50) },
    box: {
        flex: 4,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'

    },
    bottomView: {
        borderColor: 'black',
        borderWidth: 1,
        height: RFValue(250),
        borderRadius: RFValue(15),
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
    },
    topView: {
        borderColor: 'black',
        borderWidth: 1,
        height: RFValue(250),
        borderRadius: RFValue(15),
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
    },
    title: {
        fontSize: RFValue(20),
        color: 'black',
        marginBottom: RFValue(10)
    },
    checkIcon: {
        marginTop: RFValue(5),
        width: RFValue(35),
        height: RFValue(35)
    }
})