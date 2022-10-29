import * as React from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import TextField from "@mui/material/TextField";
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));


export default function AddRequirement(props) {
    let indexId = 1;
    const [QueryType, setQueryType] = React.useState('');
    const [QueryName, setQueryName] = React.useState('');
    const [requirementName,setRequirementName] =React.useState('');
    const [addPersonName,setAddPersonName] =React.useState('');
    const [DataState, setDataState] = React.useState(
        [
            {id: indexId , Type:"Group", Name:"Sije",ReadAccess:true,WriteAccess:false, DenyReadAccess:true, DenyWriteAccess:false}
        ]
    );
    const [queryString,setQueryString] = React.useState('');
    const addingQuery = (event) => {
        const query = QueryType + ":" + QueryName;
        console.log(query);
        setQueryString(query);
    }
    const handleQueryName = (event) =>{setQueryName(event.target.value);}
    const handleRequirmentName = (event) =>{setRequirementName(event.target.value);}
    const handleAddPersonName = (event) =>{setAddPersonName(event.target.value);}
    const handleChange = (event) => {setQueryType(event.target.value);};
    const handleAddPerson = (event) =>{
        setDataState((prevRows) => {
            // const newData = prevRows.find((row) => row.id === indexId);
            return [...prevRows, {id: {indexId} , Name:{addPersonName} ,ReadAccess:false,WriteAccess:false}];
        });
    }

    // const {
    //     name,
    //     searchQuery,
    //     allowedReaders,
    //     allowedWriters,
    //     deniedReaders,
    //     deniedWriters } = req.body;
    const deleteUser = React.useCallback(
        (id) => () => {
            setTimeout(() => {
                setDataState((prevRows) => prevRows.filter((row) => row.id !== id));
            });
        },
        [],
    );

    const toggleAdmin = React.useCallback(
        (id) => () => {
            setDataState((prevRows) =>
                prevRows.map((row) =>
                    row.id === id ? { ...row, isAdmin: !row.isAdmin } : row,
                ),
            );
        },
        [],
    );

    const duplicateUser = React.useCallback(
        (id) => () => {
            setDataState((prevRows) => {
                const rowToDuplicate = prevRows.find((row) => row.id === id);
                return [...prevRows, { ...rowToDuplicate, id: Date.now() }];
            });
        },
        [],
    );

    const handleSubmit = (event) =>{
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }
    const columns = [
        {field: 'Type', headerName: 'Type', width: 150,editable: true,sortable: true},
        {field: 'Name', headerName: 'Name', width: 150,editable: true,sortable: true},
        {field: 'ReadAccess', headerName: 'Read Allow', width: 130,type:"boolean",sortable: true,editable: true,},
        {field: 'WriteAccess', headerName: 'Wright Allow', width: 130 ,type:"boolean",editable: true,sortable: true,},
        // {field: 'DenyReadAccess', headerName: 'DA', width: 80,type:"boolean",editable: true,sortable: true,},
        // {
        //     field: 'DenyWriteAccess',
        //     headerName: 'DW',
        //     type:"boolean",
        //     sortable: true,
        //     width: 80
        //     // valueGetter: (params) => `${params.row.Name || ''} ${params.row.Name || ''}`,
        // },
        {
            field: 'actions',
            type: 'actions',
            width: 80,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={deleteUser(params.id)}
                />,
                <GridActionsCellItem
                    icon={<SecurityIcon />}
                    label="Toggle Admin"
                    onClick={toggleAdmin(params.id)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<FileCopyIcon />}
                    label="Duplicate User"
                    onClick={duplicateUser(params.id)}
                    showInMenu
                />,
            ],
        },
    ];
    return (
        <div>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}

                autoComplete="off"
            >
                <div>
                    <TextField
                        required
                        id="outlined-required"
                        label="Requirement Name"
                        defaultValue={requirementName}
                        onChange={handleRequirmentName}
                    />
                </div>
            </Box>
            <div>
                <h3 style={{margin:"0px"}}>Query Language</h3>
                <div style={{display:"inline-flex"}}>
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
                        <MenuItem value={"Groups"}>Groups</MenuItem>
                        <MenuItem value={"Owner"}>Owner</MenuItem>
                        <MenuItem value={"Folder"}>Folder</MenuItem>
                    </Select>
                </FormControl>
                    <TextField
                        required
                        id="standard-required"
                        label="Name"
                        defaultValue={QueryName}
                        onChange={handleQueryName}
                        variant="standard"
                    />
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQuery}>
                        Add
                    </Button>
                </div>
                <div style={{fontWeight: 500}}>
                    <i>Expected Query String</i> => <b style={{color:"red"}}>{queryString}</b>
                </div>
            </div>
            <div >
                <h3 style={{margin:"0px"}}>Adding Access Control</h3>
                <div style={{ display:"inline-flex", height: 280, width: '90%'}}>

                    <DataGrid
                        rows={DataState}
                        columns={columns}
                        pageSize={3}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                        disableSelectionOnClick
                        experimentalFeatures={{ newEditingApi: true }}
                    />
                </div>
            </div>
            <div>
                <Button variant="contained" color="success" style={{marginLeft:"10px", marginTop:"10px"}}>
                    Submit
                </Button>
            </div>
        </div>
    );
}
