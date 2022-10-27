import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

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

const rows = [
    { id: 1, Name: 'Access Control Policy', Query: 'folder:\'CSE416\'', ReadAccess:"Sije",WriteAccess:"Sije, JeongYoon",DenyReadAccess:"JeongYoon",DenyWriteAccess:"Starr"},
    { id: 2, Name: 'Access Control Policy', Query: 'folder:\'mid.pdf\'', ReadAccess:"",WriteAccess:"",DenyReadAccess:"",DenyWriteAccess:""},
    { id: 3, Name: 'Access Control Policy', Query: 'folder:\'Document\'', ReadAccess:"",WriteAccess:"",DenyReadAccess:"",DenyWriteAccess:""},
    { id: 4, Name: 'Access Control Policy', Query: 'folder:\'beauty.jpeg\'', ReadAccess:"",WriteAccess:"",DenyReadAccess:"",DenyWriteAccess:""},
    { id: 5, Name: 'Access Control Policy', Query: 'folder:\'ScreenShot.peg\'', ReadAccess:"",WriteAccess:"",DenyReadAccess:"",DenyWriteAccess:""},
];

export default function AccessControlComponent() {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}
