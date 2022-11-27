import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Stack from '@mui/material/Stack';
import { useContext } from 'react';
import { AuthContext } from '../auth/auth';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api, {createFileSharingSnapshot} from '../api/api';
import {id_generator} from "../functions/id_generator";
import {FileSharingSnapShotData} from "../recoil";
import {useRecoilState} from "recoil";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
export default function ColorRadioButtons(props) {
    const date = new Date();
    let today = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes();
    const [selectedValue, setSelectedValue] = React.useState('fileSnapshot');
    const [snapshotName, setSnapShotName] = React.useState('');
    const [groupName, setGroupName] = React.useState('');
    const [groupEmail,setGroupEmail]= React.useState('');
    const [timestamp, setTimestamp] = React.useState(dayjs(today));
    const [htmlFileData, setHtmlFile] = React.useState('');
    const handleChange = (event) => {setSelectedValue(event.target.value);};
    const handleSnapshotName = (event) => {setSnapShotName(event.target.value);};
    const handleGroupName = (event) =>{setGroupName(event.target.value);};
    const handleGroupEmail = (event) =>{setGroupEmail(event.target.value);};
    const handleHtmlFile = (event) =>{
        console.log(event);
        const fileNameArray = event.target.value.split('.');
        if( fileNameArray[fileNameArray.length-1] == "html"){
            setHtmlFile(event.target.files[0]);
        }else{
            alert("Wrong File");
        }
    }
    const handleCreateSnapshot = () => {
        let id =id_generator(props.dataSet.fileSharingSnapshots);
        let obj = {id:id, name: snapshotName};
        if(selectedValue == 'fileSnapshot'){
            api.createFileSharingSnapshot(obj);
        }else if(selectedValue == 'groupSnapshot'){
            console.log(htmlFileData);
            obj = {id: id, name: snapshotName, groupName : groupName, groupAddress:groupEmail, timestamp: timestamp, htmlFile:JSON.stringify(htmlFileData)}
            if(id && groupName && groupEmail && htmlFileData){
                console.log(obj);
                api.createGroupMembershipSnapshot(obj);
            }else{
                alert("Please Fill out all the requirement");
                return;
            }
        }else{
            console.error("Wrong Argument");
        }

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
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="female"
                name="radio-buttons-group"
            >
                <FormControlLabel value="snapshot" control={<Radio {...controlProps('fileSnapshot')} color="success"/>} label="Take file sharing snapshot" />
                {props.dataSet.driveType == "google" ?
                <FormControlLabel value="groupSnapshot" control={<Radio
                    {...controlProps('groupSnapshot')}
                    sx={{
                        color: pink[800],
                        '&.Mui-checked': {
                            color: pink[600],
                        },
                    }}/>} label="Take group membership snapshot" >
                </FormControlLabel>
                    : ""}
            </RadioGroup>

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
                        id="outlined-required"
                        label="Snapshot Name (Optional)"
                        defaultValue="snapshotName"
                        value={snapshotName}
                        onChange={handleSnapshotName}
                    />
                </div>

                {selectedValue === "groupSnapshot" ?
                    <>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Group Name"
                        defaultValue= {groupName}
                        value={groupName}
                        onChange={handleGroupName}
                    />
                    <TextField
                        required
                        id="outlined-required"
                        label="Group Email"
                        defaultValue= {groupEmail}
                        value={groupEmail}
                        onChange={handleGroupEmail}
                    />
                        <Stack spacing={3}>
                            <DateTimePicker
                                renderInput={(params) => <TextField {...params} />}
                                label="Ignore date and time"
                                value={timestamp}
                                onChange={(newValue) => {
                                    setTimestamp(newValue);
                                }}
                                maxDateTime={dayjs(today)}
                            />
                        </Stack>
                </LocalizationProvider>

                <br></br>
                <label htmlFor="upload-html">
                    <input
                        style={{ display: 'none' }}
                        id="upload-html"
                        name="upload-html"
                        type="file"
                        onChange={handleHtmlFile}
                    />
                    <Button color="success" variant="contained" component="span">
                    Upload html
                    </Button>
                    {htmlFileData.name}
                </label>
                    </>
                :
                ''
                }
            </Box>
            <br></br>
            <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={handleCreateSnapshot}>
                Submit
            </Button>
        </div>
    );
}
