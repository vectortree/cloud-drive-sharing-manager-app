import React, { useEffect, useState } from "react";
import { Grid, Button, IconButton, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//
// import { signInWithGoogle } from "./Firebase";

// import
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
                // flexDirection={"row"}
                mt={"25vh"}
            >
                <Button
                    variant="contained"
                    sx={{
                        // border: "solid 1px #EEE",
                        color: "black",
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