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
            <Typography>Google Drive &emsp;&emsp;CSE416 {'>'} HomeWorkSubmission
                <MultipleSelectPlaceholder userData={props.userData}/>
                <IconButton style={{float: "right", padding: "5px", marginLeft: "30px", marginRight: "30px"}}>
                    <RestoreIcon/>
                </IconButton>
                <Button onClick={props.handleOpenModal} style={{float: "right"}}>
                    <PhotoCameraIcon style={{ float:"right", marginLeft:"30px"}}/>
                </Button>
                <BasicModal open={props.openModal} handleClose={props.handleCloseModal} title={"Create Snapshot"}><ColorRadioButtons
                    onClick={props.handleCloseModal}/></BasicModal>
            </Typography>
            <hr/>
        </>
    );
}