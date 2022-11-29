import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {useRecoilState} from "recoil";
import {selectedSnapshot} from "../recoil";

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
    const theme = useTheme();
    const [snapShot, setSnapShot] = React.useState([]);
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSnapShot(
            // On autofill we get a stringified value.
            value.slice(value.length - 1)
        );
    };
    const selectSnapshot = (obj,event) =>{
        console.log(obj);
        setSelSnapshot(obj);
    }
    return (
        <>
            <FormControl  size="small"  sx={{ p:0, m: 0, width: 430, mt: 0}} style={{float:"right", padding:"0px"}}>
                <Select
                    multiple
                    displayEmpty
                    value={snapShot}
                    onChange={handleChange}
                    input={<OutlinedInput style={{padding:0}}/>}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return [selSnapshot.name];
                        }

                        return selected;
                    }}
                    MenuProps={MenuProps}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{ p:0, m: 0, width: 430, mt: 0}}
                    style={{padding:0}}
                >
                    <MenuItem disabled value="" style={{padding:0}}>
                        <em>Select a file-sharing snapshot</em>
                    </MenuItem>
                    {props.userData.fileSharingSnapshots.map((obj) => (
                        <MenuItem
                            key={obj.id}
                            value={obj.name}
                            style={getStyles(obj.name, snapShot, theme)}
                            onClick={()=>selectSnapshot(obj)}
                        >
                            {obj.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
}
