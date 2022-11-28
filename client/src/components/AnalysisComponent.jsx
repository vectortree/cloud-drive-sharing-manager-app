import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';

export default function AnalysisComponent(props) {
    const [ threshold,setThreshold ] = React.useState(0);
    const { data, loading } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 100,
        maxColumns: 10,
    });
    const handleThreshold = (event) =>{
        setThreshold(event.target.value);
    }
    const handleKeyup = (e) =>{
        if(e.code == "Enter"){
            const currentSnapshot = props.userData.fileSharingSnapshots[[props.userData.fileSharingSnapshots.length-1]];
            // let deviantSharingData = deviantSharing(currentSnapshot, drive, path, threshold, props.userData.driveType)
        }
    }
    const handleClick = (e) =>{
        console.log(e);
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
                    <TextField id="outlined-number" label="Threshold" type="number" InputLabelProps={{shrink: true,}} style={{marginLeft:"50px"}}
                               onChange={handleThreshold} onKeyUp={handleKeyup}
                    /> : ""
                }
                <Button variant="contained" endIcon={<SendIcon />} style={{color:"gray"}} onClick={handleClick} onKeyUp={handleKeyup}>
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
