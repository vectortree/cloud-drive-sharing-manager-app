import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
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

export default function AnalysisComponent(props) {
    const [ threshold,setThreshold ] = React.useState(0);
    const [ driveName,setDriveName ] = React.useState(null);
    const [ drivePath,setdrivePath ] = React.useState(null);
    const [ compSnapshot, setcompSnapshot] = React.useState();
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);

    const { data, loading } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 100,
        maxColumns: 10,
    });
    const handleThreshold = (event) =>{
        setThreshold(event.target.value);
    }

    const handleClick = (e) =>{
        if(props.text=="Deviant Sharing" && threshold < 50 ){
            alert("Threshold should be bigger than 50%");
            let deviantSharingData = deviantSharing(selSnapshot, driveName, drivePath, threshold, props.userData.driveType)
            console.log(deviantSharingData);
        }else if(props.text=="Sharing Changes"){
            let sharingChange = snapshotsSharingChanges(selSnapshot, compSnapshot, props.userData.driveType);
            console.log(sharingChange);
        }else if(props.text == "File-folder Sharing Differences"){
            let fileFolderSharingChange = fileFolderSharingChanges(selSnapshot, driveName, drivePath, props.userData.driveType);
            console.log(fileFolderSharingChange);
        }else if(props.text == "Redundant Sharing"){

        }else{
            console.error("Error");
        }
    }
    const handleDriveName = (e) =>{
        setDriveName(e.target.value);
    }
    const handleDrivePath = (e) =>{
        setdrivePath(e.target.value);
    }
    const handleSharing = (e) =>{
        console.log(e.target.value);
        setcompSnapshot(e.target.value);
    }
    const columns = [
        {field: 'Title', headerName: 'Title', width: 400,editable: true,sortable: true,},
        {field: 'Date', headerName: 'Date', width: 300,sortable: true,editable: true,},
        {field: 'Owner', headerName: 'Owner', width: 250 ,editable: true,sortable: true,},
        {field: 'Status', headerName: 'Status', width: 130 ,type:"boolean",editable: true,sortable: true,},
        {field: 'Permission', headerName: 'Permission', width: 130 ,editable: true,sortable: true,},
    ];


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
        <div style={{ height: 600, width: '100%' }}>
            <DataGrid
                {...data}
                columns={columns}
                initialState={{
                    ...data.initialState,
                    filter: {
                        filterModel: {
                            items: [{ columnField: 'quantity', operatorValue: '>', value: 10000 }],
                        },
                    },
                    sorting: {
                        sortModel: [{ field: 'desk', sort: 'asc' }],
                    },
                }}
            />
        </div>
        </>
    );
}
