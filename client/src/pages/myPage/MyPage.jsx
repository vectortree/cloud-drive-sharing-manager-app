import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";
import {useRecoilState, useSetRecoilState} from "recoil";
import {AccessControlData} from "../../recoil";
import {AuthContext} from "../../auth/auth";
import {useEffect, useContext, useState, useRef} from "react"



const MyPage = (props)=>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    useEffect(() => {
        setACR(props.userData.accessControlRequirements);
    },[]);
    console.log(ACR);
    console.log(props.userData.accessControlRequirements);
    console.log(props.userData);
    const ACR_Controller = (data) =>{
        setACR(prevRows => {
            let variable = [...prevRows,data]
            props.userData.accessControlRequirements = variable;
            return variable
        })
    }
    const ACR_DeleteController = (id) =>{
        console.log("ACR Delete");
        console.log(props.userData.accessControlRequirements);
        setACR(prevRows => {
                let variable = [...prevRows];
                let ACR_Data = variable.filter((row) => row.id !== id)
                props.userData.accessControlRequirements = ACR_Data;
                return ACR_Data
            }
        )
    }
    const sharingInfo= [
        <Profile userData = {props.userData}/>,
        <ColumnMenuGrid name="Recent Access Control Requirement" dataSet = {ACR} ACR_Handler={ACR_Controller} ACR_DeleteHandler={ACR_DeleteController}/>,
        <ColumnMenuGrid name="File Sharing Snapshot" dataSet = {props.userData.fileSharingSnapshots}/>,
        <ColumnMenuGrid name="Group Sharing Snapshot" dataSet = {props.userData.groupMembershipSnapshots}/>,
        <ColumnMenuGrid name="User's Recent Query" dataSet = {[]}/>
    ];

    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage" userData = {props.userData}/>
        </Grid>
    );
}
export default MyPage