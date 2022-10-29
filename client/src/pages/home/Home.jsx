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
const folderInfo1 ={
    name: "HW2",
    fileSize:"180MB",
    description:"This is HW2 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}
const folderInfo2 ={
    name: "HW3",
    fileSize:"180MB",
    description:"This is HW3 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}
const folderInfo3 ={
    name: "HW4",
    fileSize:"180MB",
    description:"This is HW4 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}

const sharingInfo= [
    <MultiActionAreaCard folderList={folderInfo}/>,
    <MultiActionAreaCard folderList={folderInfo1}/>,
    <MultiActionAreaCard folderList={folderInfo2}/>,
    <MultiActionAreaCard folderList={folderInfo3}/>,

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