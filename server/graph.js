const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
    getDriveItemChildren: async function(accessToken, path) {
        const client = getAuthenticatedClient(accessToken);
        const driveItems = await client.api(`/me${path}/children?$select=id, name, size, webUrl, createdDateTime, lastModifiedDateTime, shared, createdBy, parentReference, file, folder`).get();

        return driveItems;
    },

    getDriveItemPermissions: async function(accessToken, driveItemId) {
        const client = getAuthenticatedClient(accessToken);
        const permissions = await client.api(`/me/drive/items/${driveItemId}/permissions`).get();

        return permissions;
    },

    getAllSharedItems: async function (accessToken) {
        const client = getAuthenticatedClient(accessToken);
        const sharedItems = await client.api(`/me/drive/sharedWithMe?select=id, remoteItem`).get();

        return sharedItems;
    },

    getSharedItem: async function (accessToken, itemId, driveId) {
        const client = getAuthenticatedClient(accessToken);
        const sharedItem = await client.api(`/drives/${driveId}/items/${itemId}`).get();

        return sharedItem;
    },

    getSharedItemChildren: async function (accessToken, itemId, driveId) {
        const client = getAuthenticatedClient(accessToken);
        const sharedItem = await client.api(`/drives/${driveId}/items/${itemId}/children`).get();

        return sharedItem;
    },

    getSharedItemPermissions: async function(accessToken, itemId, driveId) {
        const client = getAuthenticatedClient(accessToken);
        const permissions = await client.api(`/drives/${driveId}/items/${itemId}/permissions`).get();

        return permissions;
    },

    createSharingLink: async function(accessToken, itemId, driveId, permission) {
        const client = getAuthenticatedClient(accessToken);
        await client.api(`/drives/${driveId}/items/${itemId}/createLink`).post(permission);
    },

    addPermission: async function(accessToken, itemId, driveId, permission) {
        const client = getAuthenticatedClient(accessToken);
        await client.api(`/drives/${driveId}/items/${itemId}/invite`).post(permission);
    },

    deletePermission: async function(accessToken, itemId, driveId, permissionId) {
        const client = getAuthenticatedClient(accessToken);
        await client.api(`/drives/${driveId}/items/${itemId}/permissions/${permissionId}`).delete();
    }
}

function getAuthenticatedClient(accessToken) {

    // Initialize Graph client
    const client = graph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
  
    return client;
}