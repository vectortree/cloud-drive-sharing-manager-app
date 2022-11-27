function makeFilesForDisplay(snapshot, files, driveType) {
    let filesForDisplay = [];
    if(driveType === "google") {
        files.forEach((file) => {
            filesForDisplay.push({
                name: file.name,
                mimeType: file.mimeType,
                link: file.webViewLink,
                createdTime: file.createdTime,
                modifiedTime: file.modifiedTime,
                owner: file.owners ? file.owners[0].emailAddress : "unavailable",
                lastModifyingUser: file.lastModifyingUser ? file.lastModifyingUser.emailAddress : "unavailable",
                size: file.size ? file.size : "unavailable",
                driveName: file.driveName,
                location: file.path ? file.path : "unavailable",
                permissions: partitionPermissions(snapshot, file, driveType)
    
            });
        });
    }
    // TODO
    else if (driveType === "microsoft") {
        files.forEach((file) => {
            filesForDisplay.push({
                name: file.name,
                mimeType: file.file.mimeType,
                link: file.webUrl,
                createdTime: file.createdDateTime,
                modifiedTime: file.lastModifiedDateTime,
                owner: "", // TODO
                lastModifyingUser: "", // TODO
                size: file.size ? file.size : "unavailable",
                driveName: file.driveName,
                location: file.parentReference ? file.parentReference.path : "unavailable",
                permissions: [] // TODO
    
            });
        });
    }
    return filesForDisplay;
}

function partitionPermissions(snapshot, file, driveType) {
    let partitionedPermissions = {
        direct: [],
        inherited: []
    };
    if(driveType === "google") {
        if(file.permissions) {
            if(file.driveId) {
                file.permissions.forEach(p => {
                    if(p.permissionDetails[0].inherited) partitionedPermissions.inherited.push(p);
                    else partitionedPermissions.direct.push(p);
                });
            }
            else if (!file.topLevel) {
                let parent = snapshot.find(f => f.id === file.parents[0]);
                // If parent.permissions is null, then it means that all permissions in
                // file.permissions are direct permissions
                if(!parent.permissions) {
                    partitionedPermissions.direct = file.permissions;
                }
                else {
                    let parentPermissionsIds = new Set(parent.permissions.map(p => p.id));
                    let directPermissions = file.permissions.filter(p => !parentPermissionsIds.has(p.id));
                    let inheritedPermissions = file.permissions.filter(p => parentPermissionsIds.has(p.id));
                    partitionedPermissions.direct = directPermissions;
                    partitionedPermissions.inherited = inheritedPermissions;
                }
            }
            partitionedPermissions.direct = partitionedPermissions.direct.map(p => {
                return {
                    role: p.role,
                    type: p.type,
                    value: p.type === 'user' || p.type === 'group' ? p.emailAddress : p.type === 'domain' ? p.domain : null
                };
            });
            partitionedPermissions.inherited = partitionedPermissions.inherited.map(p => {
                return {
                    role: p.role,
                    type: p.type,
                    value: p.type === 'user' || p.type === 'group' ? p.emailAddress : p.type === 'domain' ? p.domain : null
                };
            });
        }
    }
    // TODO
    else if(driveType === "microsoft") {

    }
    
    return partitionedPermissions;
}

export { makeFilesForDisplay };