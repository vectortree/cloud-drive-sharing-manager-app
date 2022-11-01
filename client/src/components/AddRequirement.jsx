import * as React from 'react';
import { DataGrid, GridActionsCellItem, GridCellModes } from '@mui/x-data-grid';
import TextField from "@mui/material/TextField";
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PropTypes from 'prop-types';

function EditToolbar(props) {
    const { selectedCellParams, cellMode, cellModesModel, setCellModesModel } = props;

    const handleSaveOrEdit = () => {
        if (!selectedCellParams) {
            return;
        }
        const { id, field } = selectedCellParams;
        if (cellMode === 'edit') {
            setCellModesModel({
                ...cellModesModel,
                [id]: { ...cellModesModel[id], [field]: { mode: GridCellModes.View } },
            });
        } else {
            setCellModesModel({
                ...cellModesModel,
                [id]: { ...cellModesModel[id], [field]: { mode: GridCellModes.Edit } },
            });
        }
    };

    const handleCancel = () => {
        if (!selectedCellParams) {
            return;
        }
        const { id, field } = selectedCellParams;
        setCellModesModel({
            ...cellModesModel,
            [id]: {
                ...cellModesModel[id],
                [field]: { mode: GridCellModes.View, ignoreModifications: true },
            },
        });
    };

    const handleMouseDown = (event) => {
        // Keep the focus in the cell
        event.preventDefault();
    };

    return (
        <Box
            sx={{
                borderBottom: 1,
                borderColor: 'divider',
                p: 1,
            }}
        >
            <Button
                onClick={handleSaveOrEdit}
                onMouseDown={handleMouseDown}
                disabled={!selectedCellParams}
                variant="outlined"
            >
                {cellMode === 'edit' ? 'Save' : 'Edit'}
            </Button>
            <Button
                onClick={handleCancel}
                onMouseDown={handleMouseDown}
                disabled={cellMode === 'view'}
                variant="outlined"
                sx={{ ml: 1 }}
            >
                Cancel
            </Button>
        </Box>
    );
}

EditToolbar.propTypes = {
    cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
    cellModesModel: PropTypes.object.isRequired,
    selectedCellParams: PropTypes.shape({
        field: PropTypes.string.isRequired,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    }),
    setCellModesModel: PropTypes.func.isRequired,
};

EditToolbar.propTypes = {
    cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
    cellModesModel: PropTypes.object.isRequired,
    selectedCellParams: PropTypes.shape({
        field: PropTypes.string.isRequired,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    }),
    setCellModesModel: PropTypes.func.isRequired,
};

const useFakeMutation = () => {
    return React.useCallback(
        (user) =>
            new Promise((resolve, reject) =>
                setTimeout(() => {
                    console.log(resolve);
                    if (user.name?.trim() === '') {
                        reject(new Error("Error while saving user: name can't be empty."));
                    } else {
                        resolve({ ...user, name: user.name?.toUpperCase() });
                    }
                }, 200),
            ),
        [],
    );
};

export default function AddRequirement(props) {
    const [QueryType, setQueryType] = React.useState('');
    const [QueryName, setQueryName] = React.useState('');
    const [requirementName,setRequirementName] =React.useState('');
    const [addPersonEmail,setAddPersonEmail] =React.useState('');
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [openError, setOpenError] = React.useState(false);
    const [DataState, setDataState] = React.useState(
        [
        ]
    );
    const [queryString,setQueryString] = React.useState('');
    const [selectedCellParams, setSelectedCellParams] = React.useState(null);
    const [cellModesModel, setCellModesModel] = React.useState({});

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
    const addingQuery = (event) => {
        if(QueryType === "" || QueryName == ""){
            handleErrorAlertOpen();
        }else{
            const query = QueryType + ":" + QueryName;
            setQueryString(query);
            handleSuccessAlertOpen();
        }
    }
    const handleQueryName = (event) =>{setQueryName(event.target.value);}
    const handleRequirementName = (event) =>{setRequirementName(event.target.value);}


    const handleChange = (event) => {setQueryType(event.target.value);};
    const handleSavePerson = (newRow) => {
            // deleteUser(newRow);
            console.log(newRow);
            setDataState((prevRows) => {
                const newData = prevRows.map( (row)=> row.id === newRow.id ? newRow : row);
                return newData;
            })
        };

    const handleAddPerson = () => {
                    setDataState((prevRows) => {
                        // const newData = prevRows.find((row) => row.id === newRow.id);
                        return [...prevRows, {id: prevRows.length, Email: "", ReadAccess: false, WriteAccess: false}];
                    });
            }

    const deleteUser = (id) => {
            console.log(id);
            setTimeout(() => {
                setDataState((prevRows) => prevRows.filter((row) => row.id !== id));
            });
        }

    const mutateRow = useFakeMutation();

    const [snackbar, setSnackbar] = React.useState(null);

    const handleCloseSnackbar = () => setSnackbar(null);

    const processRowUpdate = React.useCallback(
        async (newRow) => {
            console.log(newRow);
            handleSavePerson(newRow);
            // Make the HTTP request to save in the backend
            const response = await mutateRow(newRow);
            setSnackbar({ children: 'User successfully saved', severity: 'success' });
            return response;
        },
        [mutateRow],
    );
    const handleProcessRowUpdateError = React.useCallback((error) => {
        setSnackbar({ children: error.message, severity: 'error' });
    }, []);

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

    const handleCellFocus = React.useCallback((event) => {
        const row = event.currentTarget.parentElement;
        const id = row.dataset.id;
        const field = event.currentTarget.dataset.field;
        setSelectedCellParams({ id, field });
    }, []);

    const cellMode = React.useMemo(() => {
        if (!selectedCellParams) {
            return 'view';
        }
        const { id, field } = selectedCellParams;
        return cellModesModel[id]?.[field]?.mode || 'view';
    }, [cellModesModel, selectedCellParams]);

    const handleCellKeyDown = React.useCallback(
        (params, event) => {
            if (cellMode === 'edit') {
                // Prevents calling event.preventDefault() if Tab is pressed on a cell in edit mode
                event.defaultMuiPrevented = true;
            }
        },
        [cellMode],
    );


    const handleSubmit = (event) =>{
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }
    function getFullName() {
        console.log(addPersonEmail);
        return addPersonEmail;
    }

    function writeName(params) {
        console.log("test"+params);
        setAddPersonEmail(params.value.toString());
    }

    function parseFullName(value) {
        return addPersonEmail;
    }

    const columns = [
        {field: 'Email', headerName: 'Email', width: 250,editable: true,sortable: true,},
        {field: 'ReadAccess', headerName: 'Read Allow', width: 130,type:"boolean",sortable: true,editable: true,},
        {field: 'WriteAccess', headerName: 'Wright Allow', width: 130 ,type:"boolean",editable: true,sortable: true,},
        {
            field: 'actions',
            type: 'actions',
            width: 80,
            headerName: <AddCircleOutlineIcon onClick={handleAddPerson}/>,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={()=>deleteUser(params.id)}
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
                        onChange={handleRequirementName}
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
                <br/><br/>
                <div style={{fontWeight: 500}}>
                    Expected Query String : <b style={{color:"red"}}>{queryString}</b>
                </div>
                <br/>
            </div>
            <div >
                <h3 style={{margin:"0px"}}>Adding Access Control</h3>
                <div style={{ display:"inline-flex", height: 280, width: '90%'}}>
                    <DataGrid
                        rows={DataState}
                        columns={columns}
                        onCellKeyDown={handleCellKeyDown}
                        cellModesModel={cellModesModel}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        onCellModesModelChange={(model) => setCellModesModel(model)
                    }
                        components={{
                            Toolbar: EditToolbar,
                        }}
                        componentsProps={{
                            toolbar: {
                                cellMode,
                                selectedCellParams,
                                setSelectedCellParams,
                                cellModesModel,
                                setCellModesModel,
                            },
                            cell: {
                                onFocus: handleCellFocus,
                            },
                        }}
                        experimentalFeatures={{ newEditingApi: true }}
                    />
                </div>
            </div>
            <div>
                <Button variant="contained" color="success" style={{marginLeft:"10px", marginTop:"10px"}}>
                    Submit
                </Button>
            </div>
            {!!snackbar && (
                <Snackbar
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    onClose={handleCloseSnackbar}
                    autoHideDuration={6000}
                >
                    <Alert {...snackbar} onClose={handleCloseSnackbar} />
                </Snackbar>
            )}
            <Snackbar open={openSuccess} autoHideDuration={1000} onClose={handleSuccessAlertClose}>
                <Alert onClose={handleSuccessAlertClose} severity="success" sx={{ width: '100%' }}>
                    Successfully Creating a Query
                </Alert>
            </Snackbar>
            <Snackbar open={openError} autoHideDuration={2000} onClose={handleErrorAlertClose}>
                <Alert onClose={handleErrorAlertClose} severity="error" sx={{ width: '100%' }}>
                    Please filled all the requirements
                </Alert>
            </Snackbar>
        </div>
    );
}
