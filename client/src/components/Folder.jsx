import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function MultiActionAreaCard(props) {
    return (
        <Card sx={{ maxWidth: 200 }} style={{marginRight:"30px"}}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="180"
                    width="100"
                    image="/img/folder.png"
                    alt="folderIcon"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.folderList.name}
                    </Typography>
                    <Typography size="small"variant="body2" color="text.secondary">
                        {props.folderList.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
