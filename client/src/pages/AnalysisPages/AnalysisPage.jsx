import {Grid} from "@mui/material"
import React from "react";
import MiniDrawer from "../../components/SideBar";
import AnalysisComponent from "../../components/AnalysisComponent";
import {useRecoilState} from "recoil";
import {
    AccessControlData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData,
    searchQueryHistoryData, selectedSnapshot
} from "../../recoil";
import {useEffect} from "react";


const Anaylysis = (props) =>{
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