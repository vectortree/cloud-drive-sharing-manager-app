import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import BasicButtons from "./Button";
import {useEffect, useContext, useState} from "react"
import BasicModal from "./Modal";
import Button from '@mui/material/Button';
import DataTable from "./AddRequirement";

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
          >
            X
          </Button>
        </strong>
      ),}
  ];
  
  const rows = [
    { id: 1, reqName: 'Requirement1'},
    { id: 2, reqName: 'Requirement222222222222222'},
  ];


  

export default function ColumnMenuGrid( props) {
    for(let i = 0; i < props.userData.length; i++)
    {
        props.userData[i].id = i;
    }

    const addButton = <BasicButtons name="Add" />
    const editButton = <BasicButtons name="Edit"/>
    return (

        <div>
            <h2>{props.name}</h2>
        <div style={{display:"inline-flex", width : "80%"}}>
            
        <div style={{ height: 280, width: '100%', 'padding-right' : '10%' }}>
            <DataGrid rows={props.userData}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }} />
        </div>
        <div style={{display:"inline-flex"}}>
            <br/>
            <BasicModal icon={ addButton} title="Add Requirement" contents={accessDataTable}/>
            <BasicModal icon={ editButton} title="Edit Requirement" contents={accessDataTable}/>

        </div>
            
        </div>
        </div>
    );
}
