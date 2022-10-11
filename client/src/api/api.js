/*
    This is our HTTP API, which is responsible for sending requests to our back-end API.
*/

import axios from 'axios';

const url = process.env.REACT_APP_SERVER_URL;

axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: url
});

// The following are requests that the client will make. Note that all requests
// should have a request method (e.g., GET, POST, PUT, DELETE, etc.) as well as a path.
export const createFileSharingSnapshot = (payload) => api.post('/createfilesharingsnapshot', payload);
export const createGroupMembershipSnapshot = () => api.post('/creategroupmembershipsnapshot');
export const getUser = () => api.get('/getuser');
export const logout = () => api.get('/logout');


const requests = {
    createFileSharingSnapshot,
    createGroupMembershipSnapshot,
    getUser,
    logout
};

export default requests;