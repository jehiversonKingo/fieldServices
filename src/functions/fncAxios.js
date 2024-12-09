import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_URI_FIELD,
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
