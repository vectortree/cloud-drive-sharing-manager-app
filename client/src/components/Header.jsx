import * as React from 'react';
import {useContext} from "react"
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { AuthContext } from '../auth/auth';
import axios from "axios";
import api from '../api/api';
import BadgeAvatars from "./WithBadge";
import {useNavigate} from "react-router-dom";
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import SearchQueryModal from "./CreateSearchQuery";
import BasicModal from "./Modal";
import Button from "@mui/material/Button";
import { serializeSearchQuery, deserializeSearchQuery, filterSnapshotBySearchQuery } from "../functions/query"
import { getClosestGMSnapshots } from "../functions/gm-snapshots"
import {useRecoilState, useResetRecoilState} from "recoil";
import {
    AccessControlData, fileData,
    FileSharingSnapShotData,
    GroupMembershipSnapshotsData, rawFileData, searchHistoryDisplay,
    searchQueryHistoryData, selectedSnapshot
} from "../recoil";
import {checkRequirements} from "../functions/ac-requirements";
import {makeFilesForDisplay} from "../functions/snapshot-files";
import {id_generator} from "../functions/id_generator";
import AdbIcon from '@mui/icons-material/Adb';
import LogsModalView from "./LogsModal";
import {dataRefining} from "../functions/dataRefining";

// This is for the Header which is the very top of our website


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.25),
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
    color: 'black',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '80ch',
        },
    },
}));

export default function PrimarySearchAppBar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [searchQueryHistory, setSearchQueryHistory] = useRecoilState(searchQueryHistoryData);
    const [selSnapshot, setSelSnapshot] = useRecoilState(selectedSnapshot);
    const [searchHistory,setSearchHistory] =useRecoilState(searchHistoryDisplay)

    const ResetACR =useResetRecoilState(AccessControlData);
    const ResetFileSharing = useResetRecoilState(FileSharingSnapShotData);
    const ResetGMS = useResetRecoilState(GroupMembershipSnapshotsData);
    const ResetSearchQuery = useResetRecoilState(searchQueryHistoryData);
    const [refinedData, setRefinedData] =useRecoilState(fileData);
    const [rawFile, setRawFile] = useRecoilState(rawFileData);

    const navigate = useNavigate()

    const [openModal, setOpenModal] = React.useState(false);
    const [openModalLog, setOpenModalLog] = React.useState(false);
    const searchQueryModalOpen = () => setOpenModal(true);
    const logsModalOpen = () => setOpenModalLog(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleCloseModalLogs = () => setOpenModalLog(false);

    const navigateHome = () => {
        // 👇️ navigate to /
        navigate('/home');
    };
    const navigateProfile = () => {
        // 👇️ navigate to /
        navigate('/');
    };
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    
    const { userProfile, setUserProfile } = useContext(AuthContext);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        if(userProfile) {
            api.logout().then((res) => {
                if(res.status === 200) {
                    setUserProfile(null);
                }
            });
            ResetACR();
            ResetFileSharing();
            ResetGMS();
            ResetSearchQuery();
        }

    }

    const handleSearchQueryChange = (event) => {
        setSearchQuery(event.target.value);
    }

    const handleSubmitSearchQuery = () => {
        if(props.userData.fileSharingSnapshots.length ==0){
            alert("you must create a file snapshot first");
            return;
        }
        const parsedSQ = serializeSearchQuery(searchQuery.trim(), true);
        console.log(parsedSQ);
        if (!parsedSQ.error) {
            const unparsedSQ = deserializeSearchQuery(parsedSQ);
            console.log(unparsedSQ);
            let email;
            if (userProfile.user.driveType === "microsoft")
                email = userProfile.user.data.mail;
            else
                email = userProfile.user.data.email;
            let domain = email.substring(email.lastIndexOf("@") + 1);
            let closestGMSnapshots = getClosestGMSnapshots(userProfile.groupMembershipSnapshots, selSnapshot.data);

            let groups = parsedSQ["groups"] ? true : false;
            console.log(groups);
            const filteredFiles = filterSnapshotBySearchQuery(selSnapshot.data, parsedSQ, email, domain, userProfile.user.driveType, closestGMSnapshots, groups);
            const id = id_generator(searchQueryHistory);
            const query ={id: id, searchQuery: parsedSQ};
            console.log(query);
            setSearchQueryHistory( (prev)=>{
                console.log(prev);
             return [...prev,query];
            })
            const dataArray = dataRefining([query]);
            console.log(dataArray[0]);
            setSearchHistory( (prev) =>{
                return [...prev,dataArray[0]]
            })
            api.addSearchQuery(query).then((res) => {
                setUserProfile(res.data.profile);
            });
            const arrayData = Array.from(filteredFiles);
            setRawFile(arrayData);
            setRefinedData(makeFilesForDisplay(selSnapshot.data,arrayData,props.userData.driveType));
            navigate("/searchResult");

        }
    }

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={navigateProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="black"
                >
                    <BadgeAvatars userData={props.userData}/>
                </IconButton>
                Profile
            </MenuItem>
        </Menu>
    );
    const sendingQuery = (event) =>{
        if(event.code == "Enter"){
            if(props.userData.fileSharingSnapshots.length ==0) {
                alert("you must create a file snapshot first");
                return;
            }
            if(searchQuery == ""){
                alert("no SearchQuery")
            }else{
                console.log(searchQuery);
                const parsedSQ = serializeSearchQuery(searchQuery.trim(), true);
                console.log(parsedSQ);
                if (!parsedSQ.error) {
                    const unparsedSQ = deserializeSearchQuery(parsedSQ);
                    console.log(unparsedSQ);
                    let email;
                    if (userProfile.user.driveType === "microsoft")
                        email = userProfile.user.data.mail;
                    else
                        email = userProfile.user.data.email;
                    let domain = email.substring(email.lastIndexOf("@") + 1);
                    let closestGMSnapshots = getClosestGMSnapshots(userProfile.groupMembershipSnapshots, selSnapshot.data);

                    let groups = parsedSQ["groups"] ? true : false;
                    console.log(groups);
                    const filteredFiles = filterSnapshotBySearchQuery(selSnapshot.data, parsedSQ, email, domain, userProfile.user.driveType, closestGMSnapshots, groups);
                    const id = id_generator(searchQueryHistory);
                    const query ={id: id, searchQuery: parsedSQ};
                    console.log(query);
                    setSearchQueryHistory( (prev)=>{
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
                    setRawFile(arrayData);
                    setRefinedData(makeFilesForDisplay(selSnapshot.data,arrayData,props.userData.driveType));
                    navigate("/searchResult");
                }
            }
        }
    }
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" style={{boxShadow:"none"}}>
                <Toolbar>
                    <img
                        src={"/img/logo_cse416.png"}
                        alt="logo__load"
                        style={{
                            display: "block",
                            marginTop:"0vh",
                            padding:0,
                            margin:0,
                            marginLeft: "auto",
                            marginRight: "auto",
                            width: "5%",
                            zIndex: 1,
                            cursor:"pointer"
                        }}
                        onClick={navigateHome}
                    />
                    <Search>
                        <IconButton
                            size="medium"
                            edge="end"
                            aria-label="submit search query"
                            onClick={handleSubmitSearchQuery}
                            color="black"
                        >
                            <SearchIcon />
                        </IconButton>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={(e) => handleSearchQueryChange(e)}
                            style={{
                                width: "50ch",
                            }}
                            onKeyUp = {(e)=> sendingQuery(e)}
                        />
                        <Button color = "black" onClick = {searchQueryModalOpen} >
                            <AlignVerticalCenterIcon style = {{marginRight : "8px", marginBottom : "7px"}}></AlignVerticalCenterIcon>
                        </Button>
                    </Search>
                    <Box sx={{ flexGrow: 1 }} > 
                    <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={logsModalOpen}
                            color="black"
                        >
                            <AdbIcon sx = {{float : 'right'}} ></AdbIcon>
                            <BasicModal open={openModalLog} handleClose={handleCloseModalLogs} title={"View Logs"} ><LogsModalView handleClose={handleCloseModalLogs} /></BasicModal>
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="black"
                        >
                            <BadgeAvatars userData={props.userData}/>
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color = "black"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
            <BasicModal open={openModal} handleClose={handleCloseModal} title={"Query Builder"} >
                <SearchQueryModal userData={props.userData}handleClose={handleCloseModal}/>
            </BasicModal>
        </Box>
    );
}
