import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
// For the showing user information in the user profile page

export default function Profile(props) {
    const [name, setName] = React.useState('Cat in the Hat');
    const handleChange = (event) => {
        setName(event.target.value);
    };

    return (
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '50ps' },
            }}
            noValidate
            autoComplete="off"
        >
            <Avatar
                alt="Remy Sharp"
                src={props.userData.picture}
                sx={{ width: "80px", height: "80px" }}
            />
            <Typography >{props.userData.name}</Typography>
            <Typography>Email: {props.userData.email}</Typography>
            <Typography>Domain: {props.userData.domain}</Typography>
            <Typography>Drive Type: {props.userData.driveType}</Typography>
        </Box>

    );
}
