const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
    getDriveItemsPath: async function(accessToken, path) {
        const client = getAuthenticatedClient(accessToken);
        const driveItems = await client.api(`/me${path}/children?$select=id, name, size, webUrl, createdDateTime, lastModifiedDateTime, parentReference, file, folder`).get();

        return driveItems;
    },

    getDriveItemPermissions: async function(accessToken, driveItemId) {
        const client = getAuthenticatedClient(accessToken);
        const permissions = await client.api(`/me/drive/items/${driveItemId}/permissions`).get();

        return permissions;
    },
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