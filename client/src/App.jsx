import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState, useRef, memo,useCallback} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import { AuthContext } from './auth/auth';
import {AccessControlData} from "./recoil";
import './App.css';
import {useRecoilState, useResetRecoilState, userState, useSetRecoilState} from "recoil";
import {createAccessControlRequirement, createFileSharingSnapshot, createGroupMembershipSnapshot} from "./api/api";
import AccessControlPage from "./pages/accessControlPage/AccessControlPage";
import Anaylysis from "./pages/AnalysisPages/AnalysisPage";
import {dataFiltering} from "./functions/datafilter";

const Layout = () =>{
      return(
          <Grid>
            <Outlet />
          </Grid>
      )
}
function App() {
    const {userProfile} = useContext(AuthContext);
    let userData = dataFiltering(userProfile)
    const ACR_Handler = (data) =>{
        userData.accessControlRequirements = data;
    }
    const FileSharing_Handler = (data) =>{
        userData.fileSharingSnapshots = data;
    }
    const GroupSnapshot_Handler = (data) =>{
        userData.groupMembershipSnapshots = data;
    }
    const SearchQuery_Handler = (data) =>{
        userData.searchQueryHistory = data;
    }
      return (
          <BrowserRouter>
              <Routes>
                  {userProfile && (
                      <Route path={"/"} element={<Layout/>}>
                          <Route index element={<MyPage userData = {userData} SearchQuery_Handler = {SearchQuery_Handler} GroupSharing_Handler = {GroupSnapshot_Handler} ACR_Handler={ACR_Handler} FileSharing_Handler={FileSharing_Handler}/>}/>
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
