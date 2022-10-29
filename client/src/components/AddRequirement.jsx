import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import BasicButtons from "./Button";

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
const columns = [
    {field: 'Name', headerName: 'Name', type: 'Name', width: 150,},
    {field: 'ReadAccess', headerName: 'RA', type: 'ReadAccess', width: 80,},
    {field: 'WriteAccess', headerName: 'WA', type: 'WriteAccess', width: 80 ,},
    {field: 'DenyReadAccess', headerName: 'DA', type: 'DenyReadAccess', width: 80,},
    {
        field: 'DenyWriteAccess',
        headerName: 'DW',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 80
        // valueGetter: (params) => `${params.row.Name || ''} ${params.row.Name || ''}`,
    }
];
const row =[
    {id: 1 , Name:"Sije",ReadAccess:"O",WriteAccess:"O", DenyReadAccess:"X", DenyWriteAccess:"X"}
]
export default function AddRequirement(props) {
    const [QueryType, setQueryType] = React.useState('');

    const handleChange = (event) => {
        setQueryType(event.target.value);
    };

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
                        defaultValue=""
                    />
                </div>
            </Box>
            <div>
                <h3 style={{margin:"0px"}}>Query Language</h3>
                <div style={{display:"inline-flex"}}>
                <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                    <InputLabel id="demo-select-small">QueryType</InputLabel>
                    <Select
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
                <Search >
                    <SearchIconWrapper >
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>
                    <Button variant="contained" color="secondary" style={{backgroundColor:"lightgray", marginLeft:"10px"}}>
                        Edit
                    </Button>
                    <Button variant="contained" color="success" style={{marginLeft:"10px"}}>
                        Add
                    </Button>
                </div>
            </div>
            <div >
                <h3 style={{margin:"0px"}}>Adding Access Control</h3>
                <div style={{ display:"inline-flex", height: 280, width: '90%'}}>
                    <DataGrid
                        rows={row}
                        columns={columns}
                        pageSize={3}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                    />
                    <Button variant="contained" color="success" style={{marginLeft:"10px", height:"60px", marginTop:"20%"}}>
                        Add
                    </Button>
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
