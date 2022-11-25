import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {colors} from "@mui/material";
import { useContext } from 'react';
import { AuthContext } from '../auth/auth';
import api from '../api/api';

export default function BasicButtons(props) {
    const clickModalButton = (e) => {
        console.log(props.name)
        if (props.name == "Add"){
            props.isModalReqAddClicked(true);
        }
    }

    return (
        <Button variant="contained" onClick = {clickModalButton} style={{backgroundColor:"#666666", marginRight:"10px", "margin-top" : "70%", "margin-bottom" : "100%"}}>{props.name}</Button>
    );
}