import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";
import {useRecoilState, useSetRecoilState} from "recoil";
import {
    AccessControlData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData, searchHistoryDisplay,
    searchQueryHistoryData
} from "../../recoil";
import {AuthContext} from "../../auth/auth";
import {useEffect, useContext, useState, useRef} from "react"
import List from "../../components/QueryHistoryList";
import QueryHistoryList from "../../components/QueryHistoryList";
import {dataRefining} from "../../functions/dataRefining";

const MyPage = (props)=>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    const [FileSharing, setFileSharing] = useRecoilState(FileSharingSnapShotData);
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [SearchQuery,setSearchQuery] = useRecoilState(searchQueryHistoryData);
    const [searchHistory,setSearchHistory] =useRecoilState(searchHistoryDisplay)

    useEffect(() => {
        setACR(props.userData.accessControlRequirements);
        setFileSharing(props.userData.fileSharingSnapshots);
        setGroupSharing(props.userData.groupMembershipSnapshots);
        if(SearchQuery.length == 0){
            setSearchQuery(props.userData.searchQueryHistory);
            setSearchHistory(props.userData.QueryHistoryForDisplay);
        }else{
            props.SearchQuery_Handler(SearchQuery);
            props.QueryHistory_Handler(dataRefining(SearchQuery));
        }
    },[]);

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
        setACR([...ACR,data])
    }
    const ACR_DeleteController = (id) =>{
        let variable = [...ACR];
        let ACR_Data = variable.filter((row) => row.id !== id)
        props.ACR_Handler(ACR_Data);
        setACR(ACR_Data)
    }
    const Group_Controller = (data) =>{
        console.log("group controller");
        props.GroupSharing_Handler([...GroupSharing,data]);
        setGroupSharing([...GroupSharing,data])
    }
    const Group_DeleteController = (id) =>{
        console.log("group controller Delete");
        let variable = [...GroupSharing];
        let GroupSharing_Data = variable.filter((row) => row.id !== id)
        props.GroupSharing_Handler(GroupSharing_Data);
        setGroupSharing(GroupSharing_Data)
    }
    const Delete_RecentSearchQuery = (id) =>{
        console.log("recent Search Query Delete");
        let variable = [...SearchQuery];
        let SearchQueryData = variable.filter((row) => row.id !== id)
        props.SearchQuery_Handler(SearchQueryData);
        props.QueryHistory_Handler(dataRefining(SearchQueryData));
        setSearchQuery(SearchQueryData)
        setSearchHistory(dataRefining(SearchQueryData))
    }


    const sharingInfo= [
        <Profile userData = {props.userData}/>,
        <ColumnMenuGrid name="Access Control Requirements" type= "AccessControlRequirement"dataSet = {ACR} Data_Handler={ACR_Controller} Data_DeleteHandler={ACR_DeleteController}/>,
        <ColumnMenuGrid name="File-Sharing Snapshots" dataSet = {FileSharing} type= "FileSharingSnapshot" Data_Handler={FileSharing_Controller} Data_DeleteHandler = {DeleteFileSharing_Controller}/>,
        <ColumnMenuGrid name="Group-Membership Snapshots" dataSet = {GroupSharing} type= "GroupSharingSnapshot"Data_Handler={Group_Controller} Data_DeleteHandler={Group_DeleteController}/>,
        <ColumnMenuGrid name="Search Query History" dataSet = {searchHistory} type= "SearchQuery" Data_DeleteHandler={Delete_RecentSearchQuery}/>,
    ];

    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" userData = {props.userData}/>
        </Grid>
    );
}
export default MyPage