import {Button, Grid, Typography} from "@mui/material";
import React from "react";
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";
import jwt_decode from "jwt-decode";

export const GoogleDriveButton = () => {

    const login = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async codeResponse => {
            console.log(codeResponse);
            const tokens = await axios.post('http://localhost:5000/auth/google', {
                code: codeResponse.code
            });
            console.log(jwt_decode(tokens.data.id_token));
        },
        onError: errorResponse => console.log(errorResponse)
    });

    return (
        <Grid
            container
            alignItems={"center"}
            justifyContent={"space-around"}
            // flexDirection={"row"}

        >
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
                    login();
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
    )
}
