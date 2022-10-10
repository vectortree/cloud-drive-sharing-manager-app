import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {colors} from "@mui/material";

export default function BasicButtons(props) {
    return (
        <Button variant="contained" style={{backgroundColor:"#666666", marginRight:"10px", "margin-top" : "70%", "margin-bottom" : "100%"}}>{props.name}</Button>
    );
}