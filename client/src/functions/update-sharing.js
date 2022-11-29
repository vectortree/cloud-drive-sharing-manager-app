function applyLocalUpdatesToSnapshot(mostRecentFSSnapshot, files, action, type, role, value, driveType) {
    // Note: This function manually updates the permissions of each file and returns a snapshot object
    // that can be used for checking requirements

    /*let updatedSnapshot = [];
    let fileIds = files.map(f => f.id);
    mostRecentFSSnapshot.filter(f => !fileIds.includes(f.id)).forEach(f => {
        updatedSnapshot.push(f);
    });*/
    
    let updatedSnapshot = mostRecentFSSnapshot.slice();
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
                        let index = updatedSnapshot.findIndex(f => f.id === file.id);
                        if(type === "user" || type === "group") {
                            updatedSnapshot[index].permissions.push({
                                role: role,
                                type: type,
                                emailAddress: value.toLowerCase()
                            });
                        }
                        else if(type === "domain") {
                            updatedSnapshot[index].permissions.push({
                                role: role,
                                type: type,
                                domain: value.toLowerCase()
                            });
                        }
                        else if(type === "anyone") {
                            updatedSnapshot[index].permissions.push({
                                role: role,
                                type: type
                            });
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
                    let index = updatedSnapshot.findIndex(f => f.id === file.id);
                    file.permissions.forEach((permission, permIndex) => {
                        if(permission.type === type && permission.role === role) {
                            if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                updatedSnapshot[index].permissions.splice(permIndex, 1);
                            }
                            else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                updatedSnapshot[index].permissions.splice(permIndex, 1);
                            }
                            else if(permission.type === "anyone") {
                                updatedSnapshot[index].permissions.splice(permIndex, 1);
                            }
                        }
                    });
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
                    let index = updatedSnapshot.findIndex(f => f.id === file.id);
                    file.permissions.forEach((permission, permIndex) => {
                        if(permission.role !== "owner") {
                            updatedSnapshot[index].permissions.splice(permIndex, 1);
                        }
                    });
                }
            }
        }
    }
    else if(driveType === "microsoft") {
        let updatedFiles = mostRecentFSSnapshot.filter(f => fileIds.includes(f.id)).map(f => {
            let fileClone = JSON.parse(JSON.stringify(f));
            if (action === "add") {
                if (type === "user") {
                    let found = false;
                    for (const permission of f.permissions.value) {
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                    found = true;
                                    break;
                                }
                            }
                        } else if (permission.grantedToV2) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                found = true;
                        }

                        if (found) break;
                    }
                    
                    if (!found) {
                        fileClone.permissions.value.push({
                            roles: [role],
                            grantedToV2: {
                                siteUser: { email: value }
                            }
                        });
                    }
                }
                if (type === "domain") {
                    if (!f.permissions.value.find(p => p.link && p.link.scope === "organization" && p.link.type === role)) {
                        fileClone.permissions.value.push({
                            link: {
                                scope: "organization",
                                type: role
                            }
                        });
                    }

                }
                if (perm.type === "anyone") {
                    if (!f.permissions.value.find(p => p.link && p.link.scope === "anonymous" && p.link.type === role)) {
                        fileClone.permissions.value.push({
                            link: {
                                scope: "anonymous",
                                type: role
                            }
                        });
                    }
                }



            } else if (action === "remove") {
                if (type === "user") {
                    for (const permission of f.permissions.value) {
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && !permission.roles.includes("owner")) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                    fileClone.permissions.value = fileClone.permissions.value.filter(p => p.id !== permission.id);
                                    break;
                                }
                            }
                        } else if (permission.grantedToV2 && !permission.roles.includes("owner")) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                fileClone.permissions.value = fileClone.permissions.value.filter(p => p.id !== permission.id);
                        }
                    }
                }
                if (type === "domain") {
                    fileClone.permissions.value = f.permissions.value.filter(p => !(p.link && p.link.scope === "organization" && p.link.type === role));
                }
                if (perm.type === "anyone") {
                    fileClone.permissions.value = f.permissions.value.filter(p => !(p.link && p.link.scope === "anyone" && p.link.type === role));
                }

            } else if (action === "unshare") {
                fileClone.permissions.value = f.permissions.value.filter(p => p.roles.includes("owner")); 
            }

            return fileClone;
        });

        updatedFiles.forEach(f => {
            updatedSnapshot.push(f);
        });

    }

    return updatedSnapshot;
}

export { applyLocalUpdatesToSnapshot };