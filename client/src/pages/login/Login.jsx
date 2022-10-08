import React, { useEffect, useState } from "react";
import { Grid, Button, IconButton, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {OnedriveButton} from "../../components/OnedriveButton";
import {GoogleDriveButton} from "../../components/GoogleDriveButton";
import axios from "axios";


/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */

const Login = () => {
        return (
        <Grid>
            {/*Logo*/}
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

            <OnedriveButton/>
            <GoogleDriveButton/>
        </Grid>
    );
};

export default Login;