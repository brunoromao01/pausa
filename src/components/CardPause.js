import React, { useContext, useState } from 'react'
import { Text, View, StyleSheet, Dimensions, Image } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { CountdownCircleTimer, useCountdown } from 'react-native-countdown-circle-timer'
import { UserContext } from '../context/UserContext'
const { height, width } = Dimensions.get('window')

export default props => {
    const { emailContext, nameContext, photoContext, workspaceContext } = useContext(UserContext)
    const criacao = props.data.created_at
    const dataFim = (criacao / 1000) + props.data.tempo
    var atual = new Date().getTime()
    const interval = (dataFim - (atual / 1000))

    const user = {
        interval: interval,
        nome: props.data.nome,
        tipo: props.data.tipo,
        email: emailContext
    }

    const [breakWithLate, setBreakWithLate] = useState(false)

    

    return (
        <View style={{ borderWidth: RFValue(2), borderColor: breakWithLate ? '#EA1900' : '#aaa', borderRadius: RFValue(20), width: '100%', height: RFValue(height * 0.19), marginBottom: RFValue(20), flexDirection: 'row', backgroundColor: '#eee' }}>
            {/* backgroundColor: '#1d1d2a' */}
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                {
                    photoContext ?
                        <Image
                            style={{ height: RFValue(90), width: RFValue(90), borderRadius: RFValue(45), borderWidth: RFValue(2), borderColor: '#aaa' }}
                            resizeMode="cover"
                            source={{ uri: photoContext }}
                        /> :
                        <Image
                            style={{ height: RFValue(80), width: RFValue(80), borderWidth: RFValue(1), borderRadius: RFValue(40), borderColor: '#aaa' }}
                            resizeMode="contain"
                            source={require('../assets/user.png')}
                        />
                }
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: RFValue(15), fontWeight: 'regular', color: '#000' }}>{nameContext ? nameContext : user.nome}</Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, }}>
                <CountdownCircleTimer
                    strokeWidth={RFValue(4)}
                    size={RFValue(height * 0.17)}
                    isPlaying
                    duration={user.interval}
                    colors={['#00EA25', '#F7B801', '#EA1900', '#A30000', '#A30000']}
                    colorsTime={[user.interval, user.interval / 2, user.interval / 5, user.interval / 10, 0]}
                    onUpdate={(remainingTime) => {
                        if (remainingTime == 0) setBreakWithLate(true)

                    }}
                >
                    {({ remainingTime }) => {
                        const hours = Math.floor(remainingTime / 3600)
                        const minutes = Math.floor((remainingTime % 3600) / 60)
                        const seconds = remainingTime % 60
                        return <>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: remainingTime == 0 ? 'red' : 'black' }}>{hours > 0 ? `${hours < 10 ? `0${hours}` : hours}:` : false}{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>
                            <Text style={{ fontSize: RFValue(15), fontWeight: '400', color: '#000', textAlign: 'center' }}>{user.tipo}</Text>
                        </>
                    }}
                </CountdownCircleTimer>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        height: RFValue(height * 0.19),
        justifyContent: 'center',
        alignItems: 'center',
    }
})