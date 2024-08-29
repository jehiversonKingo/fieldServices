import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {Dimensions} from 'react-native';
import {Camera, useCodeScanner, useCameraDevice} from 'react-native-vision-camera';
import {RNHoleView} from 'react-native-hole-view';
import {widthToDp, heightToDp} from 'rn-responsive-screen';
import {handleChange} from '../../../functions/functionChangeValue';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import Ionicons from "react-native-vector-icons/Ionicons"

//Components
import Header from '../../../components/Layouts/Header';
import Footer from '../../../components/Layouts/Footer';

import {colorsTheme} from '../../../configurations/configStyle';

const ScanBarcodeApp = ({navigation, route}) => {
  const {index, data, setData} = route.params;
  const {height} = Dimensions.get('screen');
  const [barcode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [torch, setTorch] = useState("off");
  const device = useCameraDevice('back')
  const codeScanner = useCodeScanner({
    codeTypes: [
      'codabar',
      'code-128',
      'code-39',
      'code-93',
      'ean-13',
      'ean-8',
      'upc-e',
      'qr'
    ],
    onCodeScanned: (codes) => toggleActiveState(codes)
  })

  const toggleActiveState = async (barcodes) => {
    if (barcodes && barcodes.length > 0 && isScanned === false) {
      barcodes.forEach(async(scannedBarcode, ind) => {
        if (scannedBarcode.value !== '' && ind === 0) {
          if (data.some(item => item.value === scannedBarcode.value)) {
            showMessage({
              message: 'Este equipo ya fue escaneado',
              type: 'warning',
            });
          } else {
            setIsScanned(true);
            handleChange(index, scannedBarcode.value, 'value', data, setData);
            barcodes.length = 0;
            navigation.goBack();
          }
        }
      });
    }
  };

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    console.log("PERMISO ?????", status);
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    checkCameraPermission();
  }, []);

  return (
    <SafeAreaView>
      <Header isLeft={true} navigation={navigation} />
      <View>
        {false ? (
          <Text style={{color: colorsTheme.gris80}}>{barcode}</Text>
        ) : (
          device != null &&
          hasPermission && (
            <>
              <StatusBar barStyle="light-content" backgroundColor={colorsTheme.negro}/>
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!isScanned}
                codeScanner={codeScanner}
                torch={torch}
                audio={false}
              />
              <RNHoleView
                holes={[
                  {
                    x: widthToDp('8.5%'),
                    y: heightToDp('60%'),
                    width: widthToDp('83%'),
                    height: heightToDp('50%'),
                    borderRadius: 10,
                  },
                ]}
                style={styles.rnholeView}
              />
              <FlashMessage />
              <View style={{position: 'absolute'}}>
                <TouchableOpacity
                  onPress={() => setTorch((prevTorch) => prevTorch === "off" ? "on" : "off")}
                  style={{margin: "3%", width: 50, alignItems: 'center'}}
                  hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}
                >
                  <Ionicons name={torch === "off" ? 'flash' : 'flash-off'} color={colorsTheme.blanco} size={25} />
                </TouchableOpacity>
              </View>
            </>
          )
        )}
        <Footer styleCustomer={{marginTop: height}} />
      </View>
    </SafeAreaView>
  );
};

ScanBarcodeApp.navigationOptions = {
  header: () => false,
};

const styles = StyleSheet.create({
  userData: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: colorsTheme.verdeHybrico,
    borderTopColor: colorsTheme.gris80,
    borderTopWidth: 1,
    borderBottomColor: colorsTheme.gris80,
    borderBottomWidth: 1,
  },
  textInformation: {color: colorsTheme.blanco},
  bottomMenu: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: colorsTheme.blanco,
    marginTop: 5,
    height: 60,
    justifyContent: 'center',
    paddingTop: 12,
    text: {
      fontSize: 15,
      marginTop: 5,
      color: colorsTheme.gris60,
    },
    icon: {
      paddingRight: 15,
      color: colorsTheme.verdeHybrico,
    },
  },
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default ScanBarcodeApp;
