import {Grid} from "@mui/material"
import React from "react";
import PrimarySearchAppBar from "../../components/Header"
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
const sharingInfo= [
    <ColumnMenuGrid name="Recent Access Control Requirement"/>,
    <ColumnMenuGrid name="File Sharing Snapshot"/>,
    <ColumnMenuGrid name="Group Sharing Snapshot"/>,
    <ColumnMenuGrid name="User's Recent Query"/>
];

const MyPage = ()=>{
    return (
        <Grid>
            <MiniDrawer component={sharingInfo}/>
        </Grid>
    )
}
export default MyPage;