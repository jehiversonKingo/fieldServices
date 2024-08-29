import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  baseURL: 'https://898c-200-35-181-90.ngrok-free.app/stack-hybrico-a68e6/us-central1/hybrico',
  // baseURL: process.env.REACT_APP_URI_FIELD,
  // baseURL: 'https://us-central1-stack-ant-dev.cloudfunctions.net/fieldservice',
});

export const axiosInstanceShopkeeper = axios.create({
  baseURL: process.env.REACT_APP_URI_SHOPKEEPER,
  headers: {
    token: process.env.REACT_APP_SHOPKEEPER_TOKEN,
  },
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