import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";
import {useRecoilState, useSetRecoilState} from "recoil";
import {
    AccessControlData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData,
    searchQueryHistoryData
} from "../../recoil";
import {AuthContext} from "../../auth/auth";
import {useEffect, useContext, useState, useRef} from "react"



const MyPage = (props)=>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    const [FileSharing, setFileSharing] = useRecoilState(FileSharingSnapShotData);
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [SearchQuery,setSearchQuery] = useRecoilState(searchQueryHistoryData);
    useEffect(() => {
        setACR(props.userData.accessControlRequirements);
        setFileSharing(props.userData.fileSharingSnapshots);
        setGroupSharing(props.userData.groupMembershipSnapshots);
        setSearchQuery(props.userData.searchQuery);
    },[]);

    console.log(props.userData);
    const FileSharing_Controller = (data) =>{
        props.FileSharing_Handler([...FileSharing,data]);
        setFileSharing(
            [...FileSharing,data]
        )
    }
    const DeleteFileSharing_Controller = (id) =>{
        let variable = [...FileSharing];
        let FileSharing_Data = variable.filter((row) => row.id !== id)
        props.FileSharing_Handler(FileSharing_Data);
        setFileSharing(FileSharing_Data)
    }
    const ACR_Controller = (data) =>{
        props.ACR_Handler([...ACR,data]);
        setACR(
            [...ACR,data]
        )
    }
    const ACR_DeleteController = (id) =>{
        let variable = [...ACR];
        let ACR_Data = variable.filter((row) => row.id !== id)
        props.ACR_Handler(ACR_Data);
        setACR(ACR_Data)
    }
    const sharingInfo= [
        <Profile userData = {props.userData}/>,
        <ColumnMenuGrid name="Recent Access Control Requirement" type= "ACR"dataSet = {ACR} Data_Handler={ACR_Controller} Data_DeleteHandler={ACR_DeleteController}/>,
        <ColumnMenuGrid name="File Sharing Snapshot" dataSet = {FileSharing} type= "FSS" Data_Handler={FileSharing_Controller} Data_DeleteHandler = {DeleteFileSharing_Controller}/>,
        <ColumnMenuGrid name="Group Sharing Snapshot" dataSet = {GroupSharing} type= "GSS"/>,
        <ColumnMenuGrid name="User's Recent Query" dataSet = {[]} type= "SearchQuery"/>
    ];

    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" userData = {props.userData}/>
        </Grid>
    );
}
export default MyPage