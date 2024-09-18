import /* storage, */ { firebase } from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import {handleTraslateMessageFirebaseError} from '../functions/fncGeneral';
import {getUserByUid} from '../services/auth.services';

export const handleUpdateImage = async (label, area, imgFile) => {
  let name = `${area}-${label.toString().replace(/\s+/g, '')}-${moment(new Date()).format('DDMMYYYYhhmmss')}`;
  //you will use this when need add file at default bucket but in this case i need use other bucket
  //const reference = storage().ref(name);
        let flag = await new Promise(async (response, reject) =>{
          const reference = firebase.app().storage(`${process.env.REACT_APP_BUCKET}/${area}`).ref(name);
          const task = reference.putFile(`file://${imgFile.path}`); 
          task.on('state_changed', taskSnapshot => {
            console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
          });
 
          task.then(async() => { 
            const url = await firebase.app().storage(`${process.env.REACT_APP_BUCKET}/${area}`).ref(name).getDownloadURL();
            response(url);
          });

          task.catch(() => {
            reject(false);
          });
        });
        return flag;
};

export const handleUpdateImageVoucher = async (label, area, imgFile) => {
  try {
    let name = `${area}-${label.toString().replace(/\s+/g, '')}-${moment(new Date()).format('DDMMYYYYhhmmss')}`;
    //you will use this when need add file at default bucket but in this case i need use other bucket
    //const reference = storage().ref(name);
          let flag = await new Promise(async (response, reject) =>{
            const reference = firebase.app().storage(`${process.env.REACT_APP_BUCKET_VOUCHER}/${area}`).ref(name);
            const task = reference.putFile(`file://${imgFile.path}`);
            task.on('state_changed', taskSnapshot => {
              console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
            });
  
            task.then(async() => { 
              const url = await firebase.app().storage(`${process.env.REACT_APP_BUCKET_VOUCHER}/${area}`).ref(name).getDownloadURL();
              response(url);
            }); 
  
            task.catch(() => {
              reject(false);
            });
          });
          return flag;
  } catch (error) {
    console.log(error)
    return false
  }
};

export const handleSignInFirebase = async (user, password) => {
  console.log(1,"....")
  return await auth()
    .signInWithEmailAndPassword(user, password)
    .then(async (user) => {
      try {
        let flagSession = {error: true, message:'Error al iniciar sesión'};
        console.log(1, user.user.uid);
        const userExist = await getUserByUid(user.user.uid);
        console.log(2, userExist);
        userExist && (flagSession = {error: userExist.error, message: userExist.message});
        return flagSession;
      } catch (e) {
        console.log("AQUI MURIO 1")
        return false;
      }
    })
    .catch(async function (error) {
      console.log("AQUI MURIO 2", error)
      let messageError = await handleTraslateMessageFirebaseError(error.code);
      return {error: true, message: messageError};
    });
};

export const handleSignOutFirebase = async () => {
  auth().currentUser && (
  auth()
    .signOut()
    .then(() => console.log('User signed out!'))
  );
  await AsyncStorage.removeItem('@session');
};
