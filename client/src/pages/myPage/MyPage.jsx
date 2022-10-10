import {Grid} from "@mui/material"
import React from "react";
import PrimarySearchAppBar from "../../components/Header"
import MiniDrawer from "../../components/sideBar"
const MyPage = (props) => {
    return (
        <>
        <MiniDrawer setIsAuthenticatedGoogleDrive={props.setIsAuthenticatedGoogleDrive}/>
        </>
    )
}
export default MyPage;