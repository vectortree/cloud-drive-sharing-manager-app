import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useRecoilState} from "recoil";
import {FileSelectedData} from "../recoil";
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function SideBarFileInfo() {
    const [file, setFile] = useRecoilState(FileSelectedData);
    const [open, setOpen] = React.useState(false);
    const [openInherit, setOpenInherit] = React.useState(false);

    const handleClickOpen = () => {setOpen(true);};
    const handleClose = () => {setOpen(false);};

    const handleClickOpenInherit = () => {setOpenInherit(true);};
    const handleCloseInherit = () => {setOpenInherit(false);};

    return (
        <Card sx={{ width: 1/4, height:1}} style={{position:"fixed",right:"0px", overflow: "scroll", height : "600px"}}>
            <CardMedia
                component="img"
                alt="green iguana"
                height="140"
                image="/img/folder.png"
                style={{width:"auto", marginLeft: "auto", marginRight: "auto"}}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {/*{file.description}<br/>*/}
                    {/*File Type : {file.folder == undefined ? "file" : "folder"}<br/>*/}
                    <b>Size: </b>{file.size}<br/>
                    <b>Direct Permissions: </b>
                    <Button variant="outlined" onClick={handleClickOpen}>
                        <AvatarGroup total={file.permissions.direct.length}>
                            {file.permissions.direct.length > 0 ?
                                <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                                :
                                ""
                            }
                        </AvatarGroup>
                    </Button>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Direct Permissions"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {file.permissions.direct.map((userData) =>{
                                    return (
                                        <>
                                            <p>Role: {userData.role}, Type: {userData.type}, Value: {userData.value}</p>
                                        </>
                                    )
                                })}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <br/>
                    {/*Inherited Access Permission*/}
                    <b>Inherited Permissions: </b>
                    <Button variant="outlined" onClick={handleClickOpenInherit}>
                        <AvatarGroup total={file.permissions.inherited.length}>
                            {file.permissions.inherited.length > 0 ?
                                <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                                :
                                ""
                            }
                        </AvatarGroup>
                    </Button>
                    <Dialog
                        open={openInherit}
                        onClose={handleCloseInherit}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Inherited Permissions"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {file.permissions.inherited.map((userData) =>{
                                    return (
                                        <>
                                            <p>Role: {userData.role}, Type: {userData.type}, Value: {userData.value}</p>
                                        </>
                                    )
                                })}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseInherit} autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/*Sharing: {file.shared == undefined ? "User Only": file.shared.scope}<br/>*/}
                    <b>Owner: </b>{file.owner}<br/>
                    <b>Link: </b><a href={file.link} target="_blank">Access</a><br/>
                    <b>Created Time:</b>{file?.createdTime?.toLocaleString()}<br/>
                    <b>Modified Time:</b>{file.modifiedTime}<br/>
                    <b>Last Modifying User:</b>{file.lastModifyingUser}<br/>
                    <b>Drive Name: </b>{file.driveName}<br/>
                    <b>Location: </b>{file.location}<br/>
                </Typography>
            </CardContent>
        </Card>
    );
}