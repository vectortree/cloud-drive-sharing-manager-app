import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export default function AuthContextProvider(props) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5001/getuser', { withCredentials: true }).then(res => {
            if(res.data) {
                console.log("Res:")
                console.log(res);
                setUser(res.data);
            }
        })
    }, [axios]);

    return (
        <AuthContext.Provider value={{user, setUser}}>
            {props.children}
        </AuthContext.Provider>
    );
}