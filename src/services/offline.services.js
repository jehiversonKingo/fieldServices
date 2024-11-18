import {axiosInstance} from '../functions/fncAxios';

export const uploatDataOffline = async (data) => {
    return axiosInstance
    .post(`/offline/syncData`, data)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
};

export const deleteStorageCollection = async(data) => {
  return axiosInstance
    .post(`/offline/deleteStorageCollection`, data)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
}