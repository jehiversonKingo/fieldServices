import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {Dimensions} from 'react-native';
import {Camera, useCodeScanner, useCameraDevice} from 'react-native-vision-camera';
import {RNHoleView} from 'react-native-hole-view';
import {widthToDp, heightToDp} from 'rn-responsive-screen';
import {handleChange} from '../../../functions/functionChangeValue';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Button} from '@rneui/base';
//Components
import Header from '../../../components/Layouts/Header';
import Footer from '../../../components/Layouts/Footer';

import {colorsTheme} from '../../../configurations/configStyle';
import Ionicons from "react-native-vector-icons/Ionicons"
const ScanExample = ({navigation, route}) => {
  const {data, setData} = route.params;
  const {height, width} = Dimensions.get('screen');
  const [barcode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned] = useState(false);
  const [codes, setCodes] = useState(data);
  const [torch, setTorch] = useState("off");
  // const [open, isOpen] = useState(false);
  // const snapPoints = useMemo(() => ['100%', '100%', '90%'], []);
  // const sheetRef = useRef(null);
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
    onCodeScanned: (codes) => {
      // setIsScanned(true)
      toggleActiveState(codes)
    }
  })

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'granted');
  };

  // const handleChangeValue = value => {
  //   if (value) {
  //     sheetRef.current?.snapToIndex(0);
  //   } else {
  //     sheetRef.current?.close();
  //   }
  // };

  useEffect(() => {
    checkCameraPermission();
  }, []);

  // useEffect(() => {
  //   handleChangeValue(open);
  // }, [open]);

  const toggleActiveState = async (barcodes) => {
    if (barcodes && barcodes.length > 0 && isScanned === false) {
      barcodes.forEach(async scannedBarcode => {
        if (scannedBarcode.value !== '') {
          if (!codes.includes(scannedBarcode.value)) {
            let codesLast = [...codes, scannedBarcode.value];
            setData(codesLast);
            setCodes(codesLast);
            showMessage({
              message: 'Equipo agregado',
              type: 'success',
            });
          } else {
            showMessage({
              message: 'Equipo ya fue agregado',
              type: 'warning',
            });
          }
        }
      });
      // setTimeout(() => setIsScanned(false), 1500)
    }
  };

  return (
    <SafeAreaView>
      <Header isLeft={true} navigation={navigation} />
      <View>
        {isScanned ? (
          <Text style={{color: colorsTheme.gris80}}>{barcode}</Text>
        ) : (
          device != null &&
          hasPermission && (
            <>
              <StatusBar barStyle="light-content" backgroundColor={colorsTheme.negro} />
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!isScanned}
                codeScanner={codeScanner}
                torch={torch}
                fps={15}
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
              <View sstyle={{position: 'absolute'}}>
                <TouchableOpacity
                  onPress={() => setTorch((prevTorch) => prevTorch === "off" ? "on" : "off")}
                  style={{margin: "3%", width: 50, alignItems: 'center'}}
                  hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}
                >
                  <Ionicons name={torch === "off" ? 'flash' : 'flash-off'} color={colorsTheme.blanco} size={25} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 260,
                  left: 0,
                  right: 0,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={{...styles.camExternalButton}}
                  onPress={() => navigation.goBack()}>
                  <View
                    style={{
                      ...styles.camInternalButton,
                      backgroundColor: colorsTheme.verdeFuerte,
                    }}>
                    <Text style={{color: colorsTheme.blanco, left: 20, fontSize: 12}}>
                      Completar Escaner
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.camExternalButton}
                  onPress={() => isOpen(true)}>
                  <View style={{...styles.camInternalButton}}>
                    <Text style={{color: colorsTheme.blanco, left: 40, fontSize: 12}}>
                      Ver listado
                    </Text>
                  </View>
                </TouchableOpacity> */}
              </View>
            </>
          )
        )}
        <Footer styleCustomer={{marginTop: height}} />
      </View>
      {/* <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={-1}
        //onChange={handleSheetChange}
      >
        <BottomSheetView>
          <View style={{width: 150, marginLeft: width * 0.7}}>
            <Button
              title="X"
              size="xs"
              buttonStyle={{backgroundColor: colorsTheme.naranja, borderRadius: 5}}
              containerStyle={{
                marginHorizontal: 50,
                marginVertical: 10,
              }}
              onPress={() => isOpen(!open)}
            />
          </View>
          <FlatList
            data={codes}
            renderItem={({item, index}) => (
              <View
                style={{
                  padding: 12,
                  backgroundColor: colorsTheme.naranja60,
                  borderBottomColor: colorsTheme.negro,
                  borderBottomWidth: 0.8,
                }}
                key={item + '-' + index}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{}}>
                    <Text style={{fontSize: 18, fontWeight: '500'}} key={index}>
                      {index + 1}. {item}
                    </Text>
                  </View>
                  <View
                    style={{position: 'absolute', right: -50, marginTop: -18}}>
                    <Button
                      title="X"
                      size="md"
                      buttonStyle={{
                        backgroundColor: colorsTheme.rojo,
                        borderRadius: 5,
                      }}
                      containerStyle={{
                        marginHorizontal: 50,
                        marginVertical: 10,
                      }}
                      onPress={() => {
                        let dataChange = handleRemove(
                          index,
                          codes,
                          setData,
                          true,
                        );
                        setCodes(dataChange);
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
            keyExtractor={item => item}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{margin: 10}}
            ListHeaderComponent={
              <View
                style={{
                  backgroundColor: colorsTheme.naranja,
                  width: width,
                  padding: 10,
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Text style={{color: colorsTheme.blanco}}>Listado de equipo</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={{alignContent: 'center', alignItems: 'center'}}>
                <Text style={{color: colorsTheme.negro}}>No se encontraron datos.</Text>
              </View>
            }
          />
        </BottomSheetView>
      </BottomSheet> */}
    </SafeAreaView>
  );
};

ScanExample.navigationOptions = {
  header: () => false,
};

const styles = StyleSheet.create({
  userData: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: colorsTheme.naranja,
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
      color: colorsTheme.gris80,
    },
    icon: {
      paddingRight: 15,
      color: colorsTheme.naranja,
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
  camExternalButton: {
    marginBottom: 5,
    backgroundColor: colorsTheme.blanco,
    width: 155,
    height: 65,
    alignContent: 'center',
    alignItems: 'center',
  },
  camInternalButton: {
    flexDirection: 'row',
    backgroundColor: colorsTheme.naranja,
    width: 150,
    height: 60,
    margin: 3,
    alignContent: 'center',
    alignItems: 'center',
  },
});

export default ScanExample;
