import { atom } from "recoil";

export const isRunningRecoil = atom({
    key: "isRunningRecoil",
    default: false, // default value (aka initial value)
});

export const totalMilesRecoil = atom({
    key: "totalMilesRecoil",
    default: 0, // default value (aka initial value)
});

export const userRecoil = atom({
    key: "userRecoil",
    default: undefined, // default value (aka initial value)
});
