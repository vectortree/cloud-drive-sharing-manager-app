import { atom } from "recoil";

export const AccessControlData = atom({
    key: 'AccessControlData', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)

});
