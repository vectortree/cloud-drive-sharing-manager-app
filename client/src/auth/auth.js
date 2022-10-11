import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';
import api from '../api/api';

export const AuthContext = createContext();

export default function AuthContextProvider(props) {

    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        api.getUser().then((res) => {
            if(res.status === 200) {
                if(res.data) {
                    console.log(res);
                    setUserProfile(res.data);
                }
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{userProfile, setUserProfile}}>
            {props.children}
        </AuthContext.Provider>
    );
}