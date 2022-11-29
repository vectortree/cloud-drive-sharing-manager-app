/*
    This function returns an array of the closest group-membership snapshots
    with respect to the current file-sharing snapshot.
    If the user has uploaded multiple group-membership snapshots for an
    email address A, the function selects the group-membership snapshot for A whose
    timestamp T’ is closest to the timestamp T of the current file-sharing snapshot.

    Input:
        1) groupMembershipSnapshots (Array of all group-membership snapshots in user profile)
        2) currentSnapshot (Current file-sharing snapshot object)
    Output:
        closestGMSnapshots (Array of closest group-membership snapshots to currentSnapshot)
        
*/
function getClosestGMSnapshots(groupMembershipSnapshots, currentSnapshot) {
    let closestGMSnapshots = groupMembershipSnapshots.slice();
    let fsTimestamp = currentSnapshot.createdAt;
    closestGMSnapshots.sort((s1, s2) => Math.abs(s1.timestamp - fsTimestamp) - Math.abs(s2.timestamp - fsTimestamp));
    closestGMSnapshots = closestGMSnapshots.filter((value, index, self) =>
        index == self.findIndex((s) => s.groupAddress.toLowerCase() === value.groupAddress.toLowerCase())
    );
    return closestGMSnapshots;
}

/*
    This function returns the group-membership snapshot with the provided group address.
*/
function getGMSnapshot(closestGMSnapshots, groupAddress) {
    for(const groupMembershipSnapshot of closestGMSnapshots) {
        if(groupMembershipSnapshot.groupAddress.toLowerCase() === groupAddress.toLowerCase())
            return groupMembershipSnapshot;
    }
    return null;
}

/*
    This function returns a list of addresses of groups that the provided user is a member of.
*/
function getGroupAddresses(closestGMSnapshots, userAddress) {
    let groupAddresses = [];
    closestGMSnapshots.forEach((groupMembershipSnapshot) => {
        if(groupMembershipSnapshot.members.includes(userAddress.toLowerCase())) {
            groupAddresses.push(groupMembershipSnapshot.groupAddress);
        }
    });
    return groupAddresses;
}

export { getClosestGMSnapshots, getGMSnapshot, getGroupAddresses };