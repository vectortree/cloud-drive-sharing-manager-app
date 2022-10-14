import {Button, Grid, Typography} from "@mui/material";
import React from "react";

export const GoogleDriveButton = () => {

    const googleLogin = () => {
       window.open(process.env.REACT_APP_SERVER_URL + '/auth/google', "_self");
    }

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
                    googleLogin();
                    console.log("onclick Google Login");
                }}
                // onSuccess={onSuccess}
                // onFailure={onFailure}
            >
                <img
                    src={"/img/googledrive.png"}
                    
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
