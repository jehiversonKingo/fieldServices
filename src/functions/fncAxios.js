import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  // baseURL: 'https://4f7f-2803-d100-ea40-82d-b427-3254-ad2d-eb87.ngrok-free.app/stack-ant-prod/us-central1/fieldservice',
  baseURL: process.env.REACT_APP_URI_FIELD,
});

export const axiosInstanceShopkeeper = axios.create({
  // baseURL: "https://4f7f-2803-d100-ea40-82d-b427-3254-ad2d-eb87.ngrok-free.app/stack-ant-prod/us-central1/shopkeeperapi",
  baseURL: process.env.REACT_APP_URI_SHOPKEEPER,
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