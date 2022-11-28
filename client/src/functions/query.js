import { getGMSnapshot, getGroupAddresses } from './gm-snapshots';


const operators = ["drive", "owner", "creator", "from", "to", "readable", "writable", "sharable", "name", "inFolder", "folder", "path", "sharing"];

/* 
    This function parses a textual query into a tree data structure 
    Here is an an example of a textual query and its corresponding tree structure.

    const searchQueryTextual = " folder:”Cool Project” and (readable:"alice@gmail.com" or readable:"bob@gmail.com") and -name:".*\.log" "
    const searchQueryParsed = {
        logicalOp: "and"
        children: [
            0: {op: folder, arg: "Cool Project", negative: False},
            1: {
                logicalOp: "or"
                children: [
                    0: {op: readable, arg: "alice@gmail.com", negative: False},
                    1: {op: readable, arg: "bob@gmail.com", negative: False}
                ]
            },
            2: {op: name, arg: ".*\.log", negative: True}
        ]
      }
*/
function serializeSearchQuery(s, topLevel) {
    if (!s) return { error: "Search query cannot be empty" };
    let sq = {};
    let parenthesesBalance = 0;
    let child;
    let children = [];
    let logicalOperator;
    let groups = true; // by default, groups are expanded
    let i = 0;
    // Check if the top level search query begins with a groups directive
    if (topLevel && s.startsWith("groups:off and ")) {
        groups = false;
        i += 15;
    } else if (topLevel && s.startsWith("groups:on and ")) {
        i += 14;
    }
    while (i < s.length) {
        if (s[i] === "(") {
            parenthesesBalance++;
            i++;
            let subQuery = "";
            while (true) {
                if (s[i] === "(") parenthesesBalance++;
                if (s[i] === ")") parenthesesBalance--;
                if (parenthesesBalance === 0) break;
                subQuery += s[i];
                i++;
                if (i === s.length) return { error: "Parentheses are not balanced." };
            }

            child = serializeSearchQuery(subQuery, false);
            if (child.error) return child;

            children.push(child);
        }

        else {
            let negative = false;
            if (s[i] === "-") {
                negative = true;
                i++;
            }
            let valid = false;
            for (const op of operators) {
                if (s.slice(i).startsWith(op)) {
                    valid = true;
                    i += op.length;
                    if (s[i] !== ":") return { error: "Query parameters must be in the form <operator>:<argument>." };
                    i++;
                    let queryArg = "";
                    if (s[i] === "\"") {
                        i++;
                        while (s[i] !== "\"") {
                            queryArg += s[i];
                            i++;
                            if (i === s.length) return { error: "Missing quotation at the end of your argument." };
                        }
                    } else {
                        while (s[i] !== " " && i < s.length) {
                            queryArg += s[i];
                            i++;
                        }
                        i--;
                    }
                    if (!queryArg) return { error: "Missing query argument." };
                    child = { negative: negative, operator: op, argument: queryArg};
                    children.push(child);
                    break;
                }
            };
            if (!valid) return { error: "Invalid query operator used." }
        }

        i++;
        if (i === s.length) break;
        if (s[i] !== " " && s[i] !== "\t") return { error: "Queries must be separated by a whitespace character." };
        while (s[i] === " " || s[i] === "\t") i++;
        if (s.slice(i).startsWith("and")) {
            if (!logicalOperator)
                logicalOperator = "and";
            else if (logicalOperator === "or") return { error: "If using multiple logical operators, use a set of parentheses to indicate which should be evaluated first." };
            i += 3;

        } else if (s.slice(i).startsWith("or")) {
            if (!logicalOperator)
                logicalOperator = "or";
            else if (logicalOperator === "and") return { error: "If using multiple logical operators of different types, use a set of parentheses to indicate which should be evaluated first." };
            i += 2;

        } else return { error: "If including multiple query parameters, you must separate them by either an 'and' or 'or' logical operator." };

        if (s[i] !== " " && s[i] !== "\t") return { error: "Queries must be separated by a whitespace character." };
        while (s[i] === " " || s[i] === "\t") i++;
    }

    if (children.length === 1) {
        if (topLevel)
            children[0]["groups"] = groups;
        return children[0];
    }

    sq["logicalOp"] = logicalOperator;
    sq["children"] = children;
    if (topLevel)
        sq["groups"] = groups;
    return sq;
}

/* 
    This function takes a structured search query, sq, and deserializes it into a string 
    that the user can understand.
*/
function deserializeSearchQuery(sq) {
    let s = "";

    // This section processes an individual operator and its argument and negativity status
    if (!sq["children"]) {
        if (sq["groups"] === false)
            s += "groups:off and ";
        if (sq["negative"])
            s += "-";
        if (sq["argument"].includes(" "))
            s += sq["operator"] + ":\"" + sq["argument"] + "\"";
        else
        s += sq["operator"] + ":" + sq["argument"];
        return s;
    }

    sq["children"].forEach((child, index) => {
        if (index !== 0) {
            s += " " + sq["logicalOp"] + " ";
        }
        s += deserializeSearchQuery(child);
    })
    if (sq["groups"] === undefined)
        return "(" + s + ")";
    return sq["groups"] ? s : "groups:off and " + s;
}

// Returns a set of files within a snapshot that satisfy the given search query
function filterSnapshotBySearchQuery(snapshot, sq, email, domain, driveType, closestGMSnapshots, groups) {
    let set = new Set();
    let arr = [];
    let userArg = "";
    let regex = new RegExp();
    if (sq.operator && driveType === "microsoft") { // checks if the search query is a single operator for OneDrive
        switch (sq.operator) {
            case "drive":
                arr = snapshot.filter(file => {
                    return file.driveName.toLowerCase() === sq.argument.toLowerCase();
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "owner":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    for (const permission of file.permissions.value) {
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && permission.roles.includes("owner")) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        } else if (permission.grantedToV2 && permission.roles.includes("owner")) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                        }
                    };
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "creator":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    return file.createdBy.user.email.toLowerCase() === userArg.toLowerCase();
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "from":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    return file.shared?.sharedBy?.user.email.toLowerCase() === userArg.toLowerCase();
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "to":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {

                    if (file.shared) {
                        let directPermissions = file.permissions.value;
                        let parent = snapshot.find(f => f.id === file.parentReference.id);
                        if (parent) {
                            let parentPermissionIds = new Set(parent.permissions.value.map(p => p.id));
                            directPermissions = file.permissions.value.filter(p => !parentPermissionIds.has(p.id));
                        }
                        for (const permission of directPermissions) {
                            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && !permission.roles.includes("owner")) {
                                for (const user of permission.grantedToIdentitiesV2) {
                                    if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                                }
                            } else if (permission.grantedToV2 && !permission.roles.includes("owner")) {
                                if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        }
                    }
                    return false;

                    // Previous implementation using inheritedFrom field:
                    // for (const permission of file.permissions.value) {
                    //     if (!permission.inheritedFrom && permission.grantedToIdentitiesV2) {
                    //         for (const user of permission.grantedToIdentitiesV2) {
                    //             if (user.user.email.toLowerCase() === userArg.toLowerCase()) return true;
                    //         }
                    //     }
                    // };
                    // return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
            
            case "readable":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    for (const permission of file.permissions.value) {
                        if (permission.link && permission.link.scope === "anonymous") {
                            return true
                        } else if (permission.link && permission.link.scope === "organization" && userArg.slice(userArg.lastIndexOf("@") + 1).toLowerCase() === domain) {
                            return true;
                        }
                        
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        } else if (permission.grantedToV2) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                        }
                    };
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "writable":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    for (const permission of file.permissions.value) {
                        if (permission.link && permission.link.scope === "anonymous" && permission.link.type === "edit") {
                            return true
                        } else if (permission.link && permission.link.scope === "organization" && permission.link.type === "edit" && userArg.slice(userArg.lastIndexOf("@") + 1).toLowerCase() === domain) {
                            return true;
                        }

                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && (permission.roles.includes("write") || permission.roles.includes("owner"))) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        } else if (permission.grantedToV2 && (permission.roles.includes("write") || permission.roles.includes("owner"))) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                        }
                    };
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "sharable":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    let existingAccess = false;
                    for (const permission of file.permissions.value) {
                        // user can share if they are an owner or editor
                        if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0 && (permission.roles.includes("owner") || permission.roles.includes("write"))) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        } else if (permission.grantedToV2 && (permission.roles.includes("owner") || permission.roles.includes("write"))) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                        }

                        // users can share if given a sharing link with edit-access
                        if (permission.link && permission.link.scope === "anonymous" && permission.link.type === "edit") {
                            return true
                        } else if (permission.link && permission.link.scope === "organization" && permission.link.type === "edit" && userArg.slice(userArg.lastIndexOf("@") + 1).toLowerCase() === domain) {
                            return true;
                        } else if (permission.link && permission.link.scope === "existingAccess" && permission.link.type === "edit") {
                            existingAccess = true;
                        } else if (permission.link && permission.link.scope === "users" && permission.link.type === "edit") {
                            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                                for (const user of permission.grantedToIdentitiesV2) {
                                    if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                                }
                            } else if (permission.grantedToV2) {
                                if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        }

                        if (existingAccess && permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                            for (const user of permission.grantedToIdentitiesV2) {
                                if (user.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        } else if (existingAccess && permission.grantedToV2) {
                            if (permission.grantedToV2.siteUser.email.toLowerCase() === userArg.toLowerCase()) return true;
                        }
                    };
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "name":
                regex = new RegExp(sq.argument);
                arr = snapshot.filter(file => {
                    return regex.test(file.name);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
        
            case "inFolder":
                regex = new RegExp(sq.argument);
                arr = snapshot.filter(file => {
                    let folders = file.parentReference.path.split("/");
                    let parent = folders[folders.length - 1];
                    return regex.test(parent);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "folder":
                regex = new RegExp(sq.argument);
                console.log(regex);
                arr = snapshot.filter(file => {
                    let folders = file.parentReference.path.split("/");
                    for (const folder of folders) {
                        if (regex.test(folder)) {
                            console.log(folder);
                            return true;
                        }
                    };
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "path":
                arr = snapshot.filter(file => {
                    return file.parentReference.path.includes(sq.argument);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "sharing":
                if (sq.argument === "none")
                    arr = snapshot.filter(file => {
                        return !file.shared;
                    });
                else if (sq.argument === "anyone")
                    arr = snapshot.filter(file => {
                        if (!file.shared) return false;
                        for (const permission of file.permissions.value) {
                            if (permission.link?.scope === "anonymous")
                                return true;
                        };
                        return false;
                    });
                else if (sq.argument === "individual")
                    arr = snapshot.filter(file => {
                        if (!file.shared) return false;
                        for (const permission of file.permissions.value) {
                            if (permission.link?.scope === "users")
                                return true;
                        };
                        return false;
                    });
                else if (sq.argument === "domain")
                    arr = snapshot.filter(file => {
                        if (!file.shared) return false;
                        for (const permission of file.permissions.value) {
                            if (permission.link?.scope === "organization")
                                return true;
                        };
                        return false;
                    });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
            
            default:
                return new Set();
        }
    } 
    
    // Filter snapshots for Google Drive
    else if (sq.operator && driveType === "google") { // checks if the search query is a single operator for Google Drive
        const writerRoles = ["writer", "fileOrganizer", "organizer", "owner"];
        let groupAddresses = [];
        switch (sq.operator) {
            case "drive":
                arr = snapshot.filter(file => {
                    return file.driveName.toLowerCase() === sq.argument.toLowerCase();
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "owner":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => file.owners && file.owners.length > 0 && file.owners[0].emailAddress.toLowerCase() === userArg.toLowerCase());
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "creator":
                // Note: Google Drive API doesn't provide the creator of a file
                // For now, we treat the "owner" and "creator" operators as equivalent for Google Drive
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => file.owners && file.owners.length > 0 && file.owners[0].emailAddress.toLowerCase() === userArg.toLowerCase());
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "from":
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => file.sharingUser && file.sharingUser.emailAddress.toLowerCase() === userArg.toLowerCase());
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "to":
                // Ignore group permissions (for individual user) and inherited permissions
                // Formula for determining direct permissions of a file F in My Drive or Shared with me:
                // directPerms(F) = F.perms \ parent(F).perms
                // For files in shared drives, use permissionDetails[0].inherited flag
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                arr = snapshot.filter(file => {
                    if (file.permissions) {
                        if(file.driveId) {
                            for (const permission of file.permissions) {
                                if ((permission.type === 'user' || permission.type === 'group') && !permission.permissionDetails[0].inherited)
                                    if (permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        }
                        else if (!file.topLevel) {
                            let parent = snapshot.find(f => f.id === file.parents[0]);
                            // If parent.permissions is null, then it means that all permissions in
                            // file.permissions are direct permissions
                            if(!parent.permissions) {
                                for (const permission of file.permissions) {
                                    if ((permission.type === 'user' || permission.type === 'group') && permission.role !== "owner")
                                        if (permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                                }
                            }
                            else {
                                let parentPermissionsIds = new Set(parent.permissions.map(p => p.id));
                                let directPermissions = file.permissions.filter(p => !parentPermissionsIds.has(p.id));
                                for (const permission of directPermissions) {
                                    if ((permission.type === 'user' || permission.type === 'group') && permission.role !== "owner")
                                        if (permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                                }
                            }
                        }
                        else {
                            for (const permission of file.permissions) {
                                if ((permission.type === 'user' || permission.type === 'group') && permission.role !== "owner")
                                    if (permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        }
                    }
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
            
            case "readable":
                // Consider group permissions only if groups:on.
                // If a file has a read permission for a group that the user is a member of,
                // then it should be included.
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                groupAddresses = getGroupAddresses(closestGMSnapshots, userArg);
                arr = snapshot.filter(file => {
                    if (file.permissions) {
                        for (const permission of file.permissions) {
                            if (permission.type === 'group' && groups && groupAddresses.includes(permission.emailAddress.toLowerCase())) return true;
                            if ((permission.type === 'user' || permission.type === 'group') && permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                        }
                    }
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "writable":
                // Consider group permissions only if groups:on.
                // If a file has a write permission for a group that the user is a member of,
                // then it should be included.
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                groupAddresses = getGroupAddresses(closestGMSnapshots, userArg);
                arr = snapshot.filter(file => {
                    if (file.permissions) {
                        for (const permission of file.permissions) {
                            if (writerRoles.includes(permission.role)) {
                                if (permission.type === 'group' && groups && groupAddresses.includes(permission.emailAddress.toLowerCase())) return true;
                                if ((permission.type === 'user' || permission.type === 'group') && permission.emailAddress.toLowerCase() === userArg.toLowerCase()) return true;
                            }
                        }
                    }
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "sharable":
                // Consider group permissions only if groups:on.
                // If a file can be shared by some group that the user is a member of,
                // then it should be included.

                // According to the Google Drive API:
                // 1. To share a file in My Drive, the user must have the role of "writer" or higher.
                //    1a. If the writersCanShare boolean value is set to False for the file, the user must have the "owner" role.
                //    1b. If the user with the role of "writer" has temporary access governed by an expiration date and time, they can't share the file.
                // 2. To share a folder in My Drive, the user must have the role of "writer" or higher.
                //    2a. If the writersCanShare boolean value is set to False for the file, the user must have the "owner" role.
                // 3. To share a file in a shared drive, the user must have the role of "writer" or higher.
                // 4. To share a folder in a shared drive, the user must have the role of "organizer."
                if (sq.argument.toLowerCase() === "me")
                    userArg = email;
                else
                    userArg = sq.argument + (sq.argument.includes("@") ? "" : ("@" + domain));
                groupAddresses = getGroupAddresses(closestGMSnapshots, userArg);
                arr = snapshot.filter(file => {
                    if (file.permissions) {
                        for (const permission of file.permissions) {
                            if (permission.type === 'user' || permission.type === 'group') {
                                if (file.driveName === 'MyDrive' || file.driveName === 'SharedWithMe') {
                                    if (writerRoles.includes(permission.role)) {
                                        if (permission.emailAddress.toLowerCase() === userArg.toLowerCase() || (groups && groupAddresses.includes(permission.emailAddress.toLowerCase()))) {
                                            if (permission.expirationTime && permission.role === 'writer')
                                                return false;
                                            if (!file.writersCanShare && permission.role === 'owner')
                                                return true;
                                            if (file.writersCanShare)
                                                return true;
                                        }
                                    }
                                }
                                else {
                                    if (writerRoles.includes(permission.role) && file.mimeType !== 'application/vnd.google-apps.folder') {
                                        if (permission.emailAddress.toLowerCase() === userArg.toLowerCase() || (groups && groupAddresses.includes(permission.emailAddress.toLowerCase())))
                                            return true;
                                    }
                                    if (file.mimeType === 'application/vnd.google-apps.folder' && permission.role === 'organizer') {
                                        if (permission.emailAddress.toLowerCase() === userArg.toLowerCase() || (groups && groupAddresses.includes(permission.emailAddress.toLowerCase())))
                                            return true;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "name":
                regex = new RegExp(sq.argument);
                arr = snapshot.filter(file => {
                    return regex.test(file.name);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
        
            case "inFolder":
                // Note: Splitting results in an empty string
                // as the first element of the array
                regex = new RegExp(sq.argument);
                arr = snapshot.filter(file => {
                    if(!file.path) return false;
                    let folders = file.path.split("/").filter(s => s.trim() !== "");
                    let parent = folders[folders.length - 1];
                    return regex.test(parent);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "folder":
                // Note: Splitting results in an empty string
                // as the first element of the array
                regex = new RegExp(sq.argument);
                console.log(regex);
                arr = snapshot.filter(file => {
                    if(!file.path) return false;
                    let folders = file.path.split("/").filter(s => s.trim() !== "");
                    for (const folder of folders) {
                        if (regex.test(folder)) {
                            console.log(folder);
                            return true;
                        }
                    }
                    return false;
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "path":
                arr = snapshot.filter(file => {
                    if(!file.path) return false;
                    return file.path.includes(sq.argument);
                });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);

            case "sharing":
                if (sq.argument === "none")
                    arr = snapshot.filter(file => {
                        if (!file.permissions) return false;
                        else {
                            for (const permission of file.permissions) {
                                if (permission.role !== "owner")
                                    return false;
                            }
                            return true;
                        }
                    });
                else if (sq.argument === "anyone")
                    arr = snapshot.filter(file => {
                        if (file.permissions) {
                            for (const permission of file.permissions) {
                                // If permission type is "anyone", then permission role cannot be "owner"
                                // since an owner must have an email address
                                if (permission.type === "anyone") return true;
                            }
                        }
                        return false;
                    });
                else if (sq.argument === "individual")
                    arr = snapshot.filter(file => {
                        if (file.permissions) {
                            for (const permission of file.permissions) {
                                if ((permission.type === "user" || permission.type === "group") && permission.role !== "owner")
                                    return true;
                            }
                        }
                        return false;
                    });
                else if (sq.argument === "domain")
                    arr = snapshot.filter(file => {
                        if (file.permissions) {
                            for (const permission of file.permissions) {
                                // If permission type is "domain", then permission role cannot be "owner"
                                // since an owner must have an email address
                                if (permission.type === "domain") return true;
                            }
                        }
                        return false;
                    });
                if (sq.negative)
                    return complement(new Set(snapshot), new Set(arr));
                return new Set(arr);
            
            default:
                return new Set();
        }
    }

    let sets = [];
    for (const child of sq.children) {
        set = filterSnapshotBySearchQuery(snapshot, child, email, domain, driveType, closestGMSnapshots, groups);
        sets.push(set)
    }

    let result;
    if (sq.logicalOp === "and") {
        result = new Set(snapshot); // initialize to universal set since this is an intersection
        sets.forEach(set => {
            result = intersect(result, set);
        });
    } else {
        result = new Set(); // initialize to empty set since this is a union
        sets.forEach(set => {
            result = union(result, set);
        });
    }

    return result;
}

// Returns the union of two sets
function union(s1, s2) {
    let union = new Set();
    for (const file of s1) {
        if (!union.has(file))
            union.add(file);
    }
    for (const file of s2) {
        if (!union.has(file))
            union.add(file);
    }
    return union;
}

// Returns the intersection of two sets
function intersect(s1, s2) {
    let intersect = new Set();
    for (const file of s1) {
        if (s2.has(file))
            intersect.add(file);
    }
    return intersect;
}

// Returns the complement of set s1 based on the universal set u
function complement(u, s1) {
    let complement = new Set();
    for (const file of u) {
        if (!s1.has(file))
            complement.add(file);
    }
    return complement;
}

export { serializeSearchQuery, deserializeSearchQuery, filterSnapshotBySearchQuery };