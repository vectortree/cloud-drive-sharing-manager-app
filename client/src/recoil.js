import { atom, selector } from "recoil";
import api from './api/api';

const mySelectorSelectedSnapshot = selector({
    key: 'mySelectorSelectedSnapshot',
    get: async () => {
      const res = await api.getUserProfile();
      if(res.status === 200) {
          if(res.data.profile && res.data.profile.fileSharingSnapshots.length > 0) {
              return res.data.profile.fileSharingSnapshots[res.data.profile.fileSharingSnapshots.length - 1];
          }
      }
      return {data:{}};
    }
});

const mySelectorSelectedCheckSnapshot = selector({
    key: 'mySelectorSelectedCheckSnapshot',
    get: async () => {
      const res = await api.getUserProfile();
      if(res.status === 200) {
          if(res.data.profile && res.data.profile.fileSharingSnapshots.length > 0) {
              return res.data.profile.fileSharingSnapshots[res.data.profile.fileSharingSnapshots.length - 1];
          }
      }
      return {data:{}};
    }
});

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
export const selectedSnapshot = atom({
    key:'selectedSnapshot',
    default: mySelectorSelectedSnapshot,
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
    default:mySelectorSelectedCheckSnapshot
})