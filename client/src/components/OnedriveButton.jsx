import React from "react";
import {Button, Grid, Typography} from "@mui/material";

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */
export const OnedriveButton = () => {
    return (
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
                        width:"250px",
                        margin:"0"
                    }}
                >
                    Sign In with OneDrive
                </Typography>
            </Button>
        </Grid>
    );
}