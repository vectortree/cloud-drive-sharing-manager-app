import axios from "axios";
import {Grid} from "@mui/material";
import {BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import {useEffect, useContext, useState} from "react"
import Home from "./pages/home/Home";
import Login from "./pages/login/Login"
import MyPage from "./pages/myPage/MyPage"
import Modal from "./components/Modal";
import {useRecoilState } from "recoil";
import {userRecoil} from "./recoil";
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
 
  console.log(userProfile);

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={userProfile ?
              <MyPage /> : 
              <Login/>
            }/>
          {/*This is for temporarily fixing front end */}
           <Route path ="/home" element={<Home/>}/>
           <Route path ="/user" element={<MyPage/>}/>
           <Route path ="/modal" element={<Modal/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
