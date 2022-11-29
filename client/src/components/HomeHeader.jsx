import * as React from 'react';
import Typography from "@mui/material/Typography";
import MultipleSelectPlaceholder from "./DropDownList";
import SortingDropDown from "./SortingDropDownList";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import BasicModal from "./Modal";
import ColorRadioButtons from "./CreateSnapshot";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useRecoilState} from "recoil";
import {SortingFlag} from "../recoil";
import {applyLocalUpdatesToSnapshot} from "../functions/update-sharing";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function HomeHeader(props) {
    const [sortFlag, setSortFlag] = useRecoilState(SortingFlag);
    const [open, setOpen] = React.useState(false);
    const [action, setAction] = React.useState('');
    const [type, setType] = React.useState('');
    const [role, setRole] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleActionChange = (event) => {
        setAction(event.target.value);
    };
    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };
    const handleTypeChange = (event) => {
        setType(event.target.value);
    };
    const handleEmail = (event)=>{
        setEmail(event.target.value);
    }
    const handleClose = () => {
        setOpen(false);
    };
    const handleUpdate = () =>{
        const mostRecentSnapshot = props.userData.fileSharingSnapshots[props.userData.fileSharingSnapshots.length-1];
        // action : add, remove, unshare
        // type : user,  group, domain, anyone
        // role : writer, reader, commenter
        applyLocalUpdatesToSnapshot(mostRecentSnapshot, mostRecentSnapshot.files, action, type, role, email, props.userData.driveType)  ;
        setOpen(false);
    }
    const handleSortFlag = () => {
        if(sortFlag == 0){
            setSortFlag(1)
        }
        else{
            setSortFlag(0)
        }
    }

    return (
        <>
            <Typography>
                {props.userData.driveType == "microsoft" ? "One":"Google"}Drive &emsp;&emsp;
            <>
            <Button onClick={handleSortFlag} sx = {{fontSize : "20px", fontWeight: "700" , lineHeight: "1.5"}}>
                    Sorting
                    {sortFlag === 0 ? <KeyboardArrowUpIcon sx = {{color : "red"}} ></KeyboardArrowUpIcon> : <KeyboardArrowDownIcon sx = {{color : "blue"}}> </KeyboardArrowDownIcon>}
                </Button>
            </>
            <SortingDropDown userData={props.userData}/>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Update Sharing</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                                        <InputLabel htmlFor="demo-dialog-native">Action</InputLabel>
                                        <Select
                                            native
                                            value={action}
                                            onChange={handleActionChange}
                                            input={<OutlinedInput label="Action" id="demo-dialog-native" />}
                                        >
                                            <option value={"add"}>add</option>
                                            <option value={"remove"}>remove</option>
                                            <option value={"unshare"}>unsharing</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                                        <InputLabel htmlFor="demo-dialog-native">Type</InputLabel>
                                        <Select
                                            native
                                            value={type}
                                            onChange={handleTypeChange}
                                            input={<OutlinedInput label="Type" id="demo-dialog-native" />}
                                        >
                                            <option value={"user"}>user</option>
                                            <option value={"reader"}>reader</option>
                                            <option value={"domain"}>domain</option>
                                            <option value={"anyone"}>anyone</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                                        <InputLabel htmlFor="demo-dialog-native">Role</InputLabel>
                                        <Select
                                            native
                                            value={role}
                                            onChange={handleRoleChange}
                                            input={<OutlinedInput label="Role" id="demo-dialog-native" />}
                                        >
                                            <option value={"writer"}>writer</option>
                                            <option value={"group"}>group</option>
                                            <option value={"commenter"}>commenter</option>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth={100}
                                        required
                                        id="outlined-required"
                                        label="Email"
                                        defaultValue=""
                                        value={email}
                                        onChange={handleEmail}
                                    />
                                </Box>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleUpdate}>UPDATE</Button>
                        </DialogActions>
                    </Dialog>

                <MultipleSelectPlaceholder userData={props.userData} snapshot={props.snapShotData}/>
                <Button variant="outlined" onClick={handleClickOpen} style={{float:"right"}}>
                    Updata Sharing
                </Button>
                <Button onClick={props.handleOpenModal} style={{float: "right"}}>
                    <PhotoCameraIcon style={{ float:"right", marginLeft:"30px", marginRight : "10px" , fontSize: "30px"}}/>
                </Button>
                &emsp;
                <BasicModal open={props.openModal} handleClose={props.handleCloseModal} title={"Create Snapshot"} >
                    <ColorRadioButtons onClick={props.handleCloseModal} dataSet={props.userData}/>
                </BasicModal>
            </Typography>
            <hr/>
        </>
    );
}