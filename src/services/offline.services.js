import {axiosInstanceShopkeeper} from '../functions/fncAxios';

export const uploatDataOffline = async (data) => {
    return axiosInstanceShopkeeper
    .post(`/offline/syncData`, data)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
};

export const deleteStorageCollection = async(data) => {
  return axiosInstanceShopkeeper
    .post(`/offline/deleteStorageCollection`, data)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
}