import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {useRecoilState} from "recoil";
import {AccessControlData} from "../recoil";
import Button from '@mui/material/Button';
import { checkRequirements } from "../functions/ac-requirements"
import { getClosestGMSnapshots } from "../functions/gm-snapshots"
import { deserializeSearchQuery } from "../functions/query"
import {selectedSnapshot} from "../recoil";
import {FileSharingSnapShotData} from "../recoil";
import {GroupMembershipSnapshotsData} from "../recoil";
import {selectedCheckSnapshot} from "../recoil";
import DropDownForReq from "./DropDownListReq";

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
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);
    const [FileSharing, setFileSharing] = useRecoilState(FileSharingSnapShotData);
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [checkSnapShot, setCheckSnapShot] = useRecoilState(selectedCheckSnapshot);

    console.log(props.ACR_data);
    console.log(props.userData)
    console.log(selSnapshot)
    console.log(FileSharing)
    console.log(GroupSharing)
    console.log(checkSnapShot)

    const allSnapshot = [
        ...FileSharing,
        ...GroupSharing
      ];

    // let checkRequirement = checkReq(currentSnapshot, closestGMSnapshots, requirements, email, domain, driveType)
    
    const handleCheckReq = () => {
        let closestGMSnapShotsData = getClosestGMSnapshots(GroupSharing, checkSnapShot)
        let checkRequirement = checkRequirements(checkSnapShot, closestGMSnapShotsData, props.ACR_data, props.userData.email, props.userData.domain, props.userData.driveType )
        console.log(checkRequirement)
    }

    let ac_req = [{
        id: props.ACR_data[0].id,
        name: props.ACR_data[0].name,
        searchQuery: deserializeSearchQuery(props.ACR_data[0].searchQuery),
        group: props.ACR_data[0].group,
        allowedReaders: props.ACR_data[0].allowedReaders,
        allowedWriters: props.ACR_data[0].allowedWriters,
        deniedReaders: props.ACR_data[0].deniedReaders,
        deniedWriters: props.ACR_data[0].deniedWriters,
        createdAt: props.ACR_data[0].createdAt,
        updatedAt: props.ACR_data[0].updatedAt
    }];
    
    return (
        <div style={{ height: props.size, width: '100%' }}>
            <DropDownForReq userDataSnapshot={allSnapshot} sx = {{ float : "right"}}/>
            &emsp;&emsp;
            <b style={{color:"gray"}}>{checkSnapShot.name}</b>
            <Button onClick = {handleCheckReq} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Check Requirement</Button>
            <br></br>
            <br></br>
            <DataGrid
                rows={ac_req}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}
