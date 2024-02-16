import React, { useState, useRef } from 'react'
import { Text, View, StyleSheet } from 'react-native'
// import { Stopwatch, Timer } from 'react-native-stopwatch-timer'
import auth from '@react-native-firebase/auth'
import 'moment/locale/pt-br'
import { CountdownCircleTimer, useCountdown } from 'react-native-countdown-circle-timer'
import { RFValue } from 'react-native-responsive-fontsize'


export default ({ data }) => {
    const myPauseRef = useRef(false)
    const criacao = data.created_at
    const dataFim = (criacao / 1000) + data.tempo
    // if (auth().currentUser.email == data.email) {
    //     myPauseRef.current = true
    // } else {
    //     myPauseRef.current = false
    // }

    const [lateUser, setLateUser] = useState(false)

    var atual = new Date().getTime()
    const interval = (dataFim - (atual / 1000))


    return (
        <View style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center', marginLeft: RFValue(10) }}>
            <CountdownCircleTimer
                strokeWidth={myPauseRef.current ? 5 : 2}
                size={90}
                isPlaying
                duration={interval}
                colors={['#00EA25', '#F7B801', '#EA1900', '#A30000', '#A30000']}
                colorsTime={[interval, interval / 2, interval / 5, interval / 10, 0]}
                onUpdate={(remainingTime) => {
                    if (remainingTime == 0)
                        setLateUser(true)
                }}
            >
                {({ remainingTime }) => {
                    const hours = Math.floor(remainingTime / 3600)
                    const minutes = Math.floor((remainingTime % 3600) / 60)
                    const seconds = remainingTime % 60
                    return <>

                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: remainingTime == 0 ? 'red' : 'black' }}>{hours > 0 ? `${hours < 10 ? `0${hours}` : hours}:` : false}{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>
                        <Text adjustsFontSizeToFit style={{ fontSize: 12, textAlign: 'center', color: 'black' }}>{data.tipo}</Text>
                    </>
                }}
            </CountdownCircleTimer>
            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: lateUser ? 'red' : 'black', fontWeight: myPauseRef.current ? 'bold' : 'normal' }}>{data.name}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        marginTop: 10,

    }
})
