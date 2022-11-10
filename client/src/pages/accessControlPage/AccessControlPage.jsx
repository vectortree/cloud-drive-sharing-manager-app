import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AccessControlComponent from "../../components/AccessControlComponent";
import {userData} from "../../App";
import {useRecoilState} from "recoil";
import {AccessControlData} from "../../recoil";


const AccessControlPage = (props) =>{
    const [ACR, setACR]=useRecoilState(AccessControlData);

    const ACR_object = JSON.parse(ACR);
    const sharingInfo= [
        <AccessControlComponent size={700} ACR_data={ACR_object} />
    ];
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "accessControl" userData = {userData}/>
        </Grid>
    )
}
export default AccessControlPage;