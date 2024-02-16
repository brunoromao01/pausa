import React, { useEffect, useState, useContext } from 'react'
import { Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import Drawer from './navigation/Drawer'
import Login from './screens/Login'
import { UserContext } from './context/UserContext'
import 'react-native-gesture-handler'
import UserProvider from './context/UserContext'

export default props => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)


    useEffect(() => {

        const subscriber = auth().onAuthStateChanged(setUser)
        return subscriber
    }, [])




    return (

        <View style={{ flex: 1 }}>
            <NavigationContainer>
                <UserProvider>
                    {user ? <Drawer /> : <Login />}
                </UserProvider>
            </NavigationContainer>
        </View>
    )
}

