import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import {useRecoilState} from "recoil";
import {searchHistoryDisplay, searchQueryHistoryData} from "../recoil";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function QueryHistoryList(props) {
    const [searchHistory,setSearchHistory] =useRecoilState(searchQueryHistoryData)
    console.log(searchHistory);
    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={2}>
                {searchHistory.map((data) =>{
                    return <p>{data.id}</p>
                })}
            </Stack>
        </Box>
    );
}