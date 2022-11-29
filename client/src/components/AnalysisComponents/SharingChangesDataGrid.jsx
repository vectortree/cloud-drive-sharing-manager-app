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

export default function SharingChangesDataGrid(props) {
    let editData = props.girdData.edited;
    let newData = props.girdData.new;
    if(editData == undefined){
        editData = [];
    }
    if(newData == undefined){
        newData = [];
    }
    console.log(editData);
    console.log(newData);
    return (
        <>
            {editData.map( (data) =>{
                return (
                    <Card sx={{ minWidth: 100 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Edit Data
                            </Typography>
                            <Typography variant="h5" component="div">

                                <b>File Info</b> <br/>
                                Drive Name:{data.file.driveName}<br/>
                                File Name: {data.file.name}<br/>
                                File Path: {data.file.path}<br/>
                                <br/>
                                <b>Removed Permission</b> <br/>
                                {data.removedPermissions.map((data) =>{
                                    return( <>
                                        Role: {data.role}<br/>
                                        Type: {data.type}<br/>
                                        Email: {data.value}<br/>
                                    </>)
                                })}
                                <b>Added Permissions</b> <br/>
                                {data.addedPermissions.map((data) =>{
                                    return( <>
                                        Role: {data.role}<br/>
                                        Type: {data.type}<br/>
                                        Email: {data.value}<br/>
                                    </>)
                                })}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small"></Button>
                        </CardActions>
                    </Card>
                )
            })}

            {newData.map( (data) =>{
                return (
                    <Card sx={{ minWidth: 100 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                New Data
                            </Typography>
                            <Typography variant="h5" component="div">

                                Drive Name:{data.file.driveName}<br/>
                                File Name: {data.file.name}<br/>
                                File Path: {data.file.path}<br/>
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