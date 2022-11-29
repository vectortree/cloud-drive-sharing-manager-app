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
    const editData = props.girdData.edited;
    const newData = props.girdData.new;
    console.log(editData);
    console.log(newData);
    return (
        <>
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Edit Data
                </Typography>
                <Typography variant="h5" component="div">

                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">

                </Typography>
                <Typography variant="body2">

                    <br />
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small"></Button>
            </CardActions>
        </Card>
    <Card sx={{ minWidth: 275 }}>
        <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                New Data
            </Typography>
            <Typography variant="h5" component="div">

            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">

            </Typography>
            <Typography variant="body2">

                <br />

            </Typography>
        </CardContent>
        <CardActions>
            <Button size="small"></Button>
        </CardActions>
    </Card>
    </>
    );
}