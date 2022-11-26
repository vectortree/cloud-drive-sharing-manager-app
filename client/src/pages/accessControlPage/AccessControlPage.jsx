import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AccessControlComponent from "../../components/AccessControlComponent";
import {userData} from "../../App";
import {AccessControlData} from "../../recoil";

const AccessControlPage = (props) =>{

    const sharingInfo= [
        <AccessControlComponent size={700} userData = {props.userData} ACR_data={props.userData.accessControlRequirements} />
    ];
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "accessControl" userData = {props.userData}/>
        </Grid>
    )
}
export default AccessControlPage;