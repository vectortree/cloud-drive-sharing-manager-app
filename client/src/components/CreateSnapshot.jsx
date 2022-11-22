import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useContext } from 'react';
import { AuthContext } from '../auth/auth';
import api from '../api/api';
import {id_generator} from "../functions/id_generator";
import {FileSharingSnapShotData} from "../recoil";
import {useRecoilState} from "recoil";

export default function ColorRadioButtons(props) {
    const [selectedValue, setSelectedValue] = React.useState('a');
    const [FileSharingSnapShot, setFileSharingSnapShotData] = useRecoilState(FileSharingSnapShotData);
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleCreateFileSnapshot = () => {
        let id =id_generator(props.dataSet.fileSharingSnapshots);
        let obj = {id:id};
        api.createFileSharingSnapshot(obj);
        if(props.onClick) props.onClick()
    }

    const controlProps = (item) => ({
        checked: selectedValue === item,
        onChange: handleChange,
        value: item,
        name: 'color-radio-button-demo',
        inputProps: { 'aria-label': item },
    });

    return (
        <div>
            <h3>Snapshot Type</h3>
            <div>
            <Radio {...controlProps('c')} color="success" checked />
                Take file sharing snapshot
            </div>
            <br/><br/>
            <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={handleCreateFileSnapshot}>
                Submit
            </Button>
        </div>
    );
}
