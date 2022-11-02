/*
    This function checks whether a snapshot satisfies all,
    or a selected subset, of the access control requirements
    stored in the user's profile. If not, the system displays
    details of the violations. By default, the most recent file
    sharing snapshot is used. The user can choose to use an earlier
    snapshot.
    Input:
        1) currentSnapshot (Snapshot object)
        2) requirements (Array of access control requirements)
        3) driveType ("google" or "microsoft")
*/
function checkRequirements(currentSnapshot, requirements, driveType) {
    let violations = [];
    if(driveType === "google") {
        requirements.forEach((requirement) => {
            // TODO: Call function that returns a subset of files, given a snapshot
            // and a search query. For now, we will use all files in the current snapshot.
            // let files = filterSnapshotBySearchQuery(currentSnapshot, requirements.searchQuery, driveType);
            let files = currentSnapshot.data;
            files.forEach((file) => {
                // Note: Some files don't contain permissions.
                // According to the Google Drive API:
                // The permissions array is only available if the requesting
                // user can share the file. Not populated for items in shared drives.
                let violation = {
                    requirement: requirement,
                    file: file,
                    data: []
                };
                file.permissions.forEach((permission) => {
                    // Check each permission against current requirement
                    let readerRoles = ["commenter, reader"];
                    let writerRoles = ["writer", "fileOrganizer", "organizer", "owner"];
                    if(permission.type === "user" || permission.type === "group") {
                        // The following must be satisfied:
                        // 1) If the permission role is in
                        //    {"commenter", "reader"} and AR is nonempty,
                        //    then the email address or its domain must be in AR.
                        // 2) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and AW is nonempty,
                        //    then the email address or its domain must be in AW.
                        // 3) If the permission role is in
                        //    {"commenter", "reader"} and DR is nonempty,
                        //    then the email address or its domain must NOT be in DR.
                        // 4) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and DW is nonempty,
                        //    then the email address or its domain must NOT be in DW.
                        // 5) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and DR is nonempty,
                        //    then the email address or its domain must NOT be in DR.
                        let address = permission.emailAddress;
                        let domain = permission.emailAddress.substring(permission.emailAddress.lastIndexOf("@") + 1);
                        if(requirement.allowedReaders.length > 0 && readerRoles.includes(permission.role)) {
                            if(!requirement.allowedReaders.includes(address) && !requirement.allowedReaders.includes(domain)) {
                                violation.data.push({
                                    permission: permission, 
                                    violationType: "read",
                                    message: address + " is not in the set of allowed readers"
                                });
                            }
                        }
                        if(requirement.allowedWriters.length > 0 && writerRoles.includes(permission.role)) {
                            if(!requirement.allowedWriters.includes(address) && !requirement.allowedWriters.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: address + " is not in the set of allowed writers"
                                });
                            }
                        }
                        if(requirement.deniedReaders.length > 0 && readerRoles.includes(permission.role)) {
                            if(requirement.deniedReaders.includes(address) || requirement.deniedReaders.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "read",
                                    message: address + " is in the set of denied readers"
                                });
                            }
                        }
                        if(requirement.deniedWriters.length > 0 && writersRoles.includes(permission.role)) {
                            if(requirement.deniedWriters.includes(address) || requirement.deniedWriters.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: address + " is in the set of denied writers"
                                });
                            }
                        }
                        if(requirement.deniedReaders.length > 0 && writersRoles.includes(permission.role)) {
                            if(requirement.deniedReaders.includes(address) || requirement.deniedReaders.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: address + " is in the set of denied readers"
                                });
                            }
                        }
                    }
                    else if(permission.type === "domain") {
                        // The following must be satisfied:
                        // 1) If the permission role is in
                        //    {"commenter", "reader"} and AR is nonempty,
                        //    then the domain must be in AR.
                        // 2) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and AW is nonempty,
                        //    then the domain must be in AW.
                        // 3) If the permission role is in
                        //    {"commenter", "reader"} and DR is nonempty,
                        //    then the domain as well as any address belonging to that domain must NOT be in DR.
                        // 4) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and DW is nonempty,
                        //    then the domain as well as any address belonging to that domain must NOT be in DW.
                        // 5) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"} and DR is nonempty,
                        //    then the domain as well as any address belonging to that domain must NOT be in DR.
                        let domain = permission.domain;
                        if(requirement.allowedReaders.length > 0 && readerRoles.includes(permission.role)) {
                            if(!requirement.allowedReaders.includes(domain)) {
                                violation.data.push({
                                    permission: permission, 
                                    violationType: "read",
                                    message: domain + " is not in the set of allowed readers"
                                });
                            }
                        }
                        if(requirement.allowedWriters.length > 0 && writerRoles.includes(permission.role)) {
                            if(!requirement.allowedWriters.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: domain + " is not in the set of allowed writers"
                                });
                            }
                        }
                        if(requirement.deniedReaders.length > 0 && readerRoles.includes(permission.role)) {
                            let deniedReadersDomains = requirement.deniedReaders.map(s => s.substring(s.lastIndexOf("@") + 1));
                            if(deniedReadersDomains.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "read",
                                    message: domain + " is in the set of denied readers"
                                });
                            }
                        }
                        if(requirement.deniedWriters.length > 0 && writersRoles.includes(permission.role)) {
                            let deniedWritersDomains = requirement.deniedWriters.map(s => s.substring(s.lastIndexOf("@") + 1));
                            if(deniedWritersDomains.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: domain + " is in the set of denied writers"
                                });
                            }
                        }
                        if(requirement.deniedReaders.length > 0 && writersRoles.includes(permission.role)) {
                            let deniedReadersDomains = requirement.deniedReaders.map(s => s.substring(s.lastIndexOf("@") + 1));
                            if(deniedReadersDomains.includes(domain)) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: domain + " is in the set of denied readers"
                                });
                            }
                        }
                    }
                    else if(permission.type === "anyone") {
                        // The following must be satisfied:
                        // 1) If the permission role is in
                        //    {"commenter", "reader"}, then AR and DR must be empty
                        // 2) If the permission role is in
                        //    {"writer", "fileOrganizer", "organizer", "owner"}, then AW, DW, and DR must be empty
                        if(readerRoles.includes(permission.role)) {
                            if(requirement.allowedReaders.length > 0) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "read",
                                    message: "Set of allowed readers is not empty"
                                });
                            }
                            if(requirement.deniedReaders.length > 0) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "read",
                                    message: "Set of denied readers is not empty"
                                });
                            }
                        }
                        if(writerRoles.includes(permission.role)) {
                            if(requirement.allowedWriters.length > 0) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: "Set of allowed writers is not empty"
                                });
                            }
                            if(requirement.deniedWriters.length > 0) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: "Set of denied writers is not empty"
                                });
                            }
                            if(requirement.deniedReaders.length > 0) {
                                violation.data.push({
                                    permission: permission,
                                    violationType: "write",
                                    message: "Set of denied readers is not empty"
                                });
                            }
                        }
                    }
                });
                violations.push(violation);
            });
        });
    }
    // TODO
    else if(driveType === "microsoft") {

    }
    return violations;
}

export { checkRequirements };