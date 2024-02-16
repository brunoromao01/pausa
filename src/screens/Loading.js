import { useNavigation, CommonActions } from "@react-navigation/native";
import { useEffect, useRef } from "react"
import { ActivityIndicator, Button, View } from "react-native"

export default props => {
    const navigation = useNavigation();
    const buttonRef = useRef(null)

    useEffect(() => {
        const getInfoUser = async () => {
            const e = auth().currentUser
            const users = await firestore().collection('users').get();
            const user = users._docs.filter(user => user._data.email == e.email)
            getName(user[0]._data.name)
            getEmail(user[0]._data.email)
            getId(user[0]._ref._documentPath._parts[1])
            getPhoto(user[0]._data.photo)
            getWorkspaces(user[0]._data.workspaces)
            // buttonRef.current
        }
        getInfoUser()
     
    }, [])



    return (
        <View
            style={{
                // backgroundColor: 'black',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1
            }} >
            <ActivityIndicator size={'large'} />
            {/* <Button ref={buttonRef} disabled color={'transparent'} title="press" onPress={() => navigation.navigate('Home')} /> */}
        </View>
    )
}
