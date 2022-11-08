import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

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
    for(let i = 0; i < props.ACR_data.length; i++)
    {
        props.ACR_data[i].id = i;
    }
    return (
        <div style={{ height: props.size, width: '100%' }}>
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
