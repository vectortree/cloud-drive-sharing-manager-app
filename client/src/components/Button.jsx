import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {colors} from "@mui/material";

export default function BasicButtons(props) {
    return (
        <Button variant="contained" style={{backgroundColor:"#666666", marginRight:"10px"}}>{props.name}</Button>
    );
}