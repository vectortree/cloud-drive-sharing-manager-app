import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';
import api from '../api/api';

export const AuthContext = createContext();

export default function AuthContextProvider(props) {

    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        api.getUserProfile().then((res) => {
            if(res.status === 200) {
                if(res.data.profile) {
                    console.log(res);
                    setUserProfile(res.data.profile);
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