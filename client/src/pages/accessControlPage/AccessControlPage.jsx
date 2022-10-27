import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AccessControlComponent from "../../components/AccessControlComponent";

const sharingInfo= [
    <AccessControlComponent size={700}/>
];
const AccessControlPage = (props) =>{
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "accessControl" userData = {props.userData}/>
        </Grid>
    )
}
export default AccessControlPage;