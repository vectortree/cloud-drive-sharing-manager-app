import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {colors} from "@mui/material";

export default function BasicButtons() {
    return (
        <Stack spacing={1} direction="column" style={{backgroundColor:"white",width:"100px",
            borderRadius: "4px"}}>
            <Button variant="contained" style={{color:"black"}}>Add</Button>
        </Stack>
    );
}