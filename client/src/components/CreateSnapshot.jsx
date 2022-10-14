import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function ColorRadioButtons() {
    const [selectedValue, setSelectedValue] = React.useState('a');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const controlProps = (item) => ({
        checked: selectedValue === item,
        onChange: handleChange,
        value: item,
        name: 'color-radio-button-demo',
        inputProps: { 'aria-label': item },
    });

    return (
        <div>
            <h3>Snapshot Type</h3>
            <div>
            <Radio {...controlProps('c')} color="success" />
                Take file sharing snapshot
            </div>
            <div>
            <Radio
                {...controlProps('e')}
                sx={{
                    color: pink[800],
                    '&.Mui-checked': {
                        color: pink[600],
                    },
                }}
            />
                Take group membership snapshot
            </div>
            <h3>Snapshot Information</h3>

            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <TextField
                        required
                        id="outlined-required"
                        label="Snapshot Name"
                        defaultValue=""
                    />
                </div>
                <div>
                    <TextField
                        required
                        id="outlined-required"
                        label="Group"
                        defaultValue=""
                    />
                </div>
            </Box>
            <Button variant="contained" color="success" style={{marginLeft:"10px"}}>
                Submit
            </Button>
        </div>
    );
}
