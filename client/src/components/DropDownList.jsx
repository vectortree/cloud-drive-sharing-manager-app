import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 0;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const names = [
    'Current Snapshot : Group1-snapshot1-101',
    'Current Snapshot : Group1-snapshot1-102',
    'Current Snapshot : Group1-snapshot1-103',
    'Current Snapshot : Group1-snapshot1-104',
    'Current Snapshot : Group2-snapshot1-106',
    'Current Snapshot : Group2-snapshot1-109',
];

function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

export default function MultipleSelectPlaceholder() {
    const theme = useTheme();
    const [personName, setPersonName] = React.useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setPersonName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <>
            <FormControl  size="small"  sx={{ p:0, m: 0, width: 430, mt: 0}} style={{float:"right", padding:"0px"}}>
                <Select
                    multiple
                    displayEmpty
                    value={personName}
                    onChange={handleChange}
                    input={<OutlinedInput style={{padding:0}}/>}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return "Current Snapshot";
                        }

                        return selected.join(', ');
                    }}
                    MenuProps={MenuProps}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{ p:0, m: 0, width: 430, mt: 0}}
                    style={{padding:0}}
                >
                    <MenuItem disabled value="" style={{padding:0}}>
                        <em>Current Snapshot</em>
                    </MenuItem>
                    {names.map((name) => (
                        <MenuItem
                            key={name}
                            value={name}
                            style={getStyles(name, personName, theme)}
                        >
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
}
