import {
  axiosInstance,
  customHeadersAuth
} from '../functions/fncAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setVoucher = async (data) => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const headers = await customHeadersAuth();
  const response = await axiosInstance
    .post(
      '/sales/voucher/user/create',
      { ...data, idUser: user.idUser }, headers)
  console.log("[ SET VOUCHER ] => ", response);
  return response.data
};

export const getTransactionAgent = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstance
    .get(`/sales/transaction/user/list/${user.idUser}`, headers)
  return response.data
};

export const getDebetAgent = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstance
    .get(`/sales/balance/debt/user/${user.idUser}`, headers)
  return response.data
}

export const getWallerByUser = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  console.log(user.idUser);
  const response = await axiosInstance
    .get(`/settings/wallet/user/${user.idUser}`, headers)
  return response.data
}