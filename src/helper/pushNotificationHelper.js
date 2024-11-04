import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleShowNotification} from '../functions/fncGeneral';
import {setTokenUser} from '../services/settings.services';
export const requestUserPermission = async() => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    GetFCMToken();
  }
};

export const GetFCMToken = async() => {
let fcmtoken = AsyncStorage.getItem('fcmtoken');
    console.log('Token Old', fcmtoken, !fcmtoken);
    if (!fcmtoken === false){
        try {
            const newfcmtoken = await messaging().getToken();
            if (newfcmtoken){
                console.log('new Token 1', newfcmtoken);
                const user = await AsyncStorage.getItem('@user');
                await AsyncStorage.setItem('fcmtoken', newfcmtoken);
                await setTokenUser(JSON.parse(user), newfcmtoken);
            }
        } catch (error) {
            console.log(error, 'Error in FCMToken');
        }
    }
};

export const notificationListener = (changeCodeTask) =>{
  messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
            'Notification caused app to open from background state:',
            remoteMessage.notification,
        );
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });

      messaging().onMessage(async remoteMessage => {
        console.log('notification on froground state');
        console.log('---------------', remoteMessage);
        const {title, body} = remoteMessage.notification;
        const {type} = remoteMessage.data;
        switch (type) {
          case 'order':
            handleShowNotification({title,body});
            break;
          case 'task':
            const {code} = remoteMessage.data;
            changeCodeTask(code);
            handleShowNotification({title,body});
            break;
          case 'inventory':
            handleShowNotification({title,body});
            break;
        }
      });
};