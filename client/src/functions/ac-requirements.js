import { filterSnapshotBySearchQuery } from './query';

/*
    This function checks whether a snapshot satisfies all,
    or a selected subset, of the access control requirements
    stored in the user's profile. If not, the system displays
    details of the violations. By default, the most recent file
    sharing snapshot is used. The user can choose to use an earlier
    snapshot.
    Note: The caller must first get an array of the closest group-membership
    snapshots before calling this function.
    Input:
        1) currentSnapshot (File-sharing snapshot object)
        2) closestGMSnapshots (Array of closest group-membership snapshots to currentSnapshot)
        2) requirements (Array of access control requirements)
        3) driveType ("google" or "microsoft")
    Output:
        violations (Array of violation objects)
                    
    Note: Each violation object is of the form: {requirement, file, data}.
          The data field is an array of objects of the form:
          {permission, violationType, message}.
*/
function checkRequirements(currentSnapshot, closestGMSnapshots, requirements, driveType) {
    let violations = [];
    if(driveType === "google") {
        const readerRoles = ["commenter, reader"];
        const writerRoles = ["writer", "fileOrganizer", "organizer", "owner"];
        requirements.forEach((requirement) => {
            let files = Array.from(filterSnapshotBySearchQuery(currentSnapshot.data, requirement.searchQuery, driveType));
            //let files = currentSnapshot.data;
            files.forEach((file) => {
                let violation = {
                    requirement: requirement,
                    file: file,
                    data: []
                };
                // Note: Some files don't contain permissions.
                // According to the Google Drive API:
                // The permissions array is only available if the requesting
                // user can share the file. Not populated for items in shared drives.

                // Note: If no permissions exist for a file, then no violations
                // will be returned for the file.
                if(file.permissions) {
                    file.permissions.forEach((permission) => {
                        // Check each permission against current requirement
                        if(permission.type === "user" || (permission.type === "group" && (!requirement.group || !(getGMSnapshot(closestGMSnapshots, permission.emailAddress))))) {
                            // If permission type is "group" and, group is off or no
                            // group-membership snapshots are found for the group address,
                            // then treat the email address as an individual user.
                            // The following must be satisfied:
                            // 1) If the permission role is in
                            //    {"commenter", "reader"} and AR is nonempty,
                            //    then the email address or its domain (or its group, if on)
                            //    must be in AR.
                            // 2) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and AW is nonempty,
                            //    then the email address or its domain (or its group, if on)
                            //    must be in AW.
                            // 3) If the permission role is in
                            //    {"commenter", "reader"} and DR is nonempty,
                            //    then the email address and its domain (and its group, if on)
                            //    must NOT be in DR.
                            // 4) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and DW is nonempty,
                            //    then the email address and its domain (and its group, if on)
                            //    must NOT be in DW.
                            // 5) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and DR is nonempty,
                            //    then the email address and its domain (and its group, if on)
                            //    must NOT be in DR.
                            let address = permission.emailAddress;
                            let domain = permission.emailAddress.substring(permission.emailAddress.lastIndexOf("@") + 1);
                            if(requirement.allowedReaders.length > 0 && readerRoles.includes(permission.role)) {
                                if(!requirement.allowedReaders.includes(address) && !requirement.allowedReaders.includes(domain)) {
                                    if(!requirement.group) {
                                        violation.data.push({
                                            permission: permission, 
                                            violationType: "read",
                                            message: address + " or " + domain + " is not in the set of allowed readers"
                                        });
                                    }
                                    else {
                                        let groupAddresses = getGroupAddresses(closestGMSnapshots, address);
                                        if(groupAddresses.length == 0) {
                                            violation.data.push({
                                                permission: permission, 
                                                violationType: "read",
                                                message: address + " or " + domain + " is not in the set of allowed readers"
                                            });
                                        }
                                        else {
                                            let intersection = groupAddresses.filter(x => requirement.allowedReaders.includes(x));
                                            if(intersection.length == 0) {
                                                let groupMsg = getGroupAddressesMessage(groupAddresses);
                                                violation.data.push({
                                                    permission: permission,
                                                    violationType: "read",
                                                    message: address + ", " + domain + groupMsg + " is not in the set of allowed readers"
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                            if(requirement.allowedWriters.length > 0 && writerRoles.includes(permission.role)) {
                                if(!requirement.allowedWriters.includes(address) && !requirement.allowedWriters.includes(domain)) {
                                    if(!requirement.group) {
                                        violation.data.push({
                                            permission: permission,
                                            violationType: "write",
                                            message: address + " or " + domain + " is not in the set of allowed writers"
                                        });
                                    }
                                    else {
                                        let groupAddresses = getGroupAddresses(closestGMSnapshots, address);
                                        if(groupAddresses.length == 0) {
                                            violation.data.push({
                                                permission: permission, 
                                                violationType: "write",
                                                message: address + " or " + domain + " is not in the set of allowed writers"
                                            });
                                        }
                                        else {
                                            let intersection = groupAddresses.filter(x => requirement.allowedWriters.includes(x));
                                            if(intersection.length == 0) {
                                                let groupMsg = getGroupAddressesMessage(groupAddresses);
                                                violation.data.push({
                                                    permission: permission,
                                                    violationType: "write",
                                                    message: address + ", " + domain + groupMsg + " is not in the set of allowed writers"
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                            if(requirement.deniedReaders.length > 0 && readerRoles.includes(permission.role)) {
                                if(requirement.deniedReaders.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: address + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.deniedReaders.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: domain + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.group) {
                                    let groupAddresses = getGroupAddresses(closestGMSnapshots, address);
                                    if(groupAddresses.length > 0) {
                                        let intersection = groupAddresses.filter(x => requirement.deniedReaders.includes(x));
                                        intersection.forEach((groupAddr) => {
                                            violation.data.push({
                                                permission: permission,
                                                violationType: "read",
                                                message: groupAddr + " is in the set of denied readers"
                                            });
                                        });
                                    }
                                }
                            }
                            if(requirement.deniedWriters.length > 0 && writersRoles.includes(permission.role)) {
                                if(requirement.deniedWriters.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: address + " is in the set of denied writers"
                                    });
                                }
                                if(requirement.deniedWriters.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: domain + " is in the set of denied writers"
                                    });
                                }
                                if(requirement.group) {
                                    let groupAddresses = getGroupAddresses(closestGMSnapshots, address);
                                    if(groupAddresses.length > 0) {
                                        let intersection = groupAddresses.filter(x => requirement.deniedWriters.includes(x));
                                        intersection.forEach((groupAddr) => {
                                            violation.data.push({
                                                permission: permission,
                                                violationType: "write",
                                                message: groupAddr + " is in the set of denied writers"
                                            });
                                        });
                                    }
                                }
                            }
                            if(requirement.deniedReaders.length > 0 && writersRoles.includes(permission.role)) {
                                if(requirement.deniedReaders.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: address + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.deniedReaders.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: domain + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.group) {
                                    let groupAddresses = getGroupAddresses(closestGMSnapshots, address);
                                    if(groupAddresses.length > 0) {
                                        let intersection = groupAddresses.filter(x => requirement.deniedReaders.includes(x));
                                        intersection.forEach((groupAddr) => {
                                            violation.data.push({
                                                permission: permission,
                                                violationType: "write",
                                                message: groupAddr + " is in the set of denied readers"
                                            });
                                        });
                                    }
                                }
                            }
                        }
                        else if(permission.type === "group" && requirement.group) {
                            // The following must be satisfied:
                            // 1) If the permission role is in
                            //    {"commenter", "reader"} and AR is nonempty,
                            //    then the email address of the group, its domain, or all member addresses of the group must be in AR.
                            // 2) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and AW is nonempty,
                            //    then the email address of the group, its domain, or all member addresses of the group must be in AW.
                            // 3) If the permission role is in
                            //    {"commenter", "reader"} and DR is nonempty,
                            //    then the email address of the group, its domain, and any member addresses of the group must NOT be in DR.
                            // 4) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and DW is nonempty,
                            //    then the email address of the group, its domain, and any member addresses of the group must NOT be in DW.
                            // 5) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"} and DR is nonempty,
                            //    then the email address of the group, its domain, and any member addresses of the group must NOT be in DR.
                            let address = permission.emailAddress;
                            let domain = permission.emailAddress.substring(permission.emailAddress.lastIndexOf("@") + 1);
                            // Note: This should always return a non-null group-membership snapshot.
                            // The null case is handled in the previous branch.
                            let groupMembershipSnapshot = getGMSnapshot(closestGMSnapshots, address);
                            let members = groupMembershipSnapshot.members;
                            if(requirement.allowedReaders.length > 0 && readerRoles.includes(permission.role)) {
                                let diff = members.filter(member => !requirement.allowedReaders.includes(member));
                                if(!requirement.allowedReaders.includes(address) && !requirement.allowedReaders.includes(domain) && diff.length > 0) {
                                    violation.data.push({
                                        permission: permission, 
                                        violationType: "read",
                                        message: address + " or " + domain + " is not in the set of allowed readers"
                                    });
                                    let groupMsg = getGroupMembersMessage(diff);
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message:  "The following members of " + address + " are not in the set of allowed readers: " + groupMsg;
                                    });
                                }
                            }
                            if(requirement.allowedWriters.length > 0 && writerRoles.includes(permission.role)) {
                                let diff = members.filter(member => !requirement.allowedWriters.includes(member));
                                if(!requirement.allowedWriters.includes(address) && !requirement.allowedWriters.includes(domain) && diff.length > 0) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: address + " or " + domain + " is not in the set of allowed writers"
                                    });
                                    let groupMsg = getGroupMembersMessage(diff);
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message:  "The following members of " + address + " are not in the set of allowed writers: " + groupMsg;
                                    });
                                }
                            }
                            if(requirement.deniedReaders.length > 0 && readerRoles.includes(permission.role)) {
                                if(requirement.deniedReaders.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: address + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.deniedReaders.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: domain + " is in the set of denied readers"
                                    });
                                }
                                let intersection = members.filter(member => requirement.deniedReaders.includes(member));
                                if(intersection.length > 0) {
                                    let groupMsg = getGroupMembersMessage(intersection);
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: "The following members of " + address + " are in the set of denied readers: " + groupMsg;
                                    });
                                }
                            }
                            if(requirement.deniedWriters.length > 0 && writersRoles.includes(permission.role)) {
                                if(requirement.deniedWriters.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: address + " is in the set of denied writers"
                                    });
                                }
                                if(requirement.deniedWriters.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: domain + " is in the set of denied writers"
                                    });
                                }
                                let intersection = members.filter(member => requirement.deniedWriters.includes(member));
                                if(intersection.length > 0) {
                                    let groupMsg = getGroupMembersMessage(intersection);
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: "The following members of " + address + " are in the set of denied writers: " + groupMsg;
                                    });
                                }
                            }
                            if(requirement.deniedReaders.length > 0 && writersRoles.includes(permission.role)) {
                                if(requirement.deniedReaders.includes(address)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: address + " is in the set of denied readers"
                                    });
                                }
                                if(requirement.deniedReaders.includes(domain)) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: domain + " is in the set of denied readers"
                                    });
                                }
                                let intersection = members.filter(member => requirement.deniedReaders.includes(member));
                                if(intersection.length > 0) {
                                    let groupMsg = getGroupMembersMessage(intersection);
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: "The following members of " + address + " are in the set of denied readers: " + groupMsg;
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
                                let filteredDeniedReaders = requirement.deniedReaders.filter(s => s.substring(s.lastIndexOf("@") + 1) === domain);
                                filteredDeniedReaders.forEach((deniedReader) => {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "read",
                                        message: deniedReader + " is in the set of denied readers"
                                    });
                                });
                            }
                            if(requirement.deniedWriters.length > 0 && writersRoles.includes(permission.role)) {
                                let filteredDeniedWriters = requirement.deniedWriters.filter(s => s.substring(s.lastIndexOf("@") + 1) === domain);
                                filteredDeniedWriters.forEach((deniedWriter) => {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: deniedWriter + " is in the set of denied writers"
                                    });
                                });
                            }
                            if(requirement.deniedReaders.length > 0 && writersRoles.includes(permission.role)) {
                                let filteredDeniedReaders = requirement.deniedReaders.filter(s => s.substring(s.lastIndexOf("@") + 1) === domain);
                                filteredDeniedReaders.forEach((deniedReader) => {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: deniedReader + " is in the set of denied readers"
                                    });
                                });
                            }
                        }
                        else if(permission.type === "anyone") {
                            // The following must be satisfied:
                            // 1) If the permission role is in
                            //    {"commenter", "reader"}, then AR and DR must be empty.
                            // 2) If the permission role is in
                            //    {"writer", "fileOrganizer", "organizer", "owner"}, then AW, DW, AR, and DR must be empty.
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
                                if(requirement.allowedReaders.length > 0) {
                                    violation.data.push({
                                        permission: permission,
                                        violationType: "write",
                                        message: "Set of allowed readers is not empty"
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
                }
                // If there exists a violation for the current file and requirement pair,
                // then add the violation object to the array of violations.
                if(violation.data.length > 0) violations.push(violation);
            });
        });
    }
    // TODO
    else if(driveType === "microsoft") {

    }
    console.log(violations);
    return violations;
}

/*
    Note: This is a helper function. For internal use only.

    This function returns the group-membership snapshot with the provided group address.
*/
function getGMSnapshot(closestGMSnapshots, groupAddress) {
    closestGMSnapshots.forEach((groupMembershipSnapshot) => {
        if(groupMembershipSnapshot.groupAddress === groupAddress)
            return groupMembershipSnapshot;
    });
    return null;
}

/*
    Note: This is a helper function. For internal use only.

    This function returns a list of addresses of groups that the provided user is a member of.
*/
function getGroupAddresses(closestGMSnapshots, userAddress) {
    let groupAddresses = [];
    closestGMSnapshots.forEach((groupMembershipSnapshot) => {
        if(groupMembershipSnapshot.members.includes(userAddress)) {
            groupAddresses.push(groupMembershipSnapshot.groupAddress);
        }
    });
    return groupAddresses;
}

/*
    Note: This is a helper function. For internal use only.

    This function returns a string of group addresses formatted as follows:

    If the list of group addresses is [addr1, addr2, addr3], then the returned string
    is ", addr1, addr2, or addr3".
    If the list is [addr1], then the returned string is ", or addr1".
    If the list is [], then the returned string is "".
*/
function getGroupAddressesMessage(groupAddresses) {
    let groupMsg = "";
    groupAddresses.forEach((address, index) => {
        // Last address
        if(index == groupAddresses.length - 1) {
            groupMsg += ", or " + address;
        }
        else {
            groupMsg += ", " + address;
        }
    });
    return groupMsg;
}

/*
    Note: This is a helper function. For internal use only.

    This function returns a string of group members formatted as follows:

    If the list of group members is [mem1, mem2, mem3], then the returned string
    is "mem1, mem2, mem3".
    If the list is [mem1], then the returned string is "mem1".
    If the list is [], then the returned string is "".
*/
function getGroupMembersMessage(groupMembers) {
    let groupMsg = "";
    groupMembers.forEach((member, index) => {
        // First member
        if(index == 0) {
            groupMsg += member;
        }
        else {
            groupMsg += ", " + member;
        }
    });
    return groupMsg;
}

export { checkRequirements };