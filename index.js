/**
 * @format
 */

import 'react-native-reanimated';
import {AppRegistry, LogBox, ToastAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { insertLocationToDatabaseSecond } from './src/functions/fncTracker'; 


LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead',
  'Non-serializable values were found in the navigation state.',
]);

BackgroundGeolocation.registerHeadlessTask(async (event) => {
  const { name, params } = event;

  if (name === 'location') {
      const { latitude, longitude, speed, timestamp } = params.coords;
      console.log('Ubicación recibida en segundo plano:', latitude, longitude, speed, timestamp);

      try {
          const newLocation = { GPS: location, Date: timestamp, velocity: speed };

          await insertLocationToDatabaseSecond(newLocation);
          console.log("Ubicación guardada correctamente.");
          ToastAndroid.showWithGravity(
            `Second place ubicaciones en la base de datos.`,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
        );
      } catch (error) {
          console.error("Error al guardar la ubicación:", error);
      }
  }
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
