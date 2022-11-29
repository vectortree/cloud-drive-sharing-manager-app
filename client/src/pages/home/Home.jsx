import {Grid} from "@mui/material"
import React from "react";
import {useEffect} from "react";
import MiniDrawer from "../../components/SideBar"
import {useRecoilState, useSetRecoilState} from "recoil";
import {
    AccessControlData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData,
    searchQueryHistoryData, selectedSnapshot
} from "../../recoil";
import {makeFilesForDisplay} from "../../functions/snapshot-files";

const Home = (props) =>{
    const [ACR, setACR]=useRecoilState(AccessControlData);
    const [FileSharing, setFileSharing] = useRecoilState(FileSharingSnapShotData);
    const [GroupSharing,setGroupSharing] = useRecoilState(GroupMembershipSnapshotsData);
    const [SearchQuery,setSearchQuery] = useRecoilState(searchQueryHistoryData);
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);
    useEffect(() => {
        setSelSnapshot(
            props.userData.fileSharingSnapshots.length === 0 ?
                {data:[]}
                :selSnapshot.data.length > 0 ?
                    selSnapshot : props.userData.fileSharingSnapshots[props.userData.fileSharingSnapshots.length-1]
        );
        setACR(props.userData.accessControlRequirements);
        setFileSharing(props.userData.fileSharingSnapshots);
        setGroupSharing(props.userData.groupMembershipSnapshots);
        setSearchQuery(props.userData.searchQueryHistory);
    },[])

    const fileData = makeFilesForDisplay(selSnapshot.data,selSnapshot.data,props.userData.driveType);
    console.log(fileData);
    return (
        <Grid>
            <MiniDrawer components={fileData} type = "home" updateAllow={false} userData = {props.userData}/>
        </Grid>
    )
}
export default Home;