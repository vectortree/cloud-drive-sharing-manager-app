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
import { useState} from "react"

const columns = [
      {
        width: 450,
        label: 'Members',
        dataKey: 'Members',
        numeric: true,
      }
];


export default function GMSInfo(props) {
    console.log(props.memberInfo)
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
 
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    let MemberListGMS = [] 
    props.memberInfo.members.map((mem) => {
        MemberListGMS.push(
            {Members : mem}
            )
    });

    return (
        <Paper sx={{ width: '100%', maxHeight : '30%', overflow: 'hidden' }}>
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
                {MemberListGMS
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
            count={MemberListGMS.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      );
    
    }