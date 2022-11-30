import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import BasicButtons from "./Button";
import {useEffect, useContext, useState} from "react"
import BasicModal from "./Modal";
import GMSInfomation from "./GMSInfo";
import Button from '@mui/material/Button';
import DataTable from "./AddRequirement";
import api, {
    removeAccessControlRequirement,
    removeFileSharingSnapshot,
    removeGroupMembershipSnapshot, removeSearchQuery
} from '../api/api';
import ColorRadioButtons from "./CreateSnapshot";
import AddRequirement from "./AddRequirement";
import {GMSMember} from "../recoil";
import {useRecoilState} from "recoil";

const accessDataTable = <DataTable/>

export default function ColumnMenuGrid( props) {
    const [openModal, setOpenModal] = React.useState(false);
    const [openModalGMS, setOpenModalGMS] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleOpenModalGMS = () => setOpenModalGMS(true);
    const handleCloseModalGMS = () => setOpenModalGMS(false);
    const [memberInfo, setmemberInfo] = useRecoilState(GMSMember);
        
    const accessDataTable = <AddRequirement opdataSet={props.dataSet} onClick={handleCloseModal} ACR_Handler={props.Data_Handler}/>
    const columns = [
        { field: 'id', headerName: 'Index', width: 90 ,editable: true },
        { field: 'name', headerName: props.type, width: 550, editable: true,},
        {
            renderCell: (params) => (
                <strong>
                    {params.value}
                    <Button
                        variant="outlined"
                        size = 'small'
                        sx={{ color : "black" }}
                        onClick={()=>deleteRequirement(params.id)}
                    >
                        X
                    </Button>
                </strong>
            )
        }
    ];

    const deleteRequirement = (id) => {
        props.Data_DeleteHandler(id);
          if(props.type == "AccessControlRequirement"){
              removeAccessControlRequirement(id);
          }else if( props.type == "FileSharingSnapshot"){
              removeFileSharingSnapshot(id);
          }else if( props.type == "GroupSharingSnapshot"){
              console.log(id);
              removeGroupMembershipSnapshot(id);
          }else if (props.type == "SearchQuery"){
              removeSearchQuery(id);
          }else{
              console.error("Error: No matched Name");
          }
    };

    const handleInfoGMS = (e) => {
        console.log(props)
        console.log(e)
        if(props.type === "GroupSharingSnapshot" && e.field !== "name"){
            let aa = props.dataSet.filter(function (func) { return func.id == e.id });
            setmemberInfo(aa[0])
            handleOpenModalGMS()
        }
    }
    const timestampTo = new Date(memberInfo.timestamp).toUTCString()
    console.log(props.dataSet);
    return (

        <div >
            <h2>{props.name}</h2>
        <div style={{display:"inline-flex", width : "90%"}}>
            
        <div style={{ height: 280, width: 1000, 'padding-right' : '10%' }}>
            <DataGrid rows={props.dataSet}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
                onCellDoubleClick={handleInfoGMS}
                experimentalFeatures={{ newEditingApi: true }} />
        </div>
        <div style={{display:"inline"}}>
            <br/>
            {props.type === "AccessControlRequirement" ?
            <Button onClick={handleOpenModal} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Add Access Control Requirement</Button>
            :
            <div></div>
            }
            <BasicModal title={"Add Requirement"} open={openModal} handleClose={handleCloseModal}  >{accessDataTable}</BasicModal>
            <BasicModal open={openModalGMS} handleClose={handleCloseModalGMS} title={"Group Membership Snapshot Info"} >
                <div sx = {{fontsize : "13px"}}>
                    <b>Snapshot Name : </b>{memberInfo.name}<br/>
                    <b>Group Name : </b>{memberInfo.groupName}<br/>
                    <b>Group Email : </b>{memberInfo.groupAddress}<br/>
                    <b>TimeStamp : </b>{timestampTo}<br/>
                    <br></br>
                </div>
                    <GMSInfomation memberInfo = {memberInfo} handleClose={handleCloseModalGMS}/></BasicModal>
        </div>
            
        </div>
        </div>
    );
}

