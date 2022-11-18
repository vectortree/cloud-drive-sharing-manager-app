export const dataFiltering= (userProfile) =>{
    let userData ={};
    if(userProfile){
        if(userProfile.user.driveType == "microsoft"){
            userData.name = userProfile.user.displayName;
            userData.email = userProfile.user.data.mail;
            userData.picture = userProfile.user.data.picture;
            let beforeHd = userProfile.user.data.mail;
            let hd = beforeHd.split('@');
            userData.domain = hd[1]; //stonybrook.edu
            userData.driveType = userProfile.user.driveType;
            userData.accessControlRequirements = userProfile.accessControlRequirements;
            userData.fileSharingSnapshots = userProfile.fileSharingSnapshots;
            userData.groupMembershipSnapshots = userProfile.groupMembershipSnapshots;
            userData.searchQueryHistory = userProfile.searchQueryHistory;
        }else if(userProfile.user.driveType == "google"){
            const {name, email, picture, hd} = userProfile.user.data;
            const {accessControlRequirements,fileSharingSnapshots,groupMembershipSnapshots,searchQueryHistory} = userProfile;
            userData ={
                name:name,
                email:email,
                picture:picture,
                domain : hd,
                driveType : userProfile.user.driveType,
                accessControlRequirements:accessControlRequirements,
                fileSharingSnapshots:fileSharingSnapshots,
                groupMembershipSnapshots:groupMembershipSnapshots,
                searchQueryHistory:searchQueryHistory
            }
        }
    }
    return userData;
}