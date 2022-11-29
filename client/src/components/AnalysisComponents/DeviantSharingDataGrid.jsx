import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const bull = (
    <Box
        component="span"
        sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
        •
    </Box>
);

export default function DeviantSharingDataGrid(props) {
    console.log(props.gridData);
    let dataSet = props.gridData;
    if(dataSet[0]){
        if(dataSet[0].differences){
            dataSet = [];
        }
    }
    if(dataSet.edited){
        dataSet = [];
    }

    return (
        <>
            {dataSet.map((data) =>{
                return(
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                DeviantSharing
                            </Typography>
                            <Typography variant="body2" component="div">
                                <b>Drive Name:</b> {data.folder.driveName} <br/>
                                <b>Folder Name:</b> {data.folder.name} &nbsp;<b>Folder Path: </b>{data.folder.path}
                            </Typography>
                            <Typography variant="body2">
                                <hr/>
                                <b>MajorityPermissionSet</b><br/>
                                {data.majorityPermissionSet.files.map((file) =>{
                                    return (
                                        <>
                                            File Name:{file.name}<br/>
                                            File Path:{file.path}<br/><br/>
                                        </>
                                    )
                                })}
                                <br/>
                                <b>Permission Set</b><br/>
                                {data.majorityPermissionSet.permissionSet.map((permission) =>{
                                    return (
                                        <>
                                            Role: {permission.role}<br/>
                                            Type: {permission.type}<br/>
                                            Email:{permission.value}<br/>
                                        </>
                                    )
                                })}
                            </Typography>

                            <Typography variant="body2">
                                <hr/>
                                <b>Minority PermissionSet</b><br/>
                                {data.minorityPermissionSets.map((minority) =>{
                                    return(
                                        <>
                                            {minority.files.map((file) =>{
                                                return (
                                                    <>
                                                        File Name:{file.name}<br/>
                                                        File Path:{file.path}<br/>
                                                    </>
                                                )
                                            })}
                                            <br/>
                                            <b>Permission Set</b><br/>
                                            {minority.permissionSet.map((permission) =>{
                                                return (
                                                    <>
                                                        Role: {permission.role}<br/>
                                                        Type: {permission.type}<br/>
                                                        Email:{permission.value}<br/><br/>
                                                    </>
                                                )
                                            })}
                                        </>
                                    )
                                })}

                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small"></Button>
                        </CardActions>
                    </Card>
                )
            })}

        </>
    );
}