import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { AuthContext } from '../auth/auth';
import { useContext } from 'react';

const columns = [
    {
        width: 50,
        label: 'TimeStamp',
        dataKey: 'TimeStamp',
      },
      {
        width: 50,
        label: 'Action',
        dataKey: 'Action',
      },
      {
        width: 50,
        label: 'PermissionRole',
        dataKey: 'PermissionRole',
        numeric: true,
      },
      {
        width: 50,
        label: 'PermissionType',
        dataKey: 'PermissionType',
        numeric: true,
      },
      {
        width: 50,
        label: 'PermissionValue',
        dataKey: 'PermissionValue',
        numeric: true,
      },
      {
        width:  50,
        label: 'FileName',
        dataKey: 'FileName',
        numeric: true,
      }
];


export default function LogsModal() {    

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const {userProfile} = useContext(AuthContext);

  let ch_req_obj = [] 
  userProfile.sharingChangesLog.map((req) => {
    let timestamp = req.timestamp;
    let permissionRole = req.permissionRole;
    let permissionType = req.permissionType;
    let permissionValue = req.permissionValue;
    let action = req.action;
    console.log(req.files)
        for(let i = 0 ;i < (req.files).length; i++){
            ch_req_obj.push(
                {
                    TimeStamp : timestamp,
                    Action: action,
                    PermissionRole : permissionRole,
                    PermissionType : permissionType,
                    PermissionValue : permissionValue,
                    FileName : req.files[i].name,
                }
            )
        } 
    });

    console.log(ch_req_obj);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  console.log(columns)
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.dataKey}
                  align={column.align}
                  style={{ minWidth: column.width }}
                  sx = {{fontSize : '15px'}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ch_req_obj
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.dataKey];
                      return (
                        <TableCell key={column.dataKey} align={column.align} sx = {{fontSize : '13px'}} >
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={ch_req_obj.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
