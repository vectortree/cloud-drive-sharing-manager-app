import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar"
import Profile from "../../components/Profile";
import ColumnMenuGrid from "../../components/ListsBar";
import MultiActionAreaCard from "../../components/Folder";
const folderInfo ={
    name: "HW1",
    fileSize:"180MB",
    description:"This is HW1 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}

const sharingInfo= [
    <MultiActionAreaCard folderList={folderInfo}/>,
    <MultiActionAreaCard folderList={folderInfo}/>,
    <MultiActionAreaCard folderList={folderInfo}/>,
    <MultiActionAreaCard folderList={folderInfo}/>,

];
const Home = (props) =>{
    console.log("this is home page");
    return (
        <Grid>
            <MiniDrawer components={sharingInfo} type = "home" userData = {props.userData}/>
        </Grid>
    )
}
export default Home;