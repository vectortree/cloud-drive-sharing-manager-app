import * as React from 'react';
import { pink } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useContext } from 'react';
import { AuthContext } from '../auth/auth';
import api from '../api/api';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {useRecoilState} from "recoil";
import {searchQueryHistoryData} from "../recoil";
import {id_generator} from "../functions/id_generator";
//import { MuiChipsInput } from 'mui-chips-input'
//import Chip from "@material-ui/core/Chip";

export default function SearchQueryModal(props) {
    const [selectedValue, setSelectedValue] = React.useState('a');
    const [queryString,setQueryString] = React.useState([]);
    const [QueryType, setQueryType] = React.useState('');
    const [QueryName, setQueryName] = React.useState('');
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [openError, setOpenError] = React.useState(false);
    const queryArray = ["Drive","Owner","Creator","From","To","Readable","Writable","Sharable","name","inFolder","folder","path","sharing"];
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryHistoryData);

    console.log(searchQuery);
    const handleQueryName = (event) =>{setQueryName(event.target.value);}
    const handleRecentQuery = (event) =>{
        const string = event.target.value;
        const txt = string.split('\"');
        let queryStringBox = queryString;
        for(let i = 1; i < txt.length-1; i++){
            queryStringBox.push(txt[i]);
        }
        setQueryString([...queryString]);
    }
    const addingQuery = (event) => {
        if(QueryType === "" || QueryName == ""){
            handleErrorAlertOpen();
        }else{
            const query = "{" +QueryType + ":" + QueryName + "} ";
            setQueryString([...queryString, query]);
            handleSuccessAlertOpen();
        }
    }

    const handleSuccessAlertOpen = () => {setOpenSuccess(true);};
    const handleSuccessAlertClose = (event, reason) => {
        if (reason === 'clickaway')return;
        setOpenSuccess(false);
    };
    const handleErrorAlertOpen = () => {setOpenError(true);};
    const handleErrorAlertClose = (event,reason) =>{
        if (reason === 'clickaway') return;
        setOpenError(false);
    }

    const handleChange = (event) => {
        console.log(event.target.value);
        setQueryType(event.target.value);};

    const [inputValue, setInputValue] = React.useState('');
    const [chips, setChips] = React.useState([])
    const inputChange = ({target: {value}}) => {setInputValue(value)};
    const handleKeyDown = ({key}) => {
        console.log("check here")
    if(key === 'Enter') {
    setChips([...chips, inputValue])
    }
};
    const submit = () =>{
        const id = id_generator(searchQuery);
        const query = { id: id, searchQuery : queryString}
        console.log(query);
        api.addSearchQuery(query);
        props.handleClose();
    }
    return (
        <div>
            <div>
                <div style={{display:"inline-flex"}}>
                <div style={{fontWeight: 500}}>
                Current query : <b style={{color:"blue"}}>{queryString}</b>
                </div>
            </div>
            <div>    
                <br/>
                <h3 style={{margin:"0px"}}>Query Language</h3>
            </div>
            <div>
                <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                    <InputLabel id="demo-select-small">QueryType</InputLabel>
                    <Select
                        required
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={QueryType}
                        label="QueryType"
                        onChange={handleChange}
                    >
                        <MenuItem value={"Drive"}>drive</MenuItem>
                        <MenuItem value={"Owner"}>owner</MenuItem>
                        <MenuItem value={"Creator"}>creator</MenuItem>
                        <MenuItem value={"From"}>from</MenuItem>
                        <MenuItem value={"To"}>to</MenuItem>
                        <MenuItem value={"Readable"}>readable</MenuItem>
                        <MenuItem value={"Writable"}>writable</MenuItem>
                        <MenuItem value={"Sharable"}>sharable</MenuItem>
                        <MenuItem value={"name"}>name</MenuItem>
                        <MenuItem value={"inFolder"}>inFolder</MenuItem>
                        <MenuItem value={"folder"}>folder</MenuItem>
                        <MenuItem value={"path"}>path</MenuItem>
                        <MenuItem value={"sharing"}>Sharing</MenuItem>

                    </Select>
                </FormControl>
                    <TextField
                        required
                        id="standard-required"
                        label="Query"
                        defaultValue={QueryName}
                        onChange={handleQueryName}
                        variant="standard"
                    />
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQuery}>
                        Add
                    </Button>
                </div>
                <br></br>
            </div>
            <h3 style={{margin:"0px"}}>Recent Query</h3>  
                <div>
                <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                    <InputLabel id="demo-select-small">Recent Query</InputLabel>
                    <Select
                        required
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={QueryType}
                        label="Recent Query"
                        onChange={handleRecentQuery}
                        style={{ width: 600 }}
                    >
                        {searchQuery.map((data,idx)=>{
                            const searchQueryText = JSON.stringify(data.searchQuery);
                          return <MenuItem value={searchQueryText} >{searchQueryText}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQuery}>
                        Add
                    </Button>
            </div>
            <br></br>
            <Button name="submit"variant="contained" color="success" style={{marginLeft:"10px"}} onClick={submit}>
                Submit
            </Button>
        </div>
    );
}
