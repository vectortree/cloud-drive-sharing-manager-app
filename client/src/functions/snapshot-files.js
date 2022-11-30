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

    else if (driveType === "microsoft") {

        files.forEach((file) => {
            filesForDisplay.push({
                name: file.name,
                mimeType: file.file ? file.file.mimeType : "application/folder",
                link: file.webUrl,
                createdTime: file.createdDateTime,
                modifiedTime: file.lastModifiedDateTime,
                owner: file.permissions.value == undefined || file.permissions.value == [] ? "" :file.permissions.value.find(p => p.roles.includes("owner")).grantedToV2.siteUser.email,
                lastModifyingUser: file.lastModifiedBy ? file.lastModifiedBy.user.email : "unavailable",
                size: file.size ? file.size : "unavailable",
                driveName: file.driveName,
                location: file.parentReference ? file.parentReference.path : "unavailable",
                permissions: partitionPermissions(snapshot, file, driveType)
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
            else {
                partitionedPermissions.direct = file.permissions;
            }
            partitionedPermissions.direct = partitionedPermissions.direct.map(p => {
                return {
                    role: p.role,
                    type: p.type,
                    value: p.type === 'user' || p.type === 'group' ? p.emailAddress : p.type === 'domain' ? p.domain : 'n/a'
                };
            });
            partitionedPermissions.inherited = partitionedPermissions.inherited.map(p => {
                return {
                    role: p.role,
                    type: p.type,
                    value: p.type === 'user' || p.type === 'group' ? p.emailAddress : p.type === 'domain' ? p.domain : 'n/a'
                };
            });
        }
    }

    else if(driveType === "microsoft") {
        let directPermissions = file.permissions.value;
        let inheritedPermissions = [];
        let parent = snapshot == undefined || snapshot == {} ? false : snapshot.find(f => {
            if(f.id != undefined){
                return f.id === file.parentReference.id
            }else{
                return false;
            }
        });
        if (parent) {
            let parentPermissionIds = new Set(parent.permissions.value.map(p => p.id));
            directPermissions = file.permissions.value.filter(p => !parentPermissionIds.has(p.id));
            inheritedPermissions = file.permissions.value.filter(p => parentPermissionIds.has(p.id));
        }
        for (const permission of directPermissions) {
            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                for (const user of permission.grantedToIdentitiesV2) {
                    partitionedPermissions.direct.push({
                        role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                        type: "users",
                        value: user.siteUser.email
                    });
                }
            } else if (permission.grantedToV2) {
                partitionedPermissions.direct.push({
                    role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                    type: "users",
                    value: permission.grantedToV2.siteUser.email
                });
            } else if (permission.link && permission.link.scope === "anonymous") {
                partitionedPermissions.direct.push({
                    role: permission.link.type,
                    type: "anonymous",
                    value: "n/a"
                });
            } else if (permission.link && permission.link.scope === "organization") {
                let owner = file.permissions.value.find(p => p.roles.includes("owner")).grantedToV2.siteUser.email;
                partitionedPermissions.direct.push({
                    role: permission.link.type,
                    type: "organization",
                    value: owner.substring(owner.lastIndexOf("@") + 1)
                });
            }
        }

        for (const permission of inheritedPermissions) {
            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                for (const user of permission.grantedToIdentitiesV2) {
                    partitionedPermissions.inherited.push({
                        role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                        type: "users",
                        value: user.siteUser.email
                    });
                }
            } else if (permission.grantedToV2) {
                partitionedPermissions.inherited.push({
                    role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                    type: "users",
                    value: permission.grantedToV2.siteUser.email
                });
            } else if (permission.link && permission.link.scope === "organization") {
                let owner = file.permissions.value.find(p => p.roles.includes("owner")).grantedToV2.siteUser.email;
                partitionedPermissions.inherited.push({
                    role: permission.link.type,
                    type: "organization",
                    value: owner.substring(owner.lastIndexOf("@") + 1)
                });
            } else if (permission.link && permission.link.scope === "anonymous") {
                partitionedPermissions.inherited.push({
                    role: permission.link.type,
                    type: "anonymous",
                    value: "n/a"
                });
            }
        }
    }
    
    return partitionedPermissions;
}

export { makeFilesForDisplay };