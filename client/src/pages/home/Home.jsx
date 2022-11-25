import {Grid} from "@mui/material"
import React from "react";
import {useEffect} from "react";
import MiniDrawer from "../../components/SideBar"
import {useRecoilState, useSetRecoilState} from "recoil";
import {
    AccessControlData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData,
    searchQueryHistoryData
} from "../../recoil";


const file1 ={
    name: "HW2",
    type: "file",
    fileSize:"180MB",
    description:"This is HW2 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}
const file2 ={
    name: "HW3",
    type: "file",
    fileSize:"180MB",
    description:"This is HW3 File",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}
const file3 ={
    name: "HW4",
    type: "file",
    fileSize:"180MB",
    description:"This is HW4 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu"
}
const folder2 ={
    name: "CSE390",
    fileSize:"180MB",
    type:"folder",
    description:"This is HW1 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu",
    decendent:[],
}
const folder1 ={
    name: "HW1",
    fileSize:"180MB",
    type:"folder",
    description:"This is HW1 Folder",
    accessPermission:"read and write",
    sharing:["sije.park@stonybrook.edu"],
    owner:"sije.park@stonybrook.edu",
    decendent:[file1,file2,file3,folder2],
}
const dataList = [file1,file2,file3,folder1,folder2]

const Home = (props) =>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    const [FileSharing, setFileSharing] = useRecoilState(FileSharingSnapShotData);
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [SearchQuery,setSearchQuery] = useRecoilState(searchQueryHistoryData);
    useEffect(() => {
        setACR(props.userData.accessControlRequirements);
        setFileSharing(props.userData.fileSharingSnapshots);
        setGroupSharing(props.userData.groupMembershipSnapshots);
        setSearchQuery(props.userData.searchQuery);
    },[]);
    console.log(FileSharing)
    //let  current_snapshot = FileSharing.length-1
    //console.log(FileSharing[current_snapshot])

    return (
        <Grid>
            <MiniDrawer components={dataList} type = "home" userData = {props.userData}/>
        </Grid>
    )
}
export default Home;