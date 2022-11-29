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
// should have a request method (e.g., GET, POST, PUT, DELETE) as well as a path.
// Some requests may have a payload (i.e., data) and/or an id.
export const createFileSharingSnapshot = (payload) => api.post(`/createfilesharingsnapshot/`, payload);
export const editFileSharingSnapshot = (id, payload) => api.put(`/editfilesharingsnapshot/${id}`, payload);
export const removeFileSharingSnapshot = (id) => api.delete(`/removefilesharingsnapshot/${id}`);
export const createGroupMembershipSnapshot = (payload) => api.post('/creategroupmembershipsnapshot', payload);
export const editGroupMembershipSnapshot = (id, payload) => api.put(`/editgroupmembershipsnapshot/${id}`, payload);
export const removeGroupMembershipSnapshot = (id) => api.delete(`/removegroupmembershipsnapshot/${id}`);
export const createAccessControlRequirement = (payload) => api.post('/createaccesscontrolrequirement', payload);
export const editAccessControlRequirement = (id, payload) => api.put(`/editaccesscontrolrequirement/${id}`, payload);
export const removeAccessControlRequirement = (id) => api.delete(`/removeaccesscontrolrequirement/${id}`);
export const addSearchQuery = (payload) => api.post('/addsearchquery', payload);
export const clearSearchQueries = () => api.delete('clearsearchqueries');
export const removeSearchQuery = (id) => api.delete(`/removesearchquery/${id}`);
export const addPermission = (payload) => api.post('/addpermission', payload);
export const removePermission = (payload) => api.post('/removepermission', payload);
export const unshareFiles = (payload) => api.post('/unsharefiles', payload);
export const checkSnapshotConsistency = () => api.get('/checksnapshotconsistency');
export const getUserProfile = () => api.get('/getuserprofile');
export const logout = () => api.get('/logout');


const requests = {
    createFileSharingSnapshot,
    editFileSharingSnapshot,
    removeFileSharingSnapshot,
    createGroupMembershipSnapshot,
    editGroupMembershipSnapshot,
    removeGroupMembershipSnapshot,
    createAccessControlRequirement,
    editAccessControlRequirement,
    removeAccessControlRequirement,
    addSearchQuery,
    clearSearchQueries,
    removeSearchQuery,
    addPermission,
    removePermission,
    unshareFiles,
    checkSnapshotConsistency,
    getUserProfile,
    logout
};

export default requests;