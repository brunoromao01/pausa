import React, { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { Text, View, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions, Image, FlatList, Button } from 'react-native'
import { TextInput } from 'react-native-paper'
import SelectDropdown from 'react-native-select-dropdown'
import CardUser from '../components/CardUser'
import CardPause from '../components/CardPause'
const { height, width } = Dimensions.get('window')
import { LogBox } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { CountdownCircleTimer, useCountdown } from 'react-native-countdown-circle-timer'
import { RFValue } from 'react-native-responsive-fontsize'
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../context/UserContext'
import auth from '@react-native-firebase/auth'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
LogBox.ignoreAllLogs()

export default props => {
    const [showModal, setShowModal] = useState(false)
    const [pauseType, setPauseType] = useState('')
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [userList, setUserList] = useState([])
    const [user, setUser] = useState({})
    const [idWorkspace, setIdWorkspace] = useState('')
    const [activePause, setActivePause] = useState(false)
    const types = ['Break', 'Ocupado', 'Refeição', 'Resolvendo chamado', 'Reunião', 'Treinamento']
    const { emailContext, nameContext, workspaceContext, idUserContext, idPauseOpened, getIdPause, getName, getEmail, getId, getPhoto, getWorkspace } = useContext(UserContext)
    const refMinutes = useRef()
    const [emptyPauseEmpty, setEmptyPauseEmpty] = useState(false)
    const navigation = useNavigation()


    useFocusEffect(useCallback(() => {
        const subscribe = firestore()
            .collection('pausas')
            .where('id_workspace', '==', workspaceContext)
            .onSnapshot(querySnapShot => {
                const data = querySnapShot.docs.map(doc => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    }
                })
                var myPaused = data.filter(item => item.email == auth().currentUser.email && item.status == 'open');
                let arrayOrdenadoCrescente = data.sort((a, b) => ((b.tempo * 1000) + b.created_at) - ((a.tempo * 1000) + a.created_at))
                // const newArray = arrayOrdenadoCrescente.filter(item => item.status == 'open');
                const newArray = arrayOrdenadoCrescente.filter(item => item.email != auth().currentUser.email && item.status == 'open');
                const arrayFormatted = organizarArray(newArray)
                setUserList(arrayFormatted)
                if (myPaused.length >= 1) {
                    setActivePause(true)
                }
                setUser(myPaused[0])
            })

        return () => subscribe()
    }, []))

    function organizarArray(originalArray) {
        var novoArray = [];
        for (var i = 0; i < originalArray.length; i += 3) {
            var pedacoArray = originalArray.slice(i, i + 3);
            novoArray.push(pedacoArray);
        }
        return novoArray;
    }

    const handleStartPause = () => {
        setHours(0)
        setMinutes(0)
        setShowModal(true)
    }

    const handleStopPause = async () => {
        firestore()
            .collection('pausas').doc(idPauseOpened)
            .update('status', 'closed')
            .then(doc => console.log('pausa fechada'))
            .catch(err => console.log('handleStopPause erro: ' + err))
        setActivePause(false)
    }

    const handleNewPause = async (user) => {
        const criacao = user.created_at
        const dataFim = (criacao / 1000) + user.tempo
        var atual = new Date().getTime()
        const interval = (dataFim - (atual / 1000))
        setUser({
            interval: interval,
            nome: user.nome,
            tipo: user.tipo,
            email: emailContext
        })
        await firestore()
            .collection('pausas')
            .add(user)
            .then(doc => {
                firestore()
                    .collection('users').doc(idUserContext)
                    .update('id_pause', doc._documentPath._parts[1])
                    .then(() => getIdPause(doc._documentPath._parts[1]))
            })
            .catch(err => console.log(err))

    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ marginHorizontal: 0, flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                {item.map((subItem, index) => (
                    <CardUser data={subItem} />
                ))}
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                {workspaceContext == '' ?
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <Text style={{ fontSize: RFValue(25), textAlign: 'center', color: 'black' }}>Você não está em nenhum workspace no momento.</Text>
                        <TouchableWithoutFeedback onPress={() => {
                            navigation.navigate('Workspace')
                        }}>

                            <View style={[styles.buttonPause, { marginTop: RFValue(15) }]}>
                                <Text style={styles.buttonPauseText}>{'Participar de um workspace'}</Text>
                            </View>


                        </TouchableWithoutFeedback>
                    </View>
                    : false}

                <FlatList
                    horizontal={false}
                    data={userList}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
             
                {
                    user != undefined || user != null ?
                        <CardPause data={user} />
                        : false
                }



            </View>

            {workspaceContext !== '' ?
                <View style={styles.footer}>

                    <TouchableWithoutFeedback onPress={() => {
                        if (activePause) {
                            handleStopPause()
                        } else {
                            handleStartPause()
                        }
                    }}>

                        <View style={styles.buttonPause}>
                            <Text style={styles.buttonPauseText}>{activePause ? 'Despausar' : 'Pausar'}</Text>
                        </View>


                    </TouchableWithoutFeedback>

                </View>
                : false}

            <Modal
                visible={showModal}
                transparent
                onRequestClose={() => setShowModal(false)}
                animationType='slide'
            >
                <View style={styles.viewModal}>
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={styles.viewTopModal} />
                    </TouchableWithoutFeedback>

                    <View style={styles.viewBottomModal}>
                        <SelectDropdown
                            data={types}
                            onSelect={(selectedItem, index) => {
                                if (selectedItem == 'Break') {
                                    setHours(0)
                                    setMinutes(15)
                                } else if (selectedItem == 'Ocupado') {
                                    setHours(0)
                                    setMinutes(3)
                                } else if (selectedItem == 'Refeição') {
                                    setMinutes(30)
                                    setHours(1)
                                } else if (selectedItem == 'Resolvendo chamado') {
                                    setHours(0)
                                    setMinutes(20)
                                } else if (selectedItem == 'Reunião' || selectedItem == 'Treinamento') {
                                    setHours(1)
                                    setMinutes(0)
                                }
                                setEmptyPauseEmpty(false)
                                setPauseType(selectedItem)
                            }}
                            renderCustomizedButtonChild={(selectedItem, index) => {
                                return <Text style={{ color: '#000', paddingLeft: RFValue(15) }} >{selectedItem ? selectedItem : 'Selecione o tipo de pausa'}</Text>
                            }}
                            buttonTextAfterSelection={selectedItem => selectedItem.name}
                            rowTextForSelection={item => item}
                            buttonTextStyle={{ textAlign: 'left', fontSize: RFValue(15), color: '#000' }}
                            buttonStyle={{ color: '#000', borderWidth: RFValue(1), alignItems: 'center', width: '100%', backgroundColor: 'white', borderRadius: RFValue(5), height: RFValue(50) }}
                            defaultButtonText={'Selecione o tipo de pausa'}

                            dropdownStyle={{ backgroundColor: 'white' }}

                            rowTextStyle={{ backgroundColor: 'white', fontSize: RFValue(15), color: '#000' }}
                            rowStyle={{ backgroundColor: 'white', color: '#000' }}
                            dropdownIconPosition='right'
                            renderDropdownIcon={isOpened => {
                                return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color="#000" size={RFValue(18)} />
                            }}
                        />
                        {emptyPauseEmpty ?
                            <Text style={{ color: '#999' }}>*Marque o tipo de pausa primeiro</Text> : false
                        }

                        <View style={{ flexDirection: 'row', width: '100%', marginTop: RFValue(25), }}>
                            <TextInput
                                onChangeText={text => {
                                    if (text.includes('-')) return
                                    if (text.includes(',')) return
                                    if (text.includes('.')) return
                                    if (text.includes('_')) return
                                    setHours(text)
                                }}
                                value={`${hours}`}
                                style={styles.textInput}
                                mode='outlined'
                                label='Horas'
                                placeholder='Ex: 1'
                                keyboardType='number-pad'
                                maxLength={1}
                            />
                            <View style={styles.viewButtonsClock}>
                                <TouchableWithoutFeedback onPress={() => setHours(hours + 1)}>
                                    <View style={styles.buttonChangeTime}>
                                        <Image source={require('../assets/up.png')} style={styles.imgArrow} />
                                    </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={() => {
                                    if (hours == 0) return
                                    setHours(hours - 1)
                                }}>
                                    <View style={styles.buttonChangeTime}>
                                        <Image source={require('../assets/down.png')} style={styles.imgArrow} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ width: '14%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: RFValue(25), fontWeight: '800', color: 'black' }}>:</Text>
                            </View>
                            <TextInput
                                ref={refMinutes}
                                onChangeText={text => {
                                    if (text.includes('-')) return
                                    if (text.includes(',')) return
                                    if (text.includes('.')) return
                                    if (text.includes('_')) return
                                    setMinutes(text)
                                }}
                                value={`${minutes}`}
                                style={styles.textInput}
                                mode='outlined'
                                label='Minutos'
                                placeholder='Ex: 30'
                                keyboardType='number-pad'
                                maxLength={2}

                            />
                            <View style={styles.viewButtonsClock}>
                                <TouchableWithoutFeedback onPress={() => setMinutes(minutes + 1)}>
                                    <View style={styles.buttonChangeTime}>
                                        <Image source={require('../assets/up.png')} style={styles.imgArrow} />
                                    </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={() => {
                                    if (minutes == 0) return
                                    setMinutes(minutes - 1)
                                }}>
                                    <View style={styles.buttonChangeTime}>
                                        <Image source={require('../assets/down.png')} style={styles.imgArrow} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <TouchableWithoutFeedback onPress={() => {
                            if (pauseType == '') {
                                setEmptyPauseEmpty(true)
                                return
                            } else if (Number(minutes) == 0 && Number(hours) == 0) {
                                refMinutes.current.focus()
                                return
                            }
                            setShowModal(false)
                            var newPause = {
                                name: nameContext,
                                tempo: (Number(hours) * 3600) + (Number(minutes) * 60),
                                tipo: pauseType,
                                email: auth().currentUser.email,
                                status: 'open',
                                created_at: new Date().getTime(),
                                id_workspace: workspaceContext
                            }
                            handleNewPause(newPause)
                            setActivePause(true)
                        }}>
                            <View style={[styles.buttonPause, { marginTop: RFValue(30) }]}>
                                <Text style={styles.buttonPauseText}>Confirmar pausa</Text>
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </View>

            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    imgArrow: {
        width: RFValue(10),
        height: RFValue(10)
    },
    buttonChangeTime: {
        width: RFValue(20),
        height: RFValue(20),
        borderRadius: RFValue(10),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: RFValue(1),
        borderColor: 'black'

    },
    viewButtonsClock: {
        width: '7%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',

    },
    viewBottomModal: {
        flex: 1,
        backgroundColor: '#eee',
        height: '100%',
        width: '100%',
        borderTopRightRadius: RFValue(30),
        borderTopLeftRadius: RFValue(30),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: RFValue(15)

    },
    viewTopModal: {
        flex: 1,
        height: '100%',
        width: '100%',
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },
    buttonPause: {
        height: RFValue(50),
        backgroundColor: '#EE5200',
        width: '80%',
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
    footer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    body: {
        flex: 7,
        width: '90%',
        alignItems: 'center',
    },
    textInput: {
        width: '36%',
    }
})
