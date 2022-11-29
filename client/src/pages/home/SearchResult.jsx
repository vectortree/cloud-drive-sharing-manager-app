import {Grid} from "@mui/material"
import React from "react";
import {useEffect} from "react";
import MiniDrawer from "../../components/SideBar"
import {useRecoilState, useSetRecoilState} from "recoil";
import {
    AccessControlData, fileData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData,
    searchQueryHistoryData, selectedSnapshot
} from "../../recoil";
import {makeFilesForDisplay} from "../../functions/snapshot-files";

const SearchResult = (props) =>{

    const [refinedData, setRefinedData] =useRecoilState(fileData);
    console.log(refinedData);
    const flexibleData = [];
    for(let i = 0; i < refinedData.length; i++){
        flexibleData.push(refinedData[i])
    }

    return (
        <Grid>
            <MiniDrawer components={flexibleData} type = "home" updateAllow={true} userData = {props.userData}/>
        </Grid>
    )
}
export default SearchResult;