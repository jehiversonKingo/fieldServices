import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';

export const uploatDataOffline = async (data) => {
  const headers = await customHeadersAuth();
    return axiosInstance
    .post(`/offline/syncData`, data, headers)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
};

export const deleteStorageCollection = async(data) => {
  return axiosInstance
    .post(`/offline/deleteStorageCollection`, data, headers)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
}