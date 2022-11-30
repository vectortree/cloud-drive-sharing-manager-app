function deviantSharing(snapshot, drive, path, threshold, driveType) {
    let fileDeviations = [];
    if (driveType === "microsoft") {
        let files;
        if (drive && path)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase() && file.parentReference.path.includes(path);
            });
        else if (drive)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase();
            });
        else
            files = snapshot;

        files.forEach(file => {
            if (file.folder) {
                // Retrieve all files in the folder
                let folderPath = file.parentReference.path + "/" + file.name;
                let filesInFolder = files.filter(f => {
                    return folderPath.endsWith(f.parentReference.path);
                });

                // Determine the frequency of each possible set of permissions in the set of files
                let permissionsFreq = [];
                for (const f of filesInFolder) {
                    const filePermissionIds = f.permissions.value.map(p => p.id);
                    let perms = permissionsFreq.find(p => setsEqual(new Set(p.permissionSet.map(p1 => p1.id)), new Set(filePermissionIds)));
                    if (perms)
                        perms["files"].push({ name: f.name, driveName: f.driveName, path: f.parentReference.path });
                    else
                        permissionsFreq.push({ permissionSet: permissionsForDisplay(f.permissions.value, driveType), files: [{ name: f.name, driveName: f.driveName, path: f.parentReference.path }] });
                }

                permissionsFreq.sort((p1, p2) => p2.files.length - p1.files.length);
                if (permissionsFreq.length > 1 && permissionsFreq[0].files.length / filesInFolder.length >= threshold) {
                    fileDeviations.push({
                        folder: { name: file.name, driveName: file.driveName, path: file.parentReference.path },
                        majorityPermissionSet: permissionsFreq[0],
                        minorityPermissionSets: permissionsFreq.slice(1)
                    });
                }
            }
        });
    }
    // Deviant sharing for Google Drive
    else if (driveType === "google") {
        let files = [];
        if (drive && path)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase() && file.path && file.path.includes(path);
            });
        else if (drive)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase();
            });
        else
            files = snapshot;

        files.forEach(file => {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                // Retrieve all files in the folder
                let filesInFolder = files.filter(f => {
                    return f.parents && f.parents.length > 0 && f.parents[0] === file.id;
                });

                // Determine the frequency of each possible set of permissions in the set of files
                let permissionsFreq = [];
                for (const f of filesInFolder) {
                    if (f.permissions) {
                        const filePermissionIds = f.permissions.map(p => p.id);
                        let perms = permissionsFreq.find(p => setsEqual(new Set(p.permissionSet.map(p1 => p1.id)), new Set(filePermissionIds)));
                        if (perms)
                            perms["files"].push({ name: f.name, driveName: f.driveName, path: f.path ? f.path : 'unavailable' });
                        else
                            permissionsFreq.push({ permissionSet: permissionsForDisplay(f.permissions, driveType), files: [{ name: f.name, driveName: f.driveName, path: f.path ? f.path : 'unavailable' }] });
                    }
                }

                permissionsFreq.sort((p1, p2) => p2.files.length - p1.files.length);
                if (permissionsFreq.length > 1 && permissionsFreq[0].files.length / filesInFolder.length >= threshold) {
                    fileDeviations.push({
                        folder: { name: file.name, driveName: file.driveName, path: file.path ? file.path : 'unavailable' },
                        majorityPermissionSet: permissionsFreq[0],
                        minorityPermissionSets: permissionsFreq.slice(1)
                    });
                }
            }
        });
    }

    return fileDeviations;
}

function fileFolderSharingChanges(snapshot, drive, path, driveType) {
    let fileFolderDifferences = [];
    if (driveType === "microsoft") {
        let files;
        if (drive && path)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase() && file.parentReference.path.includes(path);
            });
        else if (drive)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase();
            });
        else
            files = snapshot;

        files.forEach(file => {
            if (file.folder) {
                // Retrieve all files in the folder
                let folderPath = file.parentReference.path + "/" + file.name;
                let filesInFolder = files.filter(f => {
                    return folderPath.endsWith(f.parentReference.path);
                });

                // Determine the files with sharing differences from the folder
                let permissionDifferences = [];
                const folderPermissionIds = file.permissions.value.map(p => p.id);
                for (const f of filesInFolder) {
                    const filePermissionIds = f.permissions.value.map(p => p.id);
                    if (!setsEqual(new Set(filePermissionIds), new Set(folderPermissionIds)))
                        permissionDifferences.push({
                            file: { name: f.name, driveName: f.driveName, path: f.parentReference.path },
                            permissions: permissionsForDisplay(f.permissions.value, driveType)
                        });
                }

                if (permissionDifferences.length > 0)
                    fileFolderDifferences.push({
                        folder: { name: file.name, driveName: file.driveName, path: file.parentReference.path, permissions: permissionsForDisplay(file.permissions.value, driveType) },
                        differences: permissionDifferences
                    });
            }
        });
    }
    // File-folder sharing differences for Google Drive
    else if (driveType === "google") {
        let files = [];
        if (drive && path)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase() && file.path && file.path.includes(path);
            });
        else if (drive)
            files = snapshot.filter(file => {
                return file.driveName.toLowerCase() === drive.toLowerCase();
            });
        else
            files = snapshot;

        files.forEach(file => {
            if (file.mimeType === 'application/vnd.google-apps.folder' && file.permissions) {
                // Retrieve all files in the folder
                let filesInFolder = files.filter(f => {
                    return f.parents && f.parents.length > 0 && f.parents[0] === file.id;
                });

                // Determine the files with sharing differences from the folder
                let permissionDifferences = [];
                const folderPermissionIds = file.permissions.map(p => p.id);
                for (const f of filesInFolder) {
                    if (f.permissions) {
                        const filePermissionIds = f.permissions.map(p => p.id);
                        if (!setsEqual(new Set(filePermissionIds), new Set(folderPermissionIds)))
                            permissionDifferences.push({
                                file: { name: f.name, driveName: f.driveName, path: f.path ? f.path : 'unavailable' },
                                permissions: permissionsForDisplay(f.permissions, driveType)
                            });
                    }
                }

                if (permissionDifferences.length > 0)
                    fileFolderDifferences.push({
                        folder: { name: file.name, driveName: file.driveName, path: file.path ? file.path : 'unavailable', permissions: permissionsForDisplay(file.permissions, driveType) },
                        differences: permissionDifferences
                    });
            }
        });
    }

    return fileFolderDifferences;
}


function snapshotsSharingChanges(snapshot1, snapshot2, driveType) {
    let editedFiles = [];
    let newFiles;
    if (driveType === "microsoft") {
        newFiles = snapshot2.filter(file2 => {
            let file1 = snapshot1.find(f => f.id === file2.id);
            if (!file1) {
                return true;
            } else {
                let file1PermissionIds = file1.permissions.value.map(p => p.id);
                let file2PermissionIds = file2.permissions.value.map(p => p.id);

                let addedPermissionIds = file2PermissionIds.filter(id => !file1PermissionIds.includes(id));
                let addedPermissions = file2.permissions.value.filter(p => addedPermissionIds.includes(p.id));
                let addedPermsForDisplay = permissionsForDisplay(addedPermissions, driveType);

                let removedPermissionIds = file1PermissionIds.filter(id => !file2PermissionIds.includes(id));
                let removedPermissions = file1.permissions.value.filter(p => removedPermissionIds.includes(p.id));
                console.log(file1);
                let removedPermsForDisplay = permissionsForDisplay(removedPermissions, driveType);

                if (addedPermissions.length > 0 || removedPermissions.length > 0)
                    editedFiles.push({ file: { name: file2.name, driveName: file2.driveName, path: file2.parentReference.path }, addedPermissions: addedPermsForDisplay, removedPermissions: removedPermsForDisplay });
                return false;
            }
        }).map(f => {
            return { name: f.name, driveName: f.driveName, path: f.parentReference.path };
        });
    }

    // Snapshot sharing changes for Google Drive
    else if (driveType === "google") {
        newFiles = snapshot2.filter(file2 => {
            let file1 = snapshot1.find(f => f.id === file2.id);
            if (!file1) {
                return true;
            } else {
                if(file1.permissions && file2.permissions) {
                    let file1PermissionIds = file1.permissions.map(p => p.id);
                    let file2PermissionIds = file2.permissions.map(p => p.id);

                    let addedPermissionIds = file2PermissionIds.filter(id => !file1PermissionIds.includes(id));
                    let addedPermissions = file2.permissions.filter(p => addedPermissionIds.includes(p.id));
                    let addedPermsForDisplay = permissionsForDisplay(addedPermissions, driveType);

                    let removedPermissionIds = file1PermissionIds.filter(id => !file2PermissionIds.includes(id));
                    let removedPermissions = file1.permissions.filter(p => removedPermissionIds.includes(p.id));
                    let removedPermsForDisplay = permissionsForDisplay(removedPermissions, driveType);

                    if (addedPermissions.length > 0 || removedPermissions.length > 0)
                        editedFiles.push({ file: { name: file2.name, driveName: file2.driveName, path: file2.path ? file2.path : 'unavailable' }, addedPermissions: addedPermsForDisplay, removedPermissions: removedPermsForDisplay });
                }
                return false;
            }
        }).map(f => {
            return { name: f.name, driveName: f.driveName, path: f.path ? f.path : 'unavailable' };
        });
    }

    return { new: newFiles, edited: editedFiles };
}

function permissionsForDisplay(permissions, driveType) {
    let permsForDisplay = [];
    if(driveType === "microsoft") {
        for (const permission of permissions) {
            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                permsForDisplay.push({
                    id: permission.id,
                    role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                    type: "users",
                    value: permission.grantedToIdentitiesV2.map(user => user.siteUser.email)
                });
            } else if (permission.grantedToV2) {
                permsForDisplay.push({
                    id: permission.id,
                    role: permission.roles.length > 0 ? permission.roles[0] : "unavailable",
                    type: "users",
                    value: permission.grantedToV2.siteUser.email
                });
            } else if (permission.link && permission.link.scope === "anonymous") {
                permsForDisplay.push({
                    id: permission.id,
                    role: permission.link.type,
                    type: "anonymous",
                    value: "n/a"
                });
            } else if (permission.link && permission.link.scope === "organization") {
                console.log(permissions);
                let owner = permissions.find(p => p.roles.includes("owner"))?.grantedToV2.siteUser.email;
                permsForDisplay.push({
                    id: permission.id,
                    role: permission.link.type,
                    type: "organization",
                    value: owner ? owner.substring(owner.lastIndexOf("@") + 1) : "n/a"
                });
            }
        }
    }
    else if(driveType === "google") {
        permsForDisplay = permissions.map(p => {
            return {
                id: p.id,
                role: p.role,
                type: p.type,
                value: p.type === 'user' || p.type === 'group' ? p.emailAddress : p.type === 'domain' ? p.domain : 'n/a'
            };
        });
    }
    return permsForDisplay;
}

function setsEqual(s1, s2) {
    if (s1.size != s2.size) return false;
    for (const element of s1) {
        if (!s2.has(element)) return false;
    }
    return true;
}

export { deviantSharing, fileFolderSharingChanges, snapshotsSharingChanges };
