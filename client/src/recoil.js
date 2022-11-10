import { atom } from "recoil";
let AccessControl = {
    allowedReaders:[],
    allowedWriters:[],
    createdAt:"",
    deniedReaders:[],
    deniedWriters:[],
    id: 0,
    name:"",
    searchQuery: "",
    updatedAt:"",
    _id: ""
}

let AccessControlList = AccessControl[30];

export const AccessControlData = atom({
    key: 'AccessControlData', // unique ID (with respect to other atoms/selectors)
    default: {}, // default value (aka initial value)

});
