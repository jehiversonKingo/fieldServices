import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  // baseURL: 'https://mb91xm47-5000.use2.devtunnels.ms/stack-ant-prod/us-central1/antServices',
  baseURL: process.env.REACT_APP_URI_FIELD,
});

export const axiosInstanceShopkeeper = axios.create({
  baseURL: process.env.REACT_APP_URI_SHOPKEEPER,
  baseURL: "https://c763-45-173-219-85.ngrok-free.app/stack-ant-dev/us-central1/shopkeeperapi",
  headers: {token: process.env.REACT_APP_SHOPKEEPER_TOKEN},
});

export const customHeadersAuth = async() => {
  const dataUser = await auth().currentUser.getIdTokenResult();
  return ({
    headers: {token: dataUser.token, 'Cache-Control': 'no-cache'},
  });
};

export const customHeadersWithoutAuth = () => {
  return ({
    headers: {'Cache-Control': 'no-cache'},
  });
};