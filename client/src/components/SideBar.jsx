import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import PrimarySearchAppBar from "./Header";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RestoreIcon from '@mui/icons-material/Restore';
import BasicModal from "./Modal";
import MultipleSelectPlaceholder from "./DropDownList";
import Stack from '@mui/material/Stack';
import LoadingButtons from "./LoadingButton";
import ColorRadioButtons from "./CreateSnapshot";

const drawerWidth = 240;
const photoIcon = <PhotoCameraIcon style={{ float:"right", marginLeft:"30px"}}/>
const snapshotToggle = <ColorRadioButtons/>

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


export default function MiniDrawer(props) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex'}}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="black"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 0,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <PrimarySearchAppBar profileData = {props.profileData}/>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />

                <List>
                {['Drive Storage'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 1.5,
                                    backgroundColor: open ? "#E1E1E1" : '' , 
                                }}
                            >
                                <ListItemText primaryTypographyProps={{fontSize: '15px'}}  primary={text} sx={{  opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    
                    {['Google Drive', 'OneDrive'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        opacity: open ? 1 : 0
                                    }}
                                >
                                    {index % 2 === 0 ? <img src={"/img/googledrive.png"} width="18dp" height="18dp" /> : <img src={"/img/onedrive.jpg"} width="28dp" height="20dp"/>}
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{fontSize: '15px'}} 
 primary={text} sx={{ opacity: open ? 1 :0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                {['Analysis'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ pt : 1, display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 1.5,
                                    backgroundColor: open ? "#E1E1E1" : '' , 
                                }}
                            >
                                <ListItemText primaryTypographyProps={{fontSize: '15px'}}  primary={text} sx={{  opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                <List>
                    {['Redundant Sharing', 'Deviant Sharing', 'File-folder Sharing Differences', 'Sharing changes'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 1.5,
                                }}
                            >
                                <ListItemText primaryTypographyProps={{fontSize: '15px'}}  primary={text} sx={{  opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                {/*Need to get data and fix it*/}
                <Typography>Google Drive &emsp;&emsp;CSE416 {'>'} HomeWorkSubmission
                    <MultipleSelectPlaceholder />
                    <IconButton aria-label="delete"style={{float:"right", padding:"5px", marginLeft:"30px", marginRight:"30px"}}>
                        <RestoreIcon/>
                    </IconButton>
                    <BasicModal icon={ photoIcon} title={"Create Snapshot"} contents={snapshotToggle}/>
                </Typography><hr/>

                {/*Here to Start flexible components*/}
                {props.type === "home" ?

                    <Box component="main" sx={{ flexGrow: 1, p: 3 }} style={{display:"inline-flex"}}>
                        {
                            props.components.map((element)=>(
                                element
                            ))
                        }
                    </Box>
                    :
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        {
                            props.components.map((element) => (
                                element
                            ))
                        }
                    </Box>
                }
            </Box>
        </Box>
    );
}
