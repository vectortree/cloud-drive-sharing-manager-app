import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import ColumnMenuGrid from "../../components/ListsBar"
import Profile from "../../components/Profile";
import Modal from "../../components/Modal";
import {useState} from "react"

const MyPage = (props)=> {
    const [modalReq, setModalReq] = useState(false);

    const getModalReq = (isModalReqAddClickedPage) => {
        setModalReq(isModalReqAddClickedPage)
        console.log(modalReq)
    }

    const sharingInfo= [
        <Profile/>,
        <ColumnMenuGrid isModalReqAddClickedPage = {getModalReq} name="Recent Access Control Requirement"/>,
        <ColumnMenuGrid name="File Sharing Snapshot"/>,
        <ColumnMenuGrid name="Group Sharing Snapshot"/>,
        <ColumnMenuGrid name="User's Recent Query"/>
    ];


    return (
        <Grid>
            <MiniDrawer  components={sharingInfo} type = "myPage"/>
            {/*<Modal isModalOpen = {modalReq} isModalReqAddClickedPage = {getModalReq}  />*/}
            {/* {modalReq === true ? <Modal  /> : null} */}
        </Grid>
    );
}
export default MyPage