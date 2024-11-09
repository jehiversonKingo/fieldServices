import axios from 'axios';
import auth from '@react-native-firebase/auth';

// console.log('[ AXIOS INSTANCE ] >> ', process.env.REACT_APP_URI_FIELD);
export const axiosInstance = axios.create({
  baseURL: 'https://66ce-200-35-181-90.ngrok-free.app/stack-ant-prod/us-central1/fieldservicetest',
  //baseURL: process.env.REACT_APP_URI_FIELD,
});
  
export const axiosInstanceShopkeeper = axios.create({
  baseURL: "https://66ce-200-35-181-90.ngrok-free.app/stack-ant-prod/us-central1/shopkeeperapitest",
  //baseURL: process.env.REACT_APP_URI_SHOPKEEPER,
  headers: {token: process.env.REACT_APP_SHOPKEEPER_TOKEN},
});

export const customHeadersAuth = async() => {
  const dataUser = await auth().currentUser.getIdTokenResult();
  return ({
    headers: {token: dataUser.token, 'Cache-Control': 'no-cache'}
  }); 
};

export const customHeadersWithoutAuth = () => {
  return ({
    headers: {'Cache-Control': 'no-cache'},
  }); 
};
