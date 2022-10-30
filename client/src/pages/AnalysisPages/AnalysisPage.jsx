import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";


const Anaylysis = (props) =>{
    const sharingInfo= [

    ];
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "analysis" userData = {props.userData}/>
        </Grid>
    )
}
export default Anaylysis;