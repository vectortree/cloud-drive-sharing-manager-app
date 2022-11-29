import * as React from 'react';
import { DataGrid, GridActionsCellItem, GridCellModes } from '@mui/x-data-grid';
import TextField from "@mui/material/TextField";
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PropTypes from 'prop-types';
import {createAccessControlRequirement} from "../api/api";
import {id_generator} from "../functions/id_generator";
import { serializeSearchQuery } from '../functions/query';
import {useRecoilState} from "recoil";
import {selectedSnapshot} from "../recoil";

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

    //State
    const [QueryType, setQueryType] = React.useState('');
    const [QueryName, setQueryName] = React.useState('');
    const [requirementName,setRequirementName] =React.useState('');
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [openError, setOpenError] = React.useState(false);
    const [openQueryError, setOpenQueryError] = React.useState('');
    const [DataState, setDataState] = React.useState([]);
    const [queryString,setQueryString] = React.useState('');
    const [selectedCellParams, setSelectedCellParams] = React.useState(null);
    const [cellModesModel, setCellModesModel] = React.useState({});
    const [snackbar, setSnackbar] = React.useState(null);

    //Handler
    const handleCloseSnackbar = () => setSnackbar(null);
    const handleQueryName = (event) =>{setQueryName(event.target.value);}
    const handleRequirementName = (event) =>{setRequirementName(event.target.value);}
    const handleChange = (event) => {setQueryType(event.target.value);};
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
    const handleQueryErrorAlertOpen = (err) => {setOpenQueryError(err);};
    const handleQueryErrorAlertClose = (event,reason) =>{
        if (reason === 'clickaway') return;
        setOpenQueryError(false);
    }
    const addingQuery = (event) => {
        if(QueryName == ""){
            handleErrorAlertOpen();
        }else{
            const query = QueryName;
            let sq = serializeSearchQuery(query, true);
            if(sq.error) handleQueryErrorAlertOpen(sq.error);
            else {
                setQueryString(query);
                handleSuccessAlertOpen();
            }
        }
    }
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
                        return [...prevRows, {id: prevRows.length, Email: "", ReadAccess: false, WriteAccess: false, DenyReadAccess: false, DenyWriteAccess: false}];
                    });
            }

    const deleteUser = (id) => {
            console.log(id);
            setTimeout(() => {
                setDataState((prevRows) => prevRows.filter((row) => row.id !== id));
            });
        }
    const submit = () =>{
        console.log(DataState);
        if(requirementName ==='' || DataState.length === 0 || QueryName === '')
        {
            setOpenError(true);
        }else{
            setOpenSuccess(true);
            let allowedReaderArray =[];
            let allowedWriter =[];
            let DenyReadAccess =[];
            let DenyWriteAccess =[];
            console.log(DataState);
            let flag = 0;
            for( let i = 0; i < DataState.length; i++){
                if(DataState[i].ReadAccess == true){
                    allowedReaderArray.push(DataState[i].Email);
                    flag = 1;
                }
                if(DataState[i].WriteAccess == true){
                    allowedWriter.push(DataState[i].Email);
                    flag = 1;
                }
                if(DataState[i].DenyReadAccess == true){
                    DenyReadAccess.push(DataState[i].Email);
                    flag = 1;
                }
                if(DataState[i].DenyWriteAccess == true){
                    DenyWriteAccess.push(DataState[i].Email);
                    flag = 1;
                }
            }
            if (flag == 0){
                handleErrorAlertOpen();
                return;
            }
            console.log(DataState);
            const query = QueryName;
            const parsedSQ = serializeSearchQuery(query, true);
            const group = parsedSQ["groups"] ? true : false;
            let id =id_generator(props.opdataSet);
            const accessControlData = {
                id: id,
                name: requirementName,
                searchQuery: parsedSQ,
                group: group,
                allowedReaders:allowedReaderArray,
                allowedWriters: allowedWriter,
                deniedReaders: DenyReadAccess,
                deniedWriters: DenyWriteAccess
            };
            console.log(accessControlData);
            createAccessControlRequirement(accessControlData);
            props.ACR_Handler(accessControlData);

            props.onClick();
        }
    }
    const mutateRow = useFakeMutation();
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

    const columns = [
        {field: 'Email', headerName: 'Email', width: 250,editable: true,sortable: true,},
        {field: 'ReadAccess', headerName: 'AR', width: 80,type:"boolean",sortable: true,editable: true,},
        {field: 'WriteAccess', headerName: 'AW', width: 80 ,type:"boolean",editable: true,sortable: true,},
        {field: 'DenyReadAccess', headerName: 'DR', width: 80,type:"boolean",sortable: true,editable: true,},
        {field: 'DenyWriteAccess', headerName: 'DW', width: 80 ,type:"boolean",editable: true,sortable: true,},
        {field: 'actions', type: 'actions', width: 80, headerName: <AddCircleOutlineIcon onClick={handleAddPerson}/>,
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
                <h3 style={{margin:"0px"}}>Search Query</h3>
                <div style={{display:"inline-flex"}}>
                <TextField
                    required
                    id="standard-required"
                    style={{marginLeft:"10px"}}
                    label="Argument"
                    defaultValue={QueryName}
                    onChange={handleQueryName}
                    variant="standard"
                />
                <Button variant="contained" color="success" style={{marginLeft:"10px"}} onClick={addingQuery}>
                    Enter Query
                </Button>
                </div>
                <br/><br/>
                <div style={{fontWeight: 500}}>
                    <b style={{color:"blue"}}>{queryString}</b>
                </div>
                <br/>
            </div>
            <div >
                <h3 style={{margin:"0px"}}>Adding Access Control Requirement</h3>
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
                <Button variant="contained" color="success" style={{marginLeft:"10px", marginTop:"10px"}} onClick={submit}>
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
                    Successfully created a query!
                </Alert>
            </Snackbar>
            <Snackbar open={openQueryError} autoHideDuration={2000} onClose={handleQueryErrorAlertClose}>
                <Alert onClose={handleQueryErrorAlertClose} severity="error" sx={{ width: '100%' }}>
                {openQueryError}
                </Alert>
            </Snackbar>
            <Snackbar open={openError} autoHideDuration={2000} onClose={handleErrorAlertClose}>
                <Alert onClose={handleErrorAlertClose} severity="error" sx={{ width: '100%' }}>
                    Please fill all the required fields. You must check at least one access control set.
                </Alert>
            </Snackbar>
        </div>
    );
}
