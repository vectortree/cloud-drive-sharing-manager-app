import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import {useRecoilState } from "recoil";
import {userRecoil} from "./recoil";
import { useIsAuthenticated } from "@azure/msal-react";
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
  const {user} = useContext(AuthContext);
  const isAuthenticatedOneDrive = useIsAuthenticated();
 
  console.log(user);

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={user || isAuthenticatedOneDrive ? 
              <MyPage /> : 
              <Login/>
            }/>
          {/*This is for temporarily fixing front end */}
           <Route path ="/home" element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
