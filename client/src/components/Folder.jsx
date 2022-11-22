import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import {useRef, useState} from "react";
import {FileSelectedData} from "../recoil";
import {useRecoilState} from "recoil";

export default function MultiActionAreaCard(props) {
    const [file, setFile] = useRecoilState(FileSelectedData);
    const changeColor = (key,file) =>{
        setFile(file);
    }
    return (
            props.dataList.map((data,idx) => {
                return (
                        <Card sx={{maxWidth: 200}}
                              style={{margin:"0px", marginRight: "10px", borderColor: data.name == file.name ? "blue" : ""}}
                              onClick={() => changeColor(idx,data)}>
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
                                        {data.name}
                                    </Typography>
                                    <Typography size="small" variant="body2" color="text.secondary">
                                        {data.description}

                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                )
            })
    );
}
