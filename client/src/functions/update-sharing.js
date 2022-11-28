function applyLocalUpdatesToSnapshot(mostRecentFSSnapshot, files, action, type, role, value, driveType) {
    // Note: This function manually updates the permissions of each file and returns a snapshot object
    // that can be used for checking requirements
    let updatedSnapshot = [];
    let fileIds = files.map(f => f.id);
    mostRecentFSSnapshot.filter(f => !fileIds.includes(f.id)).forEach(f => {
        updatedSnapshot.push(f);
    });
    //TODO
    if(driveType === "google") {

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