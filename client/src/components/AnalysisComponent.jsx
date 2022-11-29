import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import {deviantSharing, fileFolderSharingChanges, snapshotsSharingChanges} from "../functions/sharing-analysis";
import {useRecoilState} from "recoil";
import {selectedSnapshot} from "../recoil";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';



import Select from '@mui/material/Select';
import {makeFilesForDisplay} from "../functions/snapshot-files";
import DeviantSharingDataGrid from "./AnalysisComponents/DeviantSharingDataGrid";
import SharingChangesDataGrid from "./AnalysisComponents/SharingChangesDataGrid";
import FileFolderSharingDifferenceDataGrid from "./AnalysisComponents/FileFolderSharingDifferenceDataGrid";
import {useEffect} from "react";

export default function AnalysisComponent(props) {
    const [ threshold,setThreshold ] = React.useState(0);
    const [ driveName,setDriveName ] = React.useState(null);
    const [ drivePath,setDrivePath ] = React.useState(null);
    const [ compSnapshot, setcompSnapshot] = React.useState();
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);

    const [fileData, setFileData] = React.useState([]);
    useEffect(() => {
        setFileData([]);
    },[])
    const handleThreshold = (event) =>{
        setThreshold(event.target.value);
    }

    const handleClick = () =>{
        if(props.text === "Deviant Sharing" && threshold <= 50 || threshold > 100){
            alert("Threshold should be greater than 50% and smaller than 100%");
        } else if(props.text === "Deviant Sharing" && threshold > 50 ){
            let deviantSharingData = deviantSharing(selSnapshot.data, driveName, drivePath, threshold / 100, props.userData.driveType)
            console.log(deviantSharingData);
            setFileData(deviantSharingData);
            if(deviantSharingData.length != 0){
                const refinedData = makeFilesForDisplay(deviantSharingData.data,deviantSharingData.data,props.userData.driveType);
                console.log("deviant sharing: ", refinedData);
                setFileData(refinedData.data);
            }
        }else if(props.text === "Sharing Changes"){
            let sharingChange = snapshotsSharingChanges(selSnapshot.data, compSnapshot.data, props.userData.driveType);
            console.log("snapshot changes: ", sharingChange);
            setFileData(sharingChange);
        }else if(props.text === "File-folder Sharing Differences"){
            let fileFolderSharingChange = fileFolderSharingChanges(selSnapshot.data, driveName, drivePath, props.userData.driveType);
            console.log("file-folder differences: ", fileFolderSharingChange);
            setFileData(fileFolderSharingChange);
        }else{
            //console.error("Error");
        }
    }
    const handleDriveName = (e) =>{
        setDriveName(e.target.value);
    }
    const handleDrivePath = (e) =>{
        setDrivePath(e.target.value);
    }
    const handleSharing = (e) =>{
        console.log(e.target.value);
        setcompSnapshot(e.target.value);
    }
    return (
        <>
            <h3>
                {props.text}
                {props.text == "Deviant Sharing" ?
                    <FormControl sx={{ m: 0.5, width: '10ch' }} style={{marginLeft:"10px",padding: "5px"}}variant="outlined">
                        <OutlinedInput
                            id="outlined-adornment-weight"
                            value={threshold}
                            onChange={handleThreshold}
                            endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                                'aria-label': 'weight',
                            }}
                            size="small"
                        />
                        <FormHelperText id="outlined-weight-helper-text">Threshold</FormHelperText>
                    </FormControl>
                    : ""
                }
                {props.text == "Sharing Changes"?
                    <>
                        <FormControl sx={{ m: 1, minWidth: 200 }} size="small" style={{ }}>
                            <InputLabel id="demo-select-small">Comparing Snapshot</InputLabel>
                            <Select
                                labelId="demo-select-small"
                                id="demo-select-small"
                                value={compSnapshot}
                                label="Comparing Snapshot"
                                onChange={handleSharing}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {props.userData.fileSharingSnapshots.map((data) =>{
                                    return <MenuItem value={data}>{data.name}</MenuItem>
                                })}

                            </Select>
                        </FormControl>

                    </>:
                    <>
                        <TextField
                            id="outlined-required"
                            label="Drive Name"
                            defaultValue=""
                            size="small"
                            onChange={handleDriveName}
                        />
                        <TextField
                        id="outlined-required"
                        label="Drive Path"
                        defaultValue=""
                        size="small"
                        onChange={handleDrivePath}
                        />
                    </>
                }
                <Button variant="contained" value={props.text} endIcon={<SendIcon />} style={{color:"gray"}} onClick={handleClick} >
                    Analyze
                </Button>
            </h3>
            {props.text == "Deviant Sharing" ?
                <DeviantSharingDataGrid gridData={fileData}/> :
                props.text == "Sharing Changes" ?
                    <SharingChangesDataGrid girdData={fileData}/> :
                    props.text == "File-folder Sharing Differences" ?
                        <FileFolderSharingDifferenceDataGrid gridData={fileData}/> : ""
            }
        </>
    );
}
