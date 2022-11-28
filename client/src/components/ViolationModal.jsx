import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {GroupMembershipSnapshotsData} from "../recoil";
import {selectedCheckSnapshot} from "../recoil";
import {useRecoilState} from "recoil";
import { checkRequirements } from "../functions/ac-requirements"
import { getClosestGMSnapshots } from "../functions/gm-snapshots"

const columns = [
    {
        width: 270,
        label: 'File Name',
        dataKey: 'fileName',
      },
      {
        width: 170,
        label: 'Violation Type',
        dataKey: 'violationType',
        numeric: true,
      },
      {
        width: 450,
        label: 'Message',
        dataKey: 'message',
        numeric: true,
      }
];


export default function ViolationModal(props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
  const [checkSnapShot, setCheckSnapShot] = useRecoilState(selectedCheckSnapshot);

  let closestGMSnapShotsData = getClosestGMSnapshots(GroupSharing, checkSnapShot)
  let checkRequirement = checkRequirements(checkSnapShot, closestGMSnapShotsData, props.components.ACR_data, props.components.userData.email, props.components.userData.domain, props.components.userData.driveType )
  console.log(checkRequirement)

  let ch_req_obj = [] 
  checkRequirement.map((req) => {
    let fileName = req.file.name;
        for(let i = 0 ;i < req.data.length; i++){
            ch_req_obj.push(
                {
                    fileName : fileName,
                    violationType : req.data[i].violationType,
                    message : req.data[i].message,
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
                  style={{ minWidth: column.minWidth }}
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
                        <TableCell key={column.dataKey} align={column.align}>
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
