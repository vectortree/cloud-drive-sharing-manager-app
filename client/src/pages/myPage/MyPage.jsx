import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";
import {useRecoilState, useSetRecoilState} from "recoil";
import {AccessControlData} from "../../recoil";
import {userData} from "../../App";



const MyPage = (props)=>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    // const setACT2= useSetRecoilState();
    setACR(JSON.stringify(userData.accessControlRequirements));
    const ACR_object = JSON.parse(ACR);


    const [accessControlRequirements, setAccessControlRequirements] = React.useState(ACR_object);
    const ACR_Controller = (data) =>{
        setAccessControlRequirements(data);
        setACR(JSON.stringify(data));
        console.log(ACR);
    }
    const ACR_DeleteController = (id) =>{
        setAccessControlRequirements((prevRows) => prevRows.filter((row) => row.id !== id));
        console.log(accessControlRequirements);
        setACR(JSON.stringify(accessControlRequirements));
        // setACT2(JSON.stringify(accessControlRequirements));
        console.log(ACR);
    }
    const sharingInfo= [
        <Profile userData = {userData}/>,
        <ColumnMenuGrid name="Recent Access Control Requirement" dataSet = {accessControlRequirements} ACR_Handler={ACR_Controller} ACR_DeleteHandler={ACR_DeleteController}/>,
        // <ColumnMenuGrid name={ACR} dataSet = {accessControlRequirements} ACR_Handler={ACR_Controller} ACR_DeleteHandler={ACR_DeleteController}/>,
        <ColumnMenuGrid name="File Sharing Snapshot" dataSet = {userData.fileSharingSnapshots}/>,
        <ColumnMenuGrid name="Group Sharing Snapshot" dataSet = {userData.groupMembershipSnapshots}/>,
        <ColumnMenuGrid name="User's Recent Query" dataSet = {userData.searchQueryHistory}/>
    ];

    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" userData = {userData}/>
        </Grid>
    );
}
export default MyPage