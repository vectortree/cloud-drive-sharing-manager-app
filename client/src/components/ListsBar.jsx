import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import BasicButtons from "./Button";
import {useEffect, useContext, useState} from "react"


export default function ColumnMenuGrid( props) {
    const { data } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 20,
        maxColumns: 5,
    });

    const clickModalReq = (isModalReqAddClicked) => {
        console.log(isModalReqAddClicked)
        props.isModalReqAddClickedPage(isModalReqAddClicked)
    }

    return (

        <div>
            <h2>{props.name}</h2>
        <div style={{display:"inline-flex", width : "80%"}}>
            
        <div style={{ height: 280, width: '100%', 'padding-right' : '10%' }}>
            <DataGrid {...data} disableColumnMenu />
        </div>
        <div style={{display:"inline-flex"}}>
            <br/>
            <BasicButtons name="Add" isModalReqAddClicked = {clickModalReq} />
            <BasicButtons name="Edit"/>
        </div>
            
        </div>
        </div>
    );
}
