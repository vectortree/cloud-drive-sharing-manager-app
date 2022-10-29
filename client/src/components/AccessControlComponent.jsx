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

const rows = [
    { id: 1, Name: 'Access Control Policy#1', Query: 'folder:\'CSE416\'', ReadAccess:"Sije, Zalman",WriteAccess:"Sije, JeongYoon",DenyReadAccess:"JeongYoon",DenyWriteAccess:"Starr"},
    { id: 2, Name: 'Access Control Policy#2', Query: 'file:\'mid.pdf\'', ReadAccess:"JeongYoon, Satrr",WriteAccess:"Sije",DenyReadAccess:"Zalman",DenyWriteAccess:"Starr"},
    { id: 3, Name: 'Access Control Policy#3', Query: 'folder:\'Document\'', ReadAccess:"Starr",WriteAccess:"Zalman",DenyReadAccess:"Sije",DenyWriteAccess:"JeongYoon"},
    { id: 4, Name: 'Access Control Policy#4', Query: 'file:\'beauty.jpeg\'', ReadAccess:"Zalman",WriteAccess:"Sije",DenyReadAccess:"Starr",DenyWriteAccess:"JeongYoon"},
    { id: 5, Name: 'Access Control Policy#5', Query: 'file:\'ScreenShot.peg\'', ReadAccess:"Starr",WriteAccess:"JeongYoon",DenyReadAccess:"Zalman",DenyWriteAccess:"Sije"},
];

export default function AccessControlComponent(props) {
    return (
        <div style={{ height: props.size, width: '100%' }}>
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
