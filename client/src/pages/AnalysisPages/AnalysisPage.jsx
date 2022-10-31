import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AnalysisComponent from "../../components/AnalysisComponent";


const Anaylysis = (props) =>{
    const sharingInfo= [

        <AnalysisComponent text={props.text} userData={props.userData}/>
    ];
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "analysis" userData = {props.userData}/>
        </Grid>
    )
}
export default Anaylysis;