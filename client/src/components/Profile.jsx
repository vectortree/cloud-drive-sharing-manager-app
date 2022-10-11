import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";

const email = "sije.park@stonybrook.edu"

export default function Profile() {
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
                src="/logo192.png"
                sx={{ width: "80px", height: "80px" }}
            />
            <TextField
                id="outlined-name"
                label="Name"
                value={name}
                onChange={handleChange}
                size="small"
            />
            <Typography>Email: {email}</Typography>
        </Box>

    );
}
