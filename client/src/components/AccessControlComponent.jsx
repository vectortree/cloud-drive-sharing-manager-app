import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {useRecoilState} from "recoil";
import Button from '@mui/material/Button';
import { deserializeSearchQuery } from "../functions/query"
import {selectedSnapshot} from "../recoil";
import {FileSharingSnapShotData} from "../recoil";
import {GroupMembershipSnapshotsData} from "../recoil";
import {selectedCheckSnapshot} from "../recoil";
import DropDownForReq from "./DropDownListReq";
import ViolationModalTable from "./ViolationModal";
import BasicModal from "./Modal";

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
    const [openModal, setOpenModal] = React.useState(false);
    const searchQueryModalOpen = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    console.log(props)
    console.log(props.ACR_data);
    console.log(props.userData)
    console.log(selSnapshot)
    console.log(FileSharing)
    console.log(GroupSharing)
    console.log(checkSnapShot)


    let ac_req = props.ACR_data.map((req) => {
        return {
            id: req.id,
            name: req.name,
            searchQuery: deserializeSearchQuery(req.searchQuery),
            group: req.group,
            allowedReaders: req.allowedReaders,
            allowedWriters: req.allowedWriters,
            deniedReaders: req.deniedReaders,
            deniedWriters: req.deniedWriters,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt
        }
    });
    console.log(ac_req);

    const [selectionModel, setSelectionModel] = React.useState([]);
    
    console.log(selectionModel)

    return (
        <div style={{ height: props.size, width: '100%' }}>
            <DropDownForReq fileSharingSnapshot={FileSharing} sx = {{ float : "right"}}/>
            &emsp;&emsp;
            <b style={{color:"gray"}}>{checkSnapShot.name}</b>
            <Button onClick = {searchQueryModalOpen} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Check Requirement</Button>
            <BasicModal open={openModal} handleClose={handleCloseModal} title={"Violation Report"} ><ViolationModalTable handleClose={handleCloseModal} type="ACR" components = {props} selectionModel = {selectionModel}/></BasicModal>
            <br></br>
            <br></br>
            <DataGrid
                rows={ac_req}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5]}
                checkboxSelection
                onSelectionModelChange = { (newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                selectionModel = {selectionModel}
            />
        </div>
    );
}
