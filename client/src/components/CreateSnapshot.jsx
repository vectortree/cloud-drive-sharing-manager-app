import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import api, {createFileSharingSnapshot} from '../api/api';
import {id_generator} from "../functions/id_generator";
import {FileSharingSnapShotData, GroupMembershipSnapshotsData} from "../recoil";
import {useRecoilState} from "recoil";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useContext } from "react";
import { AuthContext } from '../auth/auth';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
export default function ColorRadioButtons(props) {
    const { userProfile, setUserProfile } = useContext(AuthContext);

    const date = new Date();
    let today = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes();
    const [selectedValue, setSelectedValue] = React.useState('fileSnapshot');
    const [snapshotName, setSnapShotName] = React.useState('');
    const [groupName, setGroupName] = React.useState('');
    const [groupEmail,setGroupEmail]= React.useState('');
    const [timestamp, setTimestamp] = React.useState(dayjs(today));
    const [htmlFileData, setHtmlFileData] = React.useState('');
    const [htmlFile, setHtmlFile] = React.useState('');
    const [fileSharingSnapShot,setFileSharingSnapShot ] = useRecoilState(FileSharingSnapShotData);
    const [groupMemberSnapshot, setGroupMemberSnapshot ] = useRecoilState(GroupMembershipSnapshotsData);
    const [open, setOpen] = React.useState(false);
    const handleChange = (event) => {setSelectedValue(event.target.value);};
    const handleSnapshotName = (event) => {setSnapShotName(event.target.value);};
    const handleGroupName = (event) =>{setGroupName(event.target.value);};
    const handleGroupEmail = (event) =>{setGroupEmail(event.target.value);};
    const handleHtmlFile = async (event) =>{
        console.log(event);
        const fileNameArray = event.target.value.split('.');
        if( fileNameArray[fileNameArray.length-1] == "html"){
            let file = await event.target.files[0].text();
            console.log(file);
            setHtmlFileData(file);
        }else{
            alert("Not an HTML File!");
        }
    }
    const handleCreateSnapshot = () => {

        if(selectedValue == 'fileSnapshot'){
            let id =id_generator(props.dataSet.fileSharingSnapshots);
            let obj = {id:id, name: snapshotName};
            api.createFileSharingSnapshot(obj).then((res) => {
                setFileSharingSnapShot(res.data.profile.fileSharingSnapshots);
                setUserProfile(res.data.profile);
                window.location.reload();
            });

            console.log(fileSharingSnapShot);
        }else if(selectedValue == 'groupSnapshot'){
            let id =id_generator(props.dataSet.groupMembershipSnapshots);
            let obj = {
                id: id,
                name: snapshotName,
                groupName : groupName,
                groupAddress:groupEmail,
                timestamp: timestamp,
                htmlFile:htmlFileData
            }

            if( groupName && groupEmail && htmlFileData){
                console.log(obj);

                const groupSnapshot = api.createGroupMembershipSnapshot(obj).then(
                    (value) =>{
                        console.log(value)
                        window.location.reload();
                    }
                ).catch((err) => {
                    if(err.status != 200) {
                        alert(err.response.data.message);
                    }
                })
                setGroupMemberSnapshot((prev) => [...prev,obj])

            }else{
                alert("Please Fill out all the requirement");
                return;
            }
        }else{
            console.error("Wrong Argument");
        }

        if(props.onClick){
            setOpen(true);
        }
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
                    Upload HTML file
                    </Button>
                    {htmlFile.name}
                </label>
                    </>
                :
                ''
                }
            </Box>
            <br></br>
            {open ?
                <>
                    <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={handleCreateSnapshot}>
                        Creating Snapshot...
                    </Button>
                    <CircularProgress style={{display:"hidden"}} />
                </> :
                <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={handleCreateSnapshot}>
                    Submit
                </Button>}
        </div>
    );
}
