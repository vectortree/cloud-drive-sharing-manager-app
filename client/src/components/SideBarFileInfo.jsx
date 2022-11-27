import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useRecoilState} from "recoil";
import {FileSelectedData} from "../recoil";

export default function SideBarFileInfo() {
    const [file, setFile] = useRecoilState(FileSelectedData);
    console.log(file);
    return (
        <Card sx={{ width: 1/4, height:1}} style={{position:"fixed",right:"0px"}}>
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
                    {file.description}<br/>
                        File Type : {file.folder == undefined ? "file" : "folder"}<br/>
                    File Size : {file.size}<br/>
                    AccessPermission :{
                    file.file == undefined ?
                        file.permissions.value.map( (data,idx) =>{
                            let name = "";
                            if(data.grantedToIdentities){
                                if(data.grantedToIdentities[0] != undefined){
                                    name = data.grantedToIdentities[0].user.displayName
                                }
                            }
                            return (
                                name
                            )
                        })
                        :
                        file.permission.value.map( (data,idx) =>{
                            let name = "";
                            if(data.grantedTo.user){
                                name = data.grantedTo.user.displayName
                            }
                            return (
                                name
                            )
                        })

                    }<br/>
                    Sharing: {file.shared == undefined ? "User Only": file.shared.scope}<br/>
                    Owner:{file.createdBy.user.displayName}<br/>
                </Typography>
            </CardContent>
        </Card>
    );
}