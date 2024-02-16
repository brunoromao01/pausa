import React, { createContext, useState } from 'react'

export const UserContext = createContext({})

function UserProvider({ children }) {
    const [emailContext, setEmailContext] = useState('');
    const [nameContext, setNameContext] = useState('');
    const [idUserContext, setIdUserContext] = useState('');
    const [photoContext, setPhotoContext] = useState('');
    const [workspaceContext, setWorkspaceContext] = useState('');
    const [idPauseOpened, setIdPauseOpened] = useState('');


    function getEmail(email) {
        setEmailContext(email)
    }

    function getPhoto(photo) {
        setPhotoContext(photo)
    }

    function getName(name) {
        setNameContext(name)
    }

    function getId(id) {
        setIdUserContext(id)
    }

    function getWorkspace(workspace) {
        setWorkspaceContext(workspace)
    }

    function getIdPause(id) {
        setIdPauseOpened(id)
    }



    return (
        <UserContext.Provider value={{ nameContext, emailContext, photoContext, idUserContext, workspaceContext, idPauseOpened, getName, getPhoto, getEmail, getId, getWorkspace, getIdPause }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;

