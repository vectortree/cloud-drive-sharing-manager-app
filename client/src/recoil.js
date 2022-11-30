import { atom } from "recoil";

export const AccessControlData = atom({
    key: 'AccessControlData', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)
});
export const FileSelectedData = atom({
    key:'FileSelectedData',
    default:{
        shared:{scope:""},
        type:"",
        size:0,
        createdBy:{user:{displayName:""}},
        permission:{value: [],direct:[],inherited:[]},
        permissions:{value: [], direct:[],inherited:[]}
    },
})
export const FileSharingSnapShotData = atom({
    key:'FileSharingSnapShotData',
    default:[],
})
export const selectedSnapshot = atom({
    key:'selectedSnapshot',
    default:{data:[]},
})
export const GroupMembershipSnapshotsData = atom({
    key:'GroupMembershipSnapshotsData',
    default:[],
})
export const searchQueryHistoryData = atom({
    key:'searchQueryHistoryData',
    default:[],
})
export const selectedCheckSnapshot = atom({
    key:'selectedCheckSnapshot',
    default:{data:{}},
})
export const fileSortingData = atom({
    key:'fileSortingData',
    default:"owner",
})
export const SortingFlag = atom({
    key:'SortingFlag',
    default: 0,
})
export const GMSMember = atom({
    key:'GMSMember',
    default: [],
})
export const fileData = atom({
    key:'fileData',
    default:[],
})
export const rawFileData = atom({
    key:'rawFileData',
    default:[],
})
export const searchHistoryDisplay = atom({
    key:"searchHistoryDisplay",
    default:[]
})