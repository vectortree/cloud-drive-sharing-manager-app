import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {useRecoilState} from "recoil";
import {AccessControlData} from "../recoil";
import Button from '@mui/material/Button';
import { checkReq } from "../functions/ac-requirements"

//Dummy Data
const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'searchQuery', headerName: 'Query', width: 200 },
    {field: 'allowedReaders', headerName: 'ReadAccess', type: 'ReadAccess', width: 150,},
    {field: 'allowedWriters', headerName: 'WriteAccess', type: 'WriteAccess', width: 180,},
    {field: 'deniedReaders', headerName: 'DenyReadAccess', type: 'DenyReadAccess', width: 180,},
    {
        field: 'deniedWriters',
        headerName: 'DenyWriteAccess',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 180
        // valueGetter: (params) => `${params.row.Name || ''} ${params.row.Name || ''}`,
    }
];


export default function AccessControlComponent(props) {
    const [ACR, setACR]=useRecoilState(AccessControlData);
    console.log(props.ACR_data);
    console.log(props)
    // let checkRequirement = checkReq
    // let checkRequirement = checkReq(currentSnapshot, closestGMSnapshots, requirements, email, domain, driveType)
    return (
        <div style={{ height: props.size, width: '100%' }}>
            <Button style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Check Requirement</Button>
            <br></br>
            <br></br>
            <DataGrid
                rows={props.ACR_data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}
