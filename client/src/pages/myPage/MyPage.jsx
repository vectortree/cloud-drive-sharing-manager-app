import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";



const MyPage = (props)=> {
    const [accessControlRequirements, setAccessControlRequirements] = React.useState(props.userData.accessControlRequirements);
    const ACR_Controller = (data) =>{
        setAccessControlRequirements(data);
    }
    const sharingInfo= [
        <Profile userData = {props.userData}/>,
        <ColumnMenuGrid name="Recent Access Control Requirement" dataSet = {accessControlRequirements} ACR_Handler={ACR_Controller}/>,
        <ColumnMenuGrid name="File Sharing Snapshot" dataSet = {props.userData.fileSharingSnapshots}/>,
        <ColumnMenuGrid name="Group Sharing Snapshot" dataSet = {props.userData.groupMembershipSnapshots}/>,
        <ColumnMenuGrid name="User's Recent Query" dataSet = {props.userData.searchQueryHistory}/>
    ];

    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" userData = {props.userData}/>
        </Grid>
    );
}
export default MyPage