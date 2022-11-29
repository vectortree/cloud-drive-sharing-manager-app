import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {useRecoilState} from "recoil";
import {fileSortingData} from "../recoil";

const ITEM_HEIGHT = 46;
const ITEM_PADDING_TOP = 0;


const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

export default function MultipleSelectPlaceholder(props) {
    const [ResetSortingData, setResetSortingData] = useRecoilState(fileSortingData);

    const handleChange = (event) => {
        setResetSortingData(event.target.value)
        console.log(ResetSortingData)
    };
    
    return (
        <>
            <FormControl  size="small"  sx={{ p:0, m: 0, width: 200, mt: 0}} style={{paddingLeft:"20px"}}>
                <Select
                    required
                    value={ResetSortingData}
                    onChange={handleChange}
                    MenuProps={MenuProps}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{ p:0, m: 0, width: 200, mt: 0}}
                    style={{padding:0}}
                >
                    <MenuItem disabled value="" style={{padding:0}}>
                        <em>Sorted By</em>
                    </MenuItem>
                    <MenuItem value = {"name"}>File Name</MenuItem>
                    <MenuItem value = {"size"}>File Size </MenuItem>
                    <MenuItem value = {"createdTime"}>Created Time </MenuItem>
                    <MenuItem value = {"modifiedTime"}>Modified Time </MenuItem>
                    <MenuItem value = {"owner"}>Owner </MenuItem>
                </Select>
            </FormControl>
        </>
    );
}
