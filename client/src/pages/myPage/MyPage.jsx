import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";

const sharingInfo= [
    <Profile/>,
    <ColumnMenuGrid name="Recent Access Control Requirement"/>,
    <ColumnMenuGrid name="File Sharing Snapshot"/>,
    <ColumnMenuGrid name="Group Sharing Snapshot"/>,
    <ColumnMenuGrid name="User's Recent Query"/>
];

const MyPage = ()=>{
    return (
        <Grid>
            <MiniDrawer components={sharingInfo}/>
        </Grid>
    )
}
export default MyPage;