import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import BasicButtons from "./Button";
import {useEffect, useContext, useState} from "react"
import BasicModal from "./Modal";
import Button from '@mui/material/Button';
import DataTable from "./AddRequirement";
import api, {
    removeAccessControlRequirement,
    removeFileSharingSnapshot,
    removeGroupMembershipSnapshot, removeSearchQuery
} from '../api/api';
import ColorRadioButtons from "./CreateSnapshot";
import AddRequirement from "./AddRequirement";
import {userData} from "../App";

// This is for the content on the User Profile page.
// It manages all of the Table of requirement, snapshot and recent query

const accessDataTable = <DataTable/>

  const columns = [
    { field: 'id', headerName: 'Index', width: 90 ,editable: true },
    {
      field: 'name',
      headerName: 'Requirement Name',
      width: 550,
      editable: true,
    },
    {
        renderCell: (params) => (
        <strong>
            {params.value}
          <Button
            variant="outlined"
            size = 'small'
            sx={{ color : "black" }}
            // onClick = {(id)=>}
          >
            X
          </Button>
        </strong>
      ),}
  ];

export default function ColumnMenuGrid( props) {
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    const accessDataTable = <AddRequirement opdataSet={props.dataSet} onClick={handleCloseModal} ACR_Handler={props.Data_Handler}/>
    const columns = [
        { field: 'id', headerName: 'Index', width: 90 ,editable: true },
        {
            field: 'name',
            headerName: 'Requirement Name',
            width: 550,
            editable: true,
        },
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
            ),}
    ];
    console.log(props.dataSet);

    const deleteRequirement = (id) => {
          props.Data_DeleteHandler(id);
          if(props.type == "ACR"){
              removeAccessControlRequirement(id);
          }else if( props.type == "FSS"){
              removeFileSharingSnapshot(id);
          }else if( props.type == "GSS"){
              removeGroupMembershipSnapshot(id);
          }else if (props.type == "SearchQuery"){
              removeSearchQuery(id);
          }else{
              console.error("Error: No matched Name");
          }
      };

    return (

        <div>
            <h2>{props.name}</h2>
        <div style={{display:"inline-flex", width : "80%"}}>
            
        <div style={{ height: 280, width: '100%', 'padding-right' : '10%' }}>
            <DataGrid rows={props.dataSet}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }} />
        </div>
        <div style={{display:"inline-flex"}}>
            <br/>
            {props.type === "ACR" ?
            <Button onClick={handleOpenModal} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Manage Access Control</Button>
            :
            props.type === "FSS" ? 
            <Button onClick={handleOpenModal} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Check Requirement</Button>
            :
            props.type === "GSS" ?
            <Button onClick={handleOpenModal} style={{float:"right", border:1,borderStyle:"solid", borderBlockColor:"black"}}>Check Requirement</Button> 
            :
            props.type === "SearchQuery" ?
            <div></div> : <div></div>
            }
            <BasicModal title={"Add Requirement"} open={openModal} handleClose={handleCloseModal}  >{accessDataTable}</BasicModal>

        </div>
            
        </div>
        </div>
    );
}

