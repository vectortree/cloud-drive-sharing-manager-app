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
    return (
        <Card sx={{ width: 2/6, height:1}} style={{position:"fixed",right:"0px"}}>
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
                    File Type : {file.type}<br/>
                    File Size : {file.fileSize}<br/>
                    AccessPermission :{file.accessPermission}<br/>
                    sharing: {file.sharing}<br/>
                    owner:{file.owner}<br/>
                </Typography>
            </CardContent>
        </Card>
    );
}