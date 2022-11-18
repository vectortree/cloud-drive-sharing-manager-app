import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AccessControlComponent from "../../components/AccessControlComponent";
import {userData} from "../../App";
import {AccessControlData} from "../../recoil";


const AccessControlPage = (props) =>{
    console.log(AccessControlData);
    const sharingInfo= [
        <AccessControlComponent size={700} ACR_data={props.userData} />
    ];
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "accessControl" userData = {props.userData}/>
        </Grid>
    )
}
export default AccessControlPage;