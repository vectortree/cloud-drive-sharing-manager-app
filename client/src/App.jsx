import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useState} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import {useRecoilState } from "recoil";
import {userRecoil} from "./recoil";
import { useIsAuthenticated } from "@azure/msal-react";

import './App.css';

const Layout = () =>{
      return(
          <Grid>
            <Outlet />
          </Grid>
      )
}
function App() {
  const [user, setUser] = useState(undefined);
  const [isAuthenticatedGoogleDrive, setIsAuthenticatedGoogleDrive] = useState(localStorage.getItem("isLoggedIn"));
  const isAuthenticatedOneDrive = useIsAuthenticated();

  const isAuth = isAuthenticatedGoogleDrive || isAuthenticatedOneDrive;
  // useEffect(()=>{
  //
  // })
    console.log(isAuth);
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={isAuth ? 
              <MyPage/> : 
              <Login setIsAuthenticatedGoogleDrive={setIsAuthenticatedGoogleDrive}/>
            }/>
          {/*This is for temporarily fixing front end */}
           <Route path ="/home" element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
