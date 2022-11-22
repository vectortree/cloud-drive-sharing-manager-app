import { atom } from "recoil";

export const AccessControlData = atom({
    key: 'AccessControlData', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)
});
export const FileSelectedData = atom({
    key:'FileSelectedData',
    default:[],
})
export const FileSharingSnapShotData = atom({
    key:'FileSharingSnapShotData',
    default:[],
})
export const GroupMembershipSnapshotsData = atom({
    key:'GroupMembershipSnapshotsData',
    default:[],
})
export const searchQueryHistoryData = atom({
    key:'searchQueryHistoryData',
    default:[],
})