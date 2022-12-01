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
import {fileData, rawFileData, searchHistoryDisplay, searchQueryHistoryData, selectedSnapshot} from "../recoil";
import {id_generator} from "../functions/id_generator";
import CircularProgress from "@mui/material/CircularProgress";
import {deserializeSearchQuery, filterSnapshotBySearchQuery, serializeSearchQuery} from "../functions/query";
import {getClosestGMSnapshots} from "../functions/gm-snapshots";
import {makeFilesForDisplay} from "../functions/snapshot-files";
import {useNavigate} from "react-router-dom";
import {dataRefining} from "../functions/dataRefining";
//import { MuiChipsInput } from 'mui-chips-input'
//import Chip from "@material-ui/core/Chip";

export default function SearchQueryModal(props) {
    const [selectedValue, setSelectedValue] = React.useState('a');
    const [queryString,setQueryString] = React.useState("");
    const [queryStringRQ,setQueryStringRQ] = React.useState([]);
    const [QueryType, setQueryType] = React.useState('');
    const [QueryName, setQueryName] = React.useState('');
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [openError, setOpenError] = React.useState(false);
    const queryArray = ["Drive","Owner","Creator","From","To","Readable","Writable","Sharable","name","inFolder","folder","path","sharing"];
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryHistoryData);
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);
    const [refinedData, setRefinedData] =useRecoilState(fileData);
    const [searchHistory,setSearchHistory] = useRecoilState(searchHistoryDisplay);

    console.log(searchQuery);
    const navigate = useNavigate()
    const handleQueryName = (event) =>{setQueryName(event.target.value);}
    const handleRecentQuery = (event) =>{

        setQueryStringRQ(event.target.value);
        console.log(queryString)
    }
    const addingQuery = (event) => {
        if(QueryType === "" || QueryName == ""){
            handleErrorAlertOpen();
        }else{
            const query = QueryType + ":" + QueryName;
            setQueryStringRQ(query);
            setQueryString([...queryString, query]);
            //setQueryString(query);
            handleSuccessAlertOpen();
        }
    }

    const addingQueryRQ = (event) => {
        setQueryString([...queryString, queryStringRQ]);
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

    const handleChangeRQ = (event) => {
        console.log(event.target.value);
        setQueryStringRQ(event.target.value);};

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
        if(props.userData.fileSharingSnapshots.length ==0){
            alert("you must create a file snapshot first");
        }else{
            let queryStringText =""

            queryString.map((data) =>{
                queryStringText += data;
                return queryStringText;
            })

            console.log(queryStringText);
            const parsedSQ = serializeSearchQuery(queryStringText.trim(), true);
            console.log(parsedSQ);
            if (!parsedSQ.error) {
                const unparsedSQ = deserializeSearchQuery(parsedSQ);
                console.log(unparsedSQ);
                console.log(props.userData);
                let email;
                if (props.userData.driveType === "microsoft")
                    email = props.userData.email;
                else
                    email = props.userData.email;
                let domain = email.substring(email.lastIndexOf("@") + 1);
                let closestGMSnapshots = getClosestGMSnapshots(props.userData.groupMembershipSnapshots, selSnapshot.data);
                let groups = parsedSQ["groups"] ? true : false;
                console.log(groups);
                console.log(selSnapshot);
                const filteredFiles = filterSnapshotBySearchQuery(selSnapshot.data, parsedSQ, email, domain, props.userData.driveType, closestGMSnapshots, groups);
                console.log(filteredFiles);
                const id = id_generator(searchQuery);
                const query ={id: id, searchQuery: parsedSQ};
                console.log(query);
                setSearchQuery( (prev)=>{
                    console.log(prev);
                    return [...prev,query]
                })
                const dataArray = dataRefining([query]);
                console.log(dataArray[0]);
                setSearchHistory( (prev) =>{
                    return [...prev,dataArray[0]]
                })
                api.addSearchQuery(query);
                const arrayData = Array.from(filteredFiles);

                setRefinedData(makeFilesForDisplay(selSnapshot.data,arrayData,props.userData.driveType));
                navigate("/searchResult");
                props.handleClose();
                return;
            }
        }
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
                        <MenuItem value={"drive"}>drive</MenuItem>
                        <MenuItem value={"owner"}>owner</MenuItem>
                        <MenuItem value={"creator"}>creator</MenuItem>
                        <MenuItem value={"from"}>from</MenuItem>
                        <MenuItem value={"to"}>to</MenuItem>
                        <MenuItem value={"readable"}>readable</MenuItem>
                        <MenuItem value={"writable"}>writable</MenuItem>
                        <MenuItem value={"sharable"}>sharable</MenuItem>
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
                        value={queryStringRQ}
                        label="Recent Query"
                        onChange={handleRecentQuery}
                        style={{ width: 600 }}
                    >
                        {console.log(searchQuery)}
                        {searchQuery.map((data,idx)=>{
                            let searchQueryText;
                            if(data.searchQuery.argument){
                                searchQueryText = data.searchQuery.operator + ":" + data.searchQuery.argument;
                            }
                            console.log(searchQueryText);
                          return <MenuItem value={searchQueryText} >{searchQueryText}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQueryRQ}>
                        Add
                    </Button>
                    <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                        <InputLabel id="demo-select-small">Operator</InputLabel>
                        <Select
                            required
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={queryStringRQ}
                            label="Operator"
                            onChange={handleRecentQuery}
                            style={{ width: 600 }}
                        >
                            <MenuItem value={" and "}>and</MenuItem>
                            <MenuItem value={" or "}>or</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQueryRQ}>
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
