import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

export default function AnalysisComponent(props) {
    const { data, loading } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 100,
        maxColumns: 10,
    });

    const columns = [
        {field: 'Title', headerName: 'Title', width: 400,editable: true,sortable: true,},
        {field: 'Date', headerName: 'Date', width: 300,sortable: true,editable: true,},
        {field: 'Owner', headerName: 'Owner', width: 250 ,editable: true,sortable: true,},
        {field: 'Status', headerName: 'Status', width: 130 ,type:"boolean",editable: true,sortable: true,},
        {field: 'Permission', headerName: 'Permission', width: 130 ,editable: true,sortable: true,},
    ];


    return (
        <>
            <h3>{props.text}</h3>
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
