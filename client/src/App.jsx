import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import { AuthContext } from './auth/auth';

import './App.css';
import {createAccessControlRequirement, createFileSharingSnapshot, createGroupMembershipSnapshot} from "./api/api";
import AccessControlPage from "./pages/accessControlPage/AccessControlPage";
import Anaylysis from "./pages/AnalysisPages/AnalysisPage";

const Layout = () =>{
      return(
          <Grid>
            <Outlet />
          </Grid>
      )
}
function App() {

  const {userProfile} = useContext(AuthContext);
  let userData ={};
  if(userProfile){
    console.log(userProfile);
      console.log(userProfile.fileSharingSnapshots);
      console.log(userProfile.accessControlRequirements);
      console.log(userProfile.groupMembershipSnapshots);
      if(userProfile.user.driveType == "microsoft"){
           userData.name = userProfile.user.data.displayName;
           userData.email = userProfile.user.data.mail;
           userData.picture = userProfile.user.data.picture;
          let beforeHd = userProfile.user.data.mail;
          let hd = beforeHd.split('@');
          console.log(hd[1]);
           userData.domain = hd[1]; //stonybrook.edu
           userData.driveType = userProfile.user.driveType; 

           userData.accessControlRequirements = userProfile.accessControlRequirements;
           userData.fileSharingSnapshots = userProfile.fileSharingSnapshots;
           userData.groupMembershipSnapshots = userProfile.groupMembershipSnapshots;
           userData.searchQueryHistory = userProfile.searchQueryHistory;


       }else if(userProfile.user.driveType == "google"){
           userData.name = userProfile.user.data.name;
           userData.email = userProfile.user.data.email;
           userData.picture = userProfile.user.data.picture;
           userData.domain = userProfile.user.data.hd; //stonybrook.edu
           userData.driveType = userProfile.user.driveType; 

           userData.accessControlRequirements = userProfile.accessControlRequirements;
           userData.fileSharingSnapshots = userProfile.fileSharingSnapshots;
           userData.groupMembershipSnapshots = userProfile.groupMembershipSnapshots;
           userData.searchQueryHistory = userProfile.searchQueryHistory;
       }
  }
  //temporary
    userData.accessControlRequirements = [
      { id: 1, Name: 'Access Control Policy#1', Query: 'folder:\'CSE416\'', ReadAccess:"Sije, Zalman",WriteAccess:"Sije, JeongYoon",DenyReadAccess:"JeongYoon",DenyWriteAccess:"Starr"},
      { id: 2, Name: 'Access Control Policy#2', Query: 'file:\'mid.pdf\'', ReadAccess:"JeongYoon, Satrr",WriteAccess:"Sije",DenyReadAccess:"Zalman",DenyWriteAccess:"Starr"},
      { id: 3, Name: 'Access Control Policy#3', Query: 'folder:\'Document\'', ReadAccess:"Starr",WriteAccess:"Zalman",DenyReadAccess:"Sije",DenyWriteAccess:"JeongYoon"},
      { id: 4, Name: 'Access Control Policy#4', Query: 'file:\'beauty.jpeg\'', ReadAccess:"Zalman",WriteAccess:"Sije",DenyReadAccess:"Starr",DenyWriteAccess:"JeongYoon"},
      { id: 5, Name: 'Access Control Policy#5', Query: 'file:\'ScreenShot.peg\'', ReadAccess:"Starr",WriteAccess:"JeongYoon",DenyReadAccess:"Zalman",DenyWriteAccess:"Sije"},
  ]
    console.log(userProfile);
      return (
          <BrowserRouter>
              <Routes>
                  {userProfile && (
                      <Route path={"/"} element={<Layout />}>
                          <Route index element={<MyPage userData = {userData}/>} />
                          <Route path="home" element={<Home userData = {userData}/>}/>
                          <Route path="accessControl" element={<AccessControlPage userData = {userData}/>}/>
                          <Route path="redundantSharing" element={<Anaylysis userData = {userData}/>}/>
                      </Route>
                      )}
                  <Route path="*" element={<Login/>}></Route>
              </Routes>
          </BrowserRouter>
      );
}

export default App;
