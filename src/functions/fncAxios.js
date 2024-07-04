import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  // baseURL: 'https://mb91xm47-5000.use2.devtunnels.ms/stack-ant-prod/us-central1/antServices',
  baseURL: process.env.REACT_APP_URI_FIELD,
});

export const axiosInstanceShopkeeper = axios.create({
  baseURL: process.env.REACT_APP_URI_SHOPKEEPER,
  // baseURL: "https://c763-45-173-219-85.ngrok-free.app/stack-ant-dev/us-central1/shopkeeperapi",
  headers: {token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEN1c3RvbWVyIjoxNTcsIm5hbWUiOiJSb3hhbmEgTGFyYSIsImRwaSI6IjExMTExMTIiLCJwaG9uZSI6Iis1MDIzNTMwMzczNyIsImlhdCI6MTcwMTEyMjk2N30.ea56HMWHS3v-Tgcvzj5C_EKZY7qi7V4u549sVWRj8zI'},
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