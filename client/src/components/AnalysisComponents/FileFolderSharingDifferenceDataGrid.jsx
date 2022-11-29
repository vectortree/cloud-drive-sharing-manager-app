import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));


function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}

BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};

export default function FileFolderSharingDifferenceDataGrid(props) {
    console.log(props.gridData);
    let dataSet = props.gridData;
    if(dataSet[0]){
        if(dataSet[0].minorityPermissionSets){
            dataSet = [];
        }
    }
    const [open, setOpen] = React.useState(false);
    const [openIndex, setOpenIndex] = React.useState(0);
    const handleClickOpen = (id) => {
        setOpen(true);
        setOpenIndex(id);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const columns = [
        { field: 'id', headerName: 'ID', width: 10 },
        {
            field: 'driveName',
            headerName: 'Drive Name',
            width: 150,
        },
        {
            field: 'folderName',
            headerName: 'Folder Name',
            width: 120,
        },
        {
            field: 'folderPath',
            headerName: 'Folder Path',
            width: 250,
            align:"left",
        },
        {
            field: 'fileName',
            headerName: 'File Name',
            description: 'This column has a value getter and is not sortable.',
            width: 250,
            valueGetter: (params) =>
                `${params.row.fileName || ''} ${params.row.folderName || ''}`,
        },
        {
            field: 'filePath',
            headerName: 'File Path',
            width: 250,
        },
        {
            headerName: 'Differences',
            width: 250,
            renderCell: (params) => (
                <strong>
                    {params.value}
                    <Button
                        variant="outlined"
                        size = 'small'
                        sx={{ color : "black" }}
                        onClick={()=>{handleClickOpen(params.id)}}
                    >
                        Check Permission
                    </Button>
                </strong>
            )
        }
    ];

    let formatedData =[];
    let index = 1;
    for(let i = 0; i < dataSet.length; i++){
        for(let j = 0; j < dataSet[i].differences.length; j++){
            let obj ={}
            obj.id = index++;
            obj.folderName = dataSet[i].folder.name;
            obj.driveName = dataSet[i].folder.driveName;
            obj.folderPath = dataSet[i].folder.path;
            obj.fileName = dataSet[i].differences[j].file.name;
            obj.filePath = dataSet[i].differences[j].file.path;
            obj.permissions = dataSet[i].differences[j].permissions;
            formatedData.push(obj);
        }
    }
    console.log(formatedData);
    return (
        <>
        <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid
                rows={formatedData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
            />
        </Box>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                Permission Violation
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>
                    {formatedData[openIndex] == undefined ?
                    "": formatedData[openIndex].permissions.map((val)=>{
                                return <p>Role:{val.role} / Type:{val.type} / Email: {val.value}</p>})

                    }

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Checked
                </Button>
            </DialogActions>
        </BootstrapDialog>
        </>
    );
}