import { useContext, useEffect } from 'react';
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/Home';
import Stack from './Stack';
import User from '../screens/User';
import Loading from '../screens/Loading';
import Workspace from '../screens/Workspace';
import FontIsto from 'react-native-vector-icons/Fontisto'
import Feather from 'react-native-vector-icons/Feather'
import { UserContext } from '../context/UserContext'
const Drawer = createDrawerNavigator();

export default props => {

    return (
        <Drawer.Navigator initialRouteName='Workspace' screenOptions={{
            headerShown: true
        }}>
            <Drawer.Screen name="Stack" component={Stack} options={{
                title: 'Menu de pausas',
                drawerIcon: ({ focused, size, color }) => (
                    <FontIsto name='clock' color={color} size={20} />
                ),
            }} />
            <Drawer.Screen name="User" component={User} options={{
                title: 'Dados de usuário',
                drawerIcon: ({ focused, size, color }) => (
                    <Feather name='user' color={color} size={20} />
                ),
            }} />
            <Drawer.Screen name="Workspace" component={Workspace} options={{
                title: 'Workspace',
                drawerIcon: ({ focused, size, color }) => (
                    <Feather name='codesandbox' color={color} size={20} />
                ),
            }} />
        </Drawer.Navigator>
    );
}