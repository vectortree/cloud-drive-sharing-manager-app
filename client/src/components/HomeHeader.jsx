import * as React from 'react';
import Typography from "@mui/material/Typography";
import MultipleSelectPlaceholder from "./DropDownList";
import SortingDropDown from "./SortingDropDownList";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import BasicModal from "./Modal";
import ColorRadioButtons from "./CreateSnapshot";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import {useRecoilState} from "recoil";
import {SortingFlag} from "../recoil";


export default function HomeHeader(props) {
    const [sortFlag, setSortFlag] = useRecoilState(SortingFlag);

    const handleSortFlag = () => {
        if(sortFlag == 0){
            setSortFlag(1)
        }
        else{
            setSortFlag(0)
        }
    }

    return (
        <>
            <Typography>
                {props.userData.driveType == "microsoft" ? "One":"Google"}Drive &emsp;&emsp;
            <>
            <Button onClick={handleSortFlag} sx = {{fontSize : "20px", fontWeight: "700" , lineHeight: "1.5"}}>
                    Sorting
                    {sortFlag === 0 ? <KeyboardArrowUpIcon sx = {{color : "red"}} ></KeyboardArrowUpIcon> : <KeyboardArrowDownIcon sx = {{color : "blue"}}> </KeyboardArrowDownIcon>}
                </Button>
            </>
            <SortingDropDown userData={props.userData}/>
            
                <MultipleSelectPlaceholder userData={props.userData} snapshot={props.snapShotData}/>
                <Button onClick={props.handleOpenModal} style={{float: "right"}}>
                    <PhotoCameraIcon style={{ float:"right", marginLeft:"30px", marginRight : "10px" , fontSize: "30px"}}/>
                </Button>
                &emsp;
                <BasicModal open={props.openModal} handleClose={props.handleCloseModal} title={"Create Snapshot"} >
                    <ColorRadioButtons onClick={props.handleCloseModal} dataSet={props.userData}/>
                </BasicModal>
            </Typography>
            <hr/>
        </>
    );
}