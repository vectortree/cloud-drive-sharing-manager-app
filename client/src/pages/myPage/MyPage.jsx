import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";



const MyPage = (props)=> {

    const sharingInfo= [
        <Profile userData = {props.userData}/>,
        <ColumnMenuGrid name="Recent Access Control Requirement" userData = {props.userData}/>,
        <ColumnMenuGrid name="File Sharing Snapshot" userData = {props.userData}/>,
        <ColumnMenuGrid name="Group Sharing Snapshot" userData = {props.userData}/>,
        <ColumnMenuGrid name="User's Recent Query" userData = {props.userData}/>
    ];
    console.log(props.userData);
    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" profileData = {props.userData}/>
        </Grid>
    );
}
export default MyPage