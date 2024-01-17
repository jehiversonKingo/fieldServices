import axios from 'axios';
import auth from '@react-native-firebase/auth';

export const axiosInstance = axios.create({
  // baseURL: 'https://v4w3k844-5000.use2.devtunnels.ms/stack-ant-dev/us-central1/antServices',
  baseURL: 'https://us-central1-stack-ant-dev.cloudfunctions.net/antServices',
  // baseURL: 'https://us-central1-stack-ant-prod.cloudfunctions.net/antServicesTest',
  // baseURL: 'https://226e-190-122-185-230.ngrok-free.app/stack-ant-prod/us-central1/antServices',
});

export const axiosInstanceShopkeeper = axios.create({
  baseURL: "https://us-central1-stack-ant-dev.cloudfunctions.net/apiShopkeeper",
  // /*PROD*/ headers: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEN1c3RvbWVyIjoxNTcsIm5hbWUiOiJSb3hhbmEgTGFyYSIsImRwaSI6IjExMTExMTIiLCJwaG9uZSI6Iis1MDIzNTMwMzczNyIsImlhdCI6MTcwMDAxMTk4MX0.6E1TDcECqLbVmN0ujW--taVzpuJYDsBjr5esg12-Ldw" },
  /*DEV*/ headers: {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEN1c3RvbWVyIjoxNTcsIm5hbWUiOiJSb3hhbmEgTGFyYSIsImRwaSI6IjExMTExMTIiLCJwaG9uZSI6Iis1MDIzNTMwMzczNyIsImlhdCI6MTcwMTEyMjk2N30.ea56HMWHS3v-Tgcvzj5C_EKZY7qi7V4u549sVWRj8zI"},
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