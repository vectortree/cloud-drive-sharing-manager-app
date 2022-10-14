import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import BasicButtons from "./Button";
import {useEffect, useContext, useState} from "react"
import Modal from "./Modal";
import BasicModal from "./Modal";
import DataTable from "./AddRequirement";

export default function ColumnMenuGrid( props) {

    const accessDataTable = <DataTable/>
    const { data } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 20,
        maxColumns: 5,
    });

    const clickModalReq = (isModalReqAddClicked) => {
        console.log(isModalReqAddClicked)
        props.isModalReqAddClickedPage(isModalReqAddClicked)
    }
    const addButton = <BasicButtons name="Add" />
    const editButton = <BasicButtons name="Edit"/>
    return (

        <div>
            <h2>{props.name}</h2>
        <div style={{display:"inline-flex", width : "80%"}}>
            
        <div style={{ height: 280, width: '100%', 'padding-right' : '10%' }}>
            <DataGrid {...data} disableColumnMenu />
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
