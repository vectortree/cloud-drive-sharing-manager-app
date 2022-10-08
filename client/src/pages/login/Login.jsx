import React, { useEffect, useState } from "react";
import { Grid, Button, IconButton, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";


/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */

const Login = () => {
        return (
        <Grid>
            <img

                src={"/img/logo_cse416.png"}
                alt="logo__load"
                style={{
                    display: "block",
                    marginTop:"20vh",
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "20%",
                    zIndex: -1,
                    opacity: 0.8,
                }}
            />
            {/* <div></div> */}
            {/*<Grid*/}
            {/*    container*/}
            {/*    alignItems={"center"}*/}
            {/*    justifyContent={"space-around"}*/}
            {/*    height={"50px"}*/}
            {/*    mb={2.5}*/}
            {/*    mt={"20vh"}*/}
            {/*>*/}
            {/*    <Typography variant="h2" sx={{ color: "#FFF" }}>*/}

            {/*    </Typography>*/}
            {/*</Grid>*/}
            <Grid
                container
                alignItems={"center"}
                justifyContent={"space-around"}
                // flexDirection={"row"}]
                mt={"1vh"}
            >
            <Button
                variant="contained"
                sx={{
                    // border: "solid 1px #EEE",
                    color: "black",
                    height: "53px",
                    mb: 1,
                    mt: 1,
                    width:"250px",
                    boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.1)",
                }}
                // fullWidth
                color="white"
                onClick={() => {

                    console.log("onclick OneDrive Login");
                }}
                // onSuccess={onSuccess}
                // onFailure={onFailure}
            >
                <img
                    src={
                        "https://www.onmsft.com/wp-content/uploads/2019/04/onedrive.jpg"
                    }
                    alt="OneDrive_icon"
                    width="50dp"
                    height="30dp"
                />
                <Typography
                    sx={{
                        ml: "15px",
                        fontSize: 15,
                        margin:0,
                    }}
                >
                    Sign In with OneDrive
                </Typography>
            </Button>
            </Grid>
            <Grid
                container
                alignItems={"center"}
                justifyContent={"space-around"}
                // flexDirection={"row"}

            >
                {/*Google SignIn*/}
                <Button
                    variant="contained"
                    sx={{
                        // border: "solid 1px #EEE",
                        color: "black",
                        width:"250px",
                        height: "53px",
                        mb: 1,
                        mt: 1,
                        boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.1)",
                    }}
                    // fullWidth
                    color="white"
                    onClick={() => {

                        console.log("onclick Google Login");
                    }}
                    // onSuccess={onSuccess}
                    // onFailure={onFailure}
                >
                    <img
                        src={
                            "https://pbs.twimg.com/profile_images/1455185376876826625/s1AjSxph_400x400.jpg"
                        }
                        alt="google_icon"
                        width="18dp"
                        height="18dp"

                    />
                    <Typography
                        sx={{
                            ml: "15px",
                            fontSize: 15,
                            marginLeft:"20px",
                            marginRight:"17px"
                        }}
                    >
                        Sign In with Google
                    </Typography>
                </Button>
            </Grid>
        </Grid>
    );
};

export default Login;