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
import {GroupMembershipSnapshotsData, rawFileData, SortingFlag} from "../recoil";
import {applyLocalUpdatesToSnapshot} from "../functions/update-sharing";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ViolationModalTable from "./ViolationModal";
import api from "../api/api";
import {getClosestGMSnapshots} from "../functions/gm-snapshots";
import {checkRequirements} from "../functions/ac-requirements";
import CircularProgress from "@mui/material/CircularProgress";

export default function HomeHeader(props) {
    const [sortFlag, setSortFlag] = useRecoilState(SortingFlag);
    const [open, setOpen] = React.useState(false);
    const [action, setAction] = React.useState('add');
    const [type, setType] = React.useState(props.userData.driveType === 'microsoft' ? 'users' : 'user');
    const [role, setRole] = React.useState(props.userData.driveType === 'microsoft' ? 'read' : 'reader');
    const [email, setEmail] = React.useState('');
    const [rawFile, setRawFile] = useRecoilState(rawFileData);
    const [openModal, setOpenModal] = React.useState(false);
    const [selectionModel, setSelectionModel] = React.useState([]);
    const [fileData,setFileData] = React.useState("");
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [openProgress, setOpenProgress] = React.useState(false);
    const handleCloseModal = () => setOpenModal(false);
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
        setOpenProgress(true);
        let snapshot = props.userData.fileSharingSnapshots;
        let mostRecentSnapshot = snapshot[snapshot.length-1];
        console.log(mostRecentSnapshot);

        let newArray = [];
        console.log(rawFile);
        for(let i = 0; i < rawFile.length; i++){
            newArray.push(rawFile[i]);
        }
        let fileData=[];
        let unshareError = false;
        if(action === "unshare") {
            for(const f of newArray) {
                if((props.userData.driveType === "google" && f.driveName !== "MyDrive") || (props.userData.driveType === "microsoft" && f.driveName !== "OneDrive")) {
                    unshareError = true;
                }
            }
        }
        if(unshareError) {
            if(props.userData.driveType === "google") alert("Error: Only files in drive \"MyDrive\" can be unshared!");
            else alert("Error: Only files in drive \"OneDrive\" can be unshared!");
        }
        else {
            api.checkSnapshotConsistency().then((res) =>{
                if(res.status== 200){
                    if(res.data.success){
                        console.log(mostRecentSnapshot);
                        fileData = applyLocalUpdatesToSnapshot(mostRecentSnapshot, newArray, action, type, role, email, props.userData.driveType);
                        console.log('applied local updates');
                        console.log(fileData);
                        let closestGMSnapShotsData = getClosestGMSnapshots(GroupSharing, fileData);
                        let checkRequirement = checkRequirements(fileData, closestGMSnapShotsData, props.userData.accessControlRequirements, props.userData.email, props.userData.domain, props.userData.driveType );
                        console.log('done checking requirements');
                        if(checkRequirement.length > 0){
                            alert("Requirement Violation");
                        }else{
                            console.log('updating...');
                            let apiRole = props.userData.driveType === "microsoft" && type !== "users" ? (role === "read" ? "view" : "edit") : role;
                            console.log({files: newArray, type: type, role: apiRole, value: email});
                            if(action == "add"){
                                api.addPermission({files: newArray, type: type, role: apiRole, value: email}).then((res) =>{
                                    console.log(res.data.profile);
                                    setOpen(false);
                                }).catch((err) => {
                                    console.log(err);
                                    setOpen(false);
                                    alert("Error: Could not successfully update permission!");
                                });
                            }else if(action =="remove"){
                                api.removePermission({files: newArray, type: type, role: apiRole, value: email}).then((res) =>{
                                    console.log(res.data.profile);
                                    setOpen(false);
                                }).catch((err) => {
                                    console.log(err);
                                    setOpen(false);
                                    alert("Error: Could not successfully update permission!");
                                });
                            }else if(action == "unshare"){
                                api.unshareFiles({files: newArray} ).then((res) =>{
                                    console.log(res.data.profile);
                                    setOpen(false);
                                }).catch((err) => {
                                    console.log(err);
                                    setOpen(false);
                                    alert("Error: Could not successfully update permission!");
                                });
                            }
                            setFileData(fileData);
                            console.log(checkRequirement);
                        }
                    }else{
                        setOpen(false);
                        alert(res.data.message);
                    }
                }
            })
        }
    }
    const handleSortFlag = () => {
        if(sortFlag == 0){
            setSortFlag(1)
        }
        else{
            setSortFlag(0)
        }
    }
    const acr_for_violation ={ACR_data: props.userData.accessControlRequirements, userData:props.userData, size:700}

    return (
        <>
            <Typography>
                {props.userData.driveType == "microsoft" ? "Microsoft OneDrive" : "Google Drive" } &emsp;&emsp;
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
                                            <option value={"unshare"}>unshare</option>
                                        </Select>
                                    </FormControl>
                                    {action == "unshare" ? <></>:
                                        <>
                                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                                            <InputLabel htmlFor="demo-dialog-native">Type</InputLabel>
                                            <Select
                                                native
                                                value={type}
                                                onChange={handleTypeChange}
                                                input={<OutlinedInput label="Type" id="demo-dialog-native" />}
                                            >
                                                {props.userData.driveType === "microsoft" ? 
                                                <>
                                                    <option value={"users"}>users</option>
                                                    <option value={"organization"}>organization</option>
                                                    <option value={"anonymous"}>anonymous</option>
                                                </>
                                                :
                                                <>
                                                    <option value={"user"}>user</option>
                                                    <option value={"group"}>group</option>
                                                    <option value={"domain"}>domain</option>
                                                    <option value={"anyone"}>anyone</option>
                                                </>
                                                }
                                                
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
                                            {props.userData.driveType === "microsoft" ? 
                                            <>
                                                <option value={"read"}>read</option>
                                                <option value={"write"}>write</option>
                                            </>
                                            :
                                            <>
                                                <option value={"reader"}>reader</option>
                                                <option value={"writer"}>writer</option>
                                                <option value={"commenter"}>commenter</option>
                                            </>
                                            }
                                        </Select>
                                        </FormControl>
                                        <TextField
                                        fullWidth={100}
                                        disabled={(props.userData.driveType === "microsoft" && type !== "users") || (props.userData.driveType === "google" && type === "anyone")}
                                        id="outlined-required"
                                        label={((type === "user" || type === "group" || type === "users") ? "Email" : (type === "domain" || type === "organization") ? "Domain" : "N/A")}
                                        defaultValue=""
                                        value={email}
                                        onChange={handleEmail}
                                        />
                                        </>
                                    }
                                </Box>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleUpdate}>UPDATE</Button>
                            {openProgress?<CircularProgress style={{display:"hidden"}} />
                                :""
                            }
                        </DialogActions>
                    </Dialog>
                <BasicModal open={openModal} handleClose={handleCloseModal} title={"Violation Report"} ><ViolationModalTable handleClose={handleCloseModal} components = {acr_for_violation} type="SearchQuery" fileSet={fileData}selectionModel = {selectionModel}/></BasicModal>
                <MultipleSelectPlaceholder userData={props.userData} snapshot={props.snapShotData}/>
                {props.updateAllow ?
                    <Button variant="outlined" onClick={handleClickOpen} style={{float:"right"}}>
                        Update Sharing
                    </Button>:""
                }
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