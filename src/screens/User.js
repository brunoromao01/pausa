import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Text, View, StyleSheet, Alert, TouchableOpacity, Image, TouchableWithoutFeedback, Dimensions, ToastAndroid } from 'react-native'
import { TextInput } from 'react-native-paper'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth'
import SelectDropdown from 'react-native-select-dropdown'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { UserContext } from '../context/UserContext'
const { height, width } = Dimensions.get('window')
import { RFValue } from 'react-native-responsive-fontsize';
import firestore from '@react-native-firebase/firestore'
import { useFocusEffect } from '@react-navigation/native';

export default props => {
    const { photoContext, getPhoto, getName, nameContext, idUserContext, getWorkspace, workspaceContext } = useContext(UserContext)
    const [name, setName] = useState(nameContext ? nameContext : '')
    const [foto, setFoto] = useState(photoContext ? photoContext : '')
    const [workspaces, setWorkspaces] = useState([])
    const [idWorkspace, setIdWorkspace] = useState(workspaceContext ? workspaceContext : '')
    const [changeWorkspace, setChangeWorkspace] = useState(false)
    const [nameWorkspace, setNameWorkspace] = useState('')

    useFocusEffect(useCallback(() => {
        const getInfoUser = async () => {
            const e = auth().currentUser
            const users = await firestore().collection('users').get();
            const user = users._docs.filter(user => user._data.email == e.email)
            setWorkspaces(user[0]._data.workspaces)
            setNameWorkspace(user[0]._data.workspace_default.name_workspace)
            getWorkspace(user[0]._data.workspace_default.id_workspace)
        }
        getInfoUser()


    }, []))



    const pickImageGalery = async () => {
        const options = {
            mediaType: 'photo'
        }
        const result = await launchImageLibrary(options)
        if (result.assets) {
            setFoto(result.assets[0].uri.toString());
            return
        }
    }

    const showToast = (message) => {
        ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    }

    const handleUpdateUser = async () => {
        firestore()
            .collection('users').doc(idUserContext)
            .update({
                photo: foto,
                name: name,
                workspace_default: {
                    id_workspace: idWorkspace,
                    name_workspace: nameWorkspace
                }
            })
            .then(() => {
                getPhoto(foto)
                getName(name)
                getWorkspace(idWorkspace)
                showToast('Dados salvos com sucesso')
                changeWorkspace ? Alert.alert('Atenção', 'Por favor, reinicie o aplicativo para aplicar as alterações no seu workspace') : false
                setChangeWorkspace(false)
            })
            .catch(err => console.log(err))

    }


    const pickImageCamera = async () => {
        const options = {
            mediaType: 'photo',
            saveToPhotos: false,
            cameraType: 'front',
            quality: 1
        }
        const result = await launchCamera(options)
        if (result.assets) {
            setFoto(result.assets[0].uri.toString());
            return
        }
    }

    const handleSignOut = () => {
        Alert.alert("Logout", "Tem certeza que deseja deslogar do aplicativo ?", [
            {
                text: 'Cancelar',
                onPress: () => console.log('cancelou'),
                style: 'default'
            },
            {
                text: 'Sair',
                onPress: () => auth().signOut(),
                style: 'default'
            }
        ])
    }

    const handleImageUser = () => {
        Alert.alert("IMAGEM", "Selecione o local em que está a sua foto:", [
            {
                text: 'Galeria',
                onPress: () => pickImageGalery(),
                style: 'default'
            },
            {
                text: 'Câmera',
                onPress: () => pickImageCamera(),
                style: 'default'
            }
        ])
    }


    return (
        <View style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 8, width: '90%' }}>
                <TouchableOpacity
                    onPress={() => {
                        handleImageUser()
                    }}>
                    {
                        foto ?
                            <Image
                                style={{ height: RFValue(200), width: RFValue(200), borderRadius: RFValue(100), borderWidth: RFValue(2), borderColor: '#aaa' }}
                                resizeMode="cover"
                                source={{ uri: foto }}
                            /> : <Image
                                style={{ height: RFValue(175), width: RFValue(175), borderWidth: RFValue(1), borderRadius: RFValue(80), borderColor: '#aaa', borderRadius: RFValue(175) }}
                                resizeMode="contain"
                                source={require('../assets/user.png')}
                            />
                    }

                </TouchableOpacity>

                <TextInput
                    onChangeText={text => {
                        setName(text)
                    }}
                    value={`${name}`}
                    style={styles.txtInput}
                    mode='outlined'
                    label='Nome'
                    placeholder='Ex: Maria da Silva'
                    keyboardType='default'
                    maxLength={20}
                />

                {workspaces !== undefined || null ?
                    <SelectDropdown
                        data={workspaces}
                        onSelect={(selectedItem, index) => {
                            setIdWorkspace(selectedItem.id_workspace)
                            getWorkspace(selectedItem.id_workspace)
                            setNameWorkspace(selectedItem.name_workspace)
                            setChangeWorkspace(true)
                        }}
                        renderCustomizedButtonChild={(selectedItem, index) => {
                            return <Text style={{ color: '#000', paddingLeft: RFValue(15) }} >{selectedItem ? selectedItem.name_workspace : nameWorkspace}</Text>

                        }}
                        buttonTextAfterSelection={selectedItem => selectedItem.name_workspace}
                        rowTextForSelection={item => item.name_workspace}
                        buttonTextStyle={{ textAlign: 'left', fontSize: RFValue(15), color: '#000' }}
                        buttonStyle={{ color: '#000', borderWidth: RFValue(1), alignItems: 'center', width: '100%', backgroundColor: 'white', borderRadius: RFValue(5), height: RFValue(55) }}
                        defaultButtonText={'Selecione o workspace'}

                        dropdownStyle={{ backgroundColor: 'white' }}

                        rowTextStyle={{ backgroundColor: 'white', fontSize: RFValue(15), color: '#000' }}
                        rowStyle={{ backgroundColor: 'white', color: '#000' }}
                        dropdownIconPosition='right'
                        renderDropdownIcon={isOpened => {
                            return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color="#000" size={RFValue(18)} />
                        }}
                    /> : false}


                <TouchableWithoutFeedback onPress={() => {
                    handleUpdateUser()
                }}>
                    <View style={[styles.buttonPause, { marginTop: RFValue(40) }]}>
                        <Text style={styles.buttonPauseText}>Salvar alterações</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={() => handleSignOut()}>
                    <Text style={{ color: '#EA1900', fontSize: RFValue(20) }}>Sair dessa conta</Text>
                </TouchableWithoutFeedback>
            </View>
        </View >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    txtInput: {
        width: '100%',
        marginTop: RFValue(20),
        marginBottom: RFValue(15)
    },
    buttonPause: {
        height: RFValue(50),
        backgroundColor: '#EE5200',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RFValue(15),
        borderWidth: RFValue(2),
        borderColor: '#1d1d2a'
    },
    buttonPauseText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: RFValue(20)
    },
})