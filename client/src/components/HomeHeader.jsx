import * as React from 'react';
import Typography from "@mui/material/Typography";
import MultipleSelectPlaceholder from "./DropDownList";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import BasicModal from "./Modal";
import ColorRadioButtons from "./CreateSnapshot";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";


export default function HomeHeader(props) {
    return (
        <>
            <Typography>{props.userData.driveType == "microsoft" ? "One":"Google"}Drive&emsp;&emsp;
                <MultipleSelectPlaceholder userData={props.userData} snapshot={props.snapShotData}/>
                <Button onClick={props.handleOpenModal} style={{float: "right"}}>
                    <PhotoCameraIcon style={{ float:"right", marginLeft:"30px"}}/>
                </Button>
                <BasicModal open={props.openModal} handleClose={props.handleCloseModal} title={"Create Snapshot"} >
                    <ColorRadioButtons onClick={props.handleCloseModal} dataSet={props.userData}/>
                </BasicModal>
            </Typography>
            <hr/>
        </>
    );
}