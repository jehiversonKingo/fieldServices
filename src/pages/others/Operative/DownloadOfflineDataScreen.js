import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
} from 'react-native';
import * as Progress from 'react-native-progress';

import Header from '../../../components/Layouts/Header';
import {colorsTheme} from '../../../configurations/configStyle';

const DownloadOfflineDataScreen = ({navigation}) => {
  const [progress, setProgress] = useState();
  const getData = async () => {
    try {
      const communities = [];
      const inventoryEquipment = [];
      const inventoryAddons = [];
      const tasks = [];
    } catch (error) {
      console.log("[ GET OFFLINE DATA ERROR ] > ", error);
    }
  }
  useEffect(() =>  {
    getData();
  }, []);

  return (
    <>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Descargar Información'}
      />
      <View>
      </View>
    </>
  );
}

export default DownloadOfflineDataScreen;