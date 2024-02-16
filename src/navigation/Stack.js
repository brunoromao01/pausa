import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import Loading from '../screens/Loading'

const StackNative = createStackNavigator()

export default props => {

    return (
        <StackNative.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Home'} >
            <StackNative.Screen name='Loading' component={Loading} />
            <StackNative.Screen name='Home' component={Home} />
        </StackNative.Navigator>
    )
}

