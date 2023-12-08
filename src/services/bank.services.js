import { axiosInstanceShopkeeper } from '../functions/fncAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setVoucher = async (data) => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstanceShopkeeper
    .post(
      '/sales/voucher/user/create',
      { ...data, idUser: user.idUser })
  return response.data
};

export const getTransactionAgent = async () => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstanceShopkeeper
    .get(`/sales/transaction/user/list/${user.idUser}`)
  return response.data
};

export const getDebetAgent = async () => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstanceShopkeeper
    .get(`/sales/balance/debt/user/${user.idUser}`)
  return response.data
}

export const getWallerByUser = async () => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstanceShopkeeper
    .get(`/settings/wallet/user/${user.idUser}`)
  return response.data
}