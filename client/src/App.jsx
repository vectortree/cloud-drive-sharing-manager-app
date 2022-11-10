import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState, useRef} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import { AuthContext } from './auth/auth';
import './App.css';
import {AccessControlData, useRecoilState, userState, useSetRecoilState} from "recoil";
import {createAccessControlRequirement, createFileSharingSnapshot, createGroupMembershipSnapshot} from "./api/api";
import AccessControlPage from "./pages/accessControlPage/AccessControlPage";
import Anaylysis from "./pages/AnalysisPages/AnalysisPage";
import {userStateAtom} from "./recoil"
const dataFiltering= (userProfile) =>{
    let userData ={};
    if(userProfile){
        if(userProfile.user.driveType == "microsoft"){
            userData.name = userProfile.user.displayName;
            userData.email = userProfile.user.data.mail;
            userData.picture = userProfile.user.data.picture;
            let beforeHd = userProfile.user.data.mail;
            let hd = beforeHd.split('@');
            userData.domain = hd[1]; //stonybrook.edu
            userData.driveType = userProfile.user.driveType;
            userData.accessControlRequirements = userProfile.accessControlRequirements;
            userData.fileSharingSnapshots = userProfile.fileSharingSnapshots;
            userData.groupMembershipSnapshots = userProfile.groupMembershipSnapshots;
            userData.searchQueryHistory = userProfile.searchQueryHistory;
        }else if(userProfile.user.driveType == "google"){
            const {name, email, picture, hd} = userProfile.user.data;
            const {accessControlRequirements,fileSharingSnapshots,groupMembershipSnapshots,searchQueryHistory} = userProfile;
            userData ={
                name:name,
                email:email,
                picture:picture,
                domain : hd,
                driveType : userProfile.user.driveType,
                accessControlRequirements:accessControlRequirements,
                fileSharingSnapshots:fileSharingSnapshots,
                groupMembershipSnapshots:groupMembershipSnapshots,
                searchQueryHistory:searchQueryHistory
            }
        }
    }
    return userData;
}
const Layout = (props) =>{
      return(
          <Grid>
            <Outlet />
          </Grid>
      )
}
export let userData = {}
function App() {
    const {userProfile} = useContext(AuthContext);
    userData =dataFiltering(userProfile);
      return (
          <BrowserRouter>
              <Routes>
                  {userProfile && (
                      <Route path={"/"} element={<Layout/>}>
                          <Route index element={<MyPage />} />
                          <Route path="home" element={<Home userData = {userData}/>}/>
                          <Route path="accessControl" element={<AccessControlPage userData = {userData}/>}/>
                          <Route path="redundantSharing" element={<Anaylysis text= "Redundant Sharing" userData = {userData}/>}/>
                          <Route path="deviantSharing" element={<Anaylysis text= "Deviant Sharing" userData = {userData}/>}/>
                          <Route path="fileFolderSharing" element={<Anaylysis text= "File-folder Sharing Differences" userData = {userData}/>}/>
                          <Route path="sharingChanges" element={<Anaylysis text= "Sharing Changes" userData = {userData}/>}/>
                      </Route>
                      )}
                  <Route path="*" element={<Login/>}></Route>
              </Routes>
          </BrowserRouter>
      );
}

export default App;
