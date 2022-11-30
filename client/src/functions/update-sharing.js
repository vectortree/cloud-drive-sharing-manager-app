function applyLocalUpdatesToSnapshot(mostRecentFSSnapshot, files, action, type, role, value, driveType) {
    // Note: This function manually updates the permissions of each file and returns a snapshot object
    // that can be used for checking requirements

    /*let updatedSnapshot = [];
    let fileIds = files.map(f => f.id);
    mostRecentFSSnapshot.filter(f => !fileIds.includes(f.id)).forEach(f => {
        updatedSnapshot.push(f);
    });*/

    let updatedSnapshot = JSON.parse(JSON.stringify(mostRecentFSSnapshot));
    if(files.length == 0) return updatedSnapshot;
    if(driveType === "google") {
        if(action === "add") {
            if((type === "user" || type === "group" || type === "domain") && !value) return updatedSnapshot;
            if(type !== "user" && type !== "group" && type !== "domain" && type !== "anyone") return updatedSnapshot;
            if(role !== "writer" && role !== "reader" && role !== "commenter") return updatedSnapshot;

            for(const file of files) {
                // A user should only update permissions for files that include a permissions array
                if(file.permissions) {
                    // If permission of same {type, role, value} is not present in file.permissions,
                    // then add new permission for file
                    let present = false;
                    for(const permission of file.permissions) {
                        if(permission.type === type && permission.role === role) {
                            if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                present = true;
                            }
                            else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                present = true;
                            }
                            else if(permission.type === "anyone") present = true;
                        }
                    }
                    if(!present) {
                        // Note: Index must exist since files is a subset of mostRecentFSSnapshot
                        let index = updatedSnapshot.data.findIndex(f => f.id === file.id);
                        if(type === "user" || type === "group") {
                            updatedSnapshot.data[index].permissions.push({
                                role: role,
                                type: type,
                                emailAddress: value.toLowerCase()
                            });
                        }
                        else if(type === "domain") {
                            updatedSnapshot.data[index].permissions.push({
                                role: role,
                                type: type,
                                domain: value.toLowerCase()
                            });
                        }
                        else if(type === "anyone") {
                            updatedSnapshot.data[index].permissions.push({
                                role: role,
                                type: type
                            });
                        }
                        if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                            let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.path + '/' + file.name, file.id, driveType);
                            for(const id of fileIds) {
                                index = updatedSnapshot.data.findIndex(f => f.id === id);
                                if(type === "user" || type === "group") {
                                    updatedSnapshot.data[index].permissions.push({
                                        role: role,
                                        type: type,
                                        emailAddress: value.toLowerCase()
                                    });
                                }
                                else if(type === "domain") {
                                    updatedSnapshot.data[index].permissions.push({
                                        role: role,
                                        type: type,
                                        domain: value.toLowerCase()
                                    });
                                }
                                else if(type === "anyone") {
                                    updatedSnapshot.data[index].permissions.push({
                                        role: role,
                                        type: type
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        else if(action === "remove") {
            if((type === "user" || type === "group" || type === "domain") && !value) return updatedSnapshot;
            if(type !== "user" && type !== "group" && type !== "domain" && type !== "anyone") return updatedSnapshot;
            if(role !== "writer" && role !== "reader" && role !== "commenter") return updatedSnapshot;

            for(const file of files) {
                // A user should only update permissions for files that include a permissions array
                if(file.permissions) {
                    // If permission of same {type, role, value} is present in file.permissions,
                    // then remove permission for file
                    let index = updatedSnapshot.data.findIndex(f => f.id === file.id);
                    file.permissions.forEach((permission, permIndex) => {
                        if(permission.type === type && permission.role === role) {
                            if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                            }
                            else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                            }
                            else if(permission.type === "anyone") {
                                updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                            }
                        }
                    });
                    if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                        let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.path + '/' + file.name, file.id, driveType);
                        for(const id of fileIds) {
                            index = updatedSnapshot.data.findIndex(f => f.id === id);
                            let fileObj = JSON.parse(JSON.stringify(updatedSnapshot.data[index]));
                            fileObj.permissions.forEach((permission, permIndex) => {
                                if(permission.type === type && permission.role === role) {
                                    if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                        updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                                    }
                                    else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                        updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                                    }
                                    else if(permission.type === "anyone") {
                                        updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        // Note: Should only be for files in MyDrive
        else if(action === "unshare") {
            for(const file of files) {
                // A user should only update permissions for files that include a permissions array
                if(file.permissions) {
                    // If permission has a non-"owner" role in file.permissions (i.e., file is shared),
                    // then remove permission for file
                    let index = updatedSnapshot.data.findIndex(f => f.id === file.id);
                    file.permissions.forEach((permission, permIndex) => {
                        if(permission.role !== "owner") {
                            updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                        }
                    });
                    if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                        let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.path + '/' + file.name, file.id, driveType);
                        for(const id of fileIds) {
                            index = updatedSnapshot.data.findIndex(f => f.id === id);
                            let fileObj = JSON.parse(JSON.stringify(updatedSnapshot.data[index]));
                            fileObj.permissions.forEach((permission, permIndex) => {
                                if(permission.role !== "owner") {
                                    updatedSnapshot.data[index].permissions.splice(permIndex, 1);
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    else if(driveType === "microsoft") {
        //let updatedFiles = mostRecentFSSnapshot.filter(f => fileIds.includes(f.id)).map(f => {
        //    let fileClone = JSON.parse(JSON.stringify(f));
        for (const file of files) {
            // Note: Index must exist since files is a subset of mostRecentFSSnapshot
            let index = updatedSnapshot.data.findIndex(f => f.id === file.id);
            if (action === "add") {
                if(type === "users" && !value) return updatedSnapshot;
                if(type !== "users" && type !== "organization" && type !== "anonymous") return updatedSnapshot;
                if(role !== "read" && role !== "write") return updatedSnapshot;
                
                if (type === "users") {
                    let found = false;
                    for (const permission of file.permissions.value) {
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && permission.roles.includes(role)) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                    found = true;
                                    break;
                                }
                            }
                        } else if (permission.grantedToV2 && permission.roles.includes(role)) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                found = true;
                        }
                    }
                    
                    if (!found) {
                        updatedSnapshot.data[index].permissions.value.push({
                            roles: [role],
                            grantedToV2: {
                                siteUser: { email: value }
                            }
                        });

                        if(file.folder && file.folder.childCount > 0) {
                            let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.parentReference.path + '/' + file.name, file.id, driveType);
                            for(const id of fileIds) {
                                let fileIndex = updatedSnapshot.data.findIndex(f => f.id === id);
                                updatedSnapshot.data[fileIndex].permissions.value.push({
                                    roles: [role],
                                    grantedToV2: {
                                        siteUser: { email: value }
                                    }
                                });
                            }
                        }
                    }
                }
                else {
                    if (!file.permissions.value.find(p => p.link && p.link.scope === type && p.link.type === (role === "read" ? "view" : "edit"))) {
                        updatedSnapshot.data[index].permissions.value.push({
                            link: {
                                scope: type,
                                type: role === "read" ? "view" : "edit"
                            }
                        });

                        if(file.folder && file.folder.childCount > 0) {
                            let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.parentReference.path + '/' + file.name, file.id, driveType);
                            for(const id of fileIds) {
                                let fileIndex = updatedSnapshot.data.findIndex(f => f.id === id);
                                updatedSnapshot.data[fileIndex].permissions.value.push({
                                    link: {
                                        scope: type,
                                        type: role === "read" ? "view" : "edit"
                                    }
                                });
                            }
                        }

                    }
                }

            } else if (action === "remove") {
                if(type === "users" && !value) return updatedSnapshot;
                if(type !== "users" && type !== "organization" && type !== "anonymous") return updatedSnapshot;
                if(role !== "read" && role !== "write") return updatedSnapshot;
                
                if (type === "users") {
                    file.permissions.value.forEach((permission, permIndex) => {
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && permission.roles.includes(role)) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                    updatedSnapshot.data[index].permissions.value.splice(permIndex, 1);
                                    break;
                                }
                            }
                        } else if (permission.grantedToV2 && permission.roles.includes(role)) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                updatedSnapshot.data[index].permissions.value.splice(permIndex, 1);
                        }

                    });

                    if(file.folder && file.folder.childCount > 0) {
                        let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.parentReference.path + '/' + file.name, file.id, driveType);
                        for(const id of fileIds) {
                            let fileIndex = updatedSnapshot.data.findIndex(f => f.id === id);
                            let fileObj = JSON.parse(JSON.stringify(updatedSnapshot.data[fileIndex]));
                            fileObj.permissions.value.forEach((permission, permIndex) => {
                                if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && permission.roles.includes(role)) {
                                    for (const user of permission.grantedToIdentitiesV2) {
                                        if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                            updatedSnapshot.data[fileIndex].permissions.value.splice(permIndex, 1);
                                            break;
                                        }
                                    }
                                } else if (permission.grantedToV2 && permission.roles.includes(role)) {
                                    if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                        updatedSnapshot.data[fileIndex].permissions.value.splice(permIndex, 1);
                                }
                            });
                        }


                    }
                }
                else {
                    updatedSnapshot.data[index].permissions.value = updatedSnapshot.data[index].permissions.value.filter(p => !(p.link && p.link.scope === type && p.link.type === (role === "read" ? "view" : "edit")));

                    if(file.folder && file.folder.childCount > 0) {
                        let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.parentReference.path + '/' + file.name, file.id, driveType);
                        for(const id of fileIds) {
                            let fileIndex = updatedSnapshot.data.findIndex(f => f.id === id);
                            let fileObj = JSON.parse(JSON.stringify(updatedSnapshot.data[fileIndex]));
                            fileObj.permissions.value.forEach((permission, permIndex) => {
                                updatedSnapshot.data[fileIndex].permissions.value = updatedSnapshot.data[fileIndex].permissions.value.filter(p => !(p.link && p.link.scope === type && p.link.type === (role === "read" ? "view" : "edit")));
                            });
                        }
                    }
                }

            } else if (action === "unshare") {
                updatedSnapshot.data[index].permissions.value = updatedSnapshot.data[index].permissions.value.filter(p => p.roles.includes("owner")); 

                if(file.folder && file.folder.childCount > 0) {
                    let fileIds = getFilesIdsUnderFolder(updatedSnapshot.data, file.parentReference.path + '/' + file.name, file.id, driveType);
                    for(const id of fileIds) {
                        let fileIndex = updatedSnapshot.data.findIndex(f => f.id === id);
                        let fileObj = JSON.parse(JSON.stringify(updatedSnapshot.data[fileIndex]));
                        fileObj.permissions.value.forEach((permission, permIndex) => {
                            updatedSnapshot.data[fileIndex].permissions.value = updatedSnapshot.data[fileIndex].permissions.value.filter(p => p.roles.includes("owner"));
                        });
                    }
                }
            }
        };
    }

    return updatedSnapshot;
}

function getFilesIdsUnderFolder(snapshot, path, id, driveType) {
    let fileIds = [];
    if (driveType === "google") {
        if(!path) return fileIds;
        for(const file of snapshot) {
            // Only consider files with permissions array!
            if(file.permissions && file.path && file.path.startsWith(path) && file.id !== id) {
                fileIds.push(file.id);
            }
        }
    }
    else if (driveType === "microsoft") {
        for(const file of snapshot) {
            if(file.parentReference.path.startsWith(path) && file.id !== id) {
                fileIds.push(file.id);
            }
        }
    }
    return fileIds;
}

export { applyLocalUpdatesToSnapshot };