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
                        perms["files"].push(f);
                    else
                        permissionsFreq.push({ permissionSet: f.permissions.value, files: [f] });
                }

                permissionsFreq.sort((p1, p2) => p2.files.length - p1.files.length);
                if (permissionsFreq[0].length / filesInFolder.length >= threshold) {
                    fileDeviations.push({
                        folder: file,
                        majorityPermissionSet: permissionsFreq[0],
                        minorityPermissionSets: permissionsFreq.slice(1)
                    });
                }
            }
        });
    }
    // TODO: deviant sharing for Google Drive
    else if (driveType === "google") {

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
                            file: f,
                            permissions: new Set(f.permissions.value)
                        });
                }

                fileFolderDifferences.push({
                    folder: file,
                    differences: permissionDifferences
                });
            }
        });
    }
    // TODO: file-folder sharing differences for Google Drive
    else if (driveType === "google") {

    }

    return fileDeviations;
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

                let addedPermissionIds = file2PermissionIds.filter(perm => !file1PermissionIds.includes(perm));
                let addedPermissions = file2.permissions.value.filter(p => addedPermissionIds.includes(p));

                let removedPermissionIds = file1PermissionIds.filter(perm => !file2PermissionIds.includes(perm));
                let removedPermissions = file1.permissions.value.filter(p => removedPermissionIds.includes(p));

                editedFiles.push({ file: file2, addedPermissions: addedPermissions, removedPermissions: removedPermissions});
                return false;
            }
        });
    }

    // TODO: snapshot sharing changes for Google Drive
    else if (driveType === "google") {

    }

    return { new: newFiles, edited: editedFiles };
}

function setsEqual(s1, s2) {
    if (s1.size != s2.size) return false;
    for (const element of s1) {
        if (!s2.has(element)) return false;
    }
    return true;
}

export { deviantSharing, fileFolderSharingChanges, snapshotsSharingChanges };
