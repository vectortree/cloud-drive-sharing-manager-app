import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import { AuthContext } from './auth/auth';

import './App.css';

const Layout = () =>{
      return(
          <Grid>
            <Outlet />
          </Grid>
      )
}
function App() {

  const {userProfile} = useContext(AuthContext);
  let userData;
  if(userProfile){
      if(userProfile.userData.user.driveType == "microsoft"){
          userData.name = userProfile.userData.user.displayName;
      }else if(userProfile.userData.user.driveType == "google"){
          userData.name = userProfile.userData.user.name;
      }
  }
      return (
          <BrowserRouter>
              <Routes>
                  {userProfile && (
                      <Route path={"/"} element={<Layout />}>
                          <Route index element={<MyPage userData = {userProfile}/>} />
                          <Route path="home" element={<Home userData = {userProfile}/>}/>
                      </Route>
                      )}
                  <Route path="*" element={<Login/>}></Route>
              </Routes>
          </BrowserRouter>
      );
}

export default App;
