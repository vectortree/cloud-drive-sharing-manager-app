import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

//Dummy Data
const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'Name', headerName: 'Name', width: 200 },
    { field: 'Query', headerName: 'Query', width: 200 },
    {field: 'ReadAccess', headerName: 'ReadAccess', type: 'ReadAccess', width: 150,},
    {field: 'WriteAccess', headerName: 'WriteAccess', type: 'WriteAccess', width: 180,},
    {field: 'DenyReadAccess', headerName: 'DenyReadAccess', type: 'DenyReadAccess', width: 180,},
    {
        field: 'DenyWriteAccess',
        headerName: 'DenyWriteAccess',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 180
        // valueGetter: (params) => `${params.row.Name || ''} ${params.row.Name || ''}`,
    }
];


export default function AccessControlComponent(props) {

    return (
        <div style={{ height: props.size, width: '100%' }}>
            <DataGrid
                rows={props.userData.accessControlRequirements}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}
