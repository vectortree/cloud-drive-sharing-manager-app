import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useContext } from 'react';
import { AuthContext } from '../auth/auth';
import api, {createFileSharingSnapshot} from '../api/api';
import {id_generator} from "../functions/id_generator";
import {FileSharingSnapShotData} from "../recoil";
import {useRecoilState} from "recoil";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ColorRadioButtons(props) {
    const [selectedValue, setSelectedValue] = React.useState('a');
    const [FileSharingSnapShot, setFileSharingSnapShotData] = useRecoilState(FileSharingSnapShotData);
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleCreateFileSnapshot = () => {
        let id =id_generator(props.dataSet.fileSharingSnapshots);
        console.log(props.dataSet.fileSharingSnapshots);
        let obj = {id:id};
        api.createFileSharingSnapshot(obj);
        if(props.onClick) props.onClick()
    }

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

                {selectedValue === "e" ? 
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    disableFuture
                    label="Timestamp"
                    views={['year', 'month', 'day']}
                    onChange={(newValue) => {
                        // setValue(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
                </LocalizationProvider>
                : ''
                 }
                <br></br>
                {selectedValue === "e" ? 
                <label htmlFor="upload-html">
                    <input
                        style={{ display: 'none' }}
                        id="upload-html"
                        name="upload-html"
                        type="file"
                    />
                    <Button color="success" variant="contained" component="span">
                    Upload html
                    </Button>
                </label>
                :
                ''
                }
            </Box>
            <br></br>
            <br></br>
            <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={handleCreateFileSnapshot}>
                Submit
            </Button>
        </div>
    );
}
