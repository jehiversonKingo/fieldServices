import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import {Dimensions} from 'react-native';
import {ProgressSteps, ProgressStep} from 'react-native-progress-steps';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
import {updateStep} from '../../../functions/fncSqlite';
import { handleValidDataStep, handleIsValidUrl, handleGetDataUserLocal } from '../../../functions/fncGeneral';

//Components
import InputGenerateStep from '../../../components/General/InputGenerateStep';
import ButtonProgressStep from '../../../components/General/ButtonProgressStep';
import Header from '../../../components/Layouts/Header';

//Servicios
import {getUserByRole} from '../../../services/auth.services';
import {getOrder} from '../../../services/orders.services';
import {colorsTheme} from '../../../configurations/configStyle';
import {completeOrder} from '../../../services/orders.services';

const {width, height} = Dimensions.get('screen');

const OrdersDescriptionUpdateScreen = ({navigation, route}) => {
  const {id} = route.params;
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isAlert, setIsAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [messageAlert, setMessageAlert] = useState('');
  const [titleAlert, setTitleAlert] = useState('');
  const [step1, setStep1] = useState([]);
  const [step2, setStep2] = useState([]);
  const [step3, setStep3] = useState([]);

  //1
  const InputsGenerate = ({item, index}) => {
    return (
      <View style={styles.containerForm}>
        <InputGenerateStep
          elementId={'id'}
          item={item}
          index={index}
          navigation={navigation}
          disable={true}
          objWithData={step1}
          selectData={step1}
          setFunction={setStep1}
          setMessageAlert={setMessageAlert}
          setTitleAlert={setTitleAlert}
        />
      </View>
    );
  };

  //2
  const InputsGenerateNewItem = ({item, index}) => {
    return (
      <View
        style={{
          padding: 12,
          backgroundColor: colorsTheme.naranja60,
          borderBottomColor: colorsTheme.negro,
          borderBottomWidth: 0.8,
        }}
        key={`A${index}`}>
        <View key={`B${index}`} style={{flexDirection: 'row'}}>
          <View key={`C${index}`}>
            <Text key={`D${index}`} style={{fontSize: 18, fontWeight: '500'}}>
              {index + 1}. {item}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  //3
  const InputsGenerateNewItemPaper = ({item, index}) => {
    return (
      <View key={index}>
        <View style={{alignContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={{width: width * 0.3, margin: 2}}
            onPress={() => handleClickImage(index)}>
            <FitImage
              indicator={true}
              indicatorColor={colorsTheme.naranja}
              indicatorSize="large"
              source={{
                uri:
                    item.value !== '' ?
                        handleIsValidUrl(item) ?
                            item :
                            'file://' + item.photo.path
                        : 'https://via.placeholder.com/300',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const saveTemporalData = async (dbTable ,step, active) => {
    try {
      isValid = await handleValidDataStep(step);
      if (isValid) { await updateStep(dbTable, 0, step, active); }

      if (isValid === false){
        setShowAlert(true);
        setTitleAlert('¡Atención!');
        setMessageAlert('Debes ingresar todos los datos');
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
        return;
      }

      if (active === 2){
        handleCompleteOrder();
        return;
      }
      setActive(prev => prev + 1);
    } catch (error) {
      console.log('[ ERROR SAVE TEMPORAL DATA ] => ', error);
    }
  };

  const handleClickImage = index => {
    let photos = [];
    step3.map(photo => photos.push({
      url:
        photo !== '' || photo.path !== '' ?
          handleIsValidUrl(photo) ?
            photo :
              `file://${photo.photo.path}`
          : 'https://via.placeholder.com/300',
    }));
    navigation.navigate('ImageFullScreen', {photos, index});
  };

  const handleCompleteOrder = async () => {
    setIsAlert(true);
    setTitleAlert('Comprobando Componentes');
    let orderData = await completeOrder({step1, step2, idOrder:id});
    setIsAlert(false);
    if (orderData.status) {
      navigation.navigate('Orders', { orderStatus:orderData });
    } else {
      setShowAlert(true);
      setTitleAlert(orderData.title);
      setMessageAlert(orderData.message);
      setIsAlert(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  const getData = async () => {
    let orderData = await getOrder(id);
    if (orderData.status) {
      console.log(orderData.data)
      const {
        idUser,
        orderDetailAddonData,
        orderDetailKingoData,
        orderStationeryData,
      } = orderData.data;

      makeStructureScreen({
        data:{
          idUser,
          orderDetailAddonData,
          orderDetailKingoData,
          orderStationeryData,
        }});
    }
  };

  const makeStructureScreen = async({data}) => {
    const { user } = await handleGetDataUserLocal();
    console.log("[ USER ] ---> ", user);
    let userAgentes = await getUserByRole(3, user.idUser);
    const {idUser,
      orderDetailAddonData,
      // orderDetailKingoData,
      orderStationeryData} = data;

    setStep1([{
      id: 1,
      label: 'Agente',
      type: 'selects',
      value: idUser,
      isFocus: false,
      values: [{label: `${user.name} ${user.lastName}`, value: user.idUser}],
    }]);

    let dataAddons = [];
    orderDetailAddonData.forEach(addon => {
      dataAddons.push(addon.value);
    });

    setStep2(dataAddons);

    let dataPhoto = [];

    orderStationeryData.forEach(stationery => {
      dataPhoto.push(stationery.file);
    });
    setStep3(dataPhoto);
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header isLeft={true} navigation={navigation} title={'Validar Orden'} />
      <View style={{flex: 1, marginHorizontal: 20}}>
      <ProgressSteps
        completedProgressBarColor={colorsTheme.naranja}
        activeStepIconBorderColor={colorsTheme.naranja}
        activeStepIconColor={colorsTheme.naranja}
        activeLabelColor={colorsTheme.naranja}
        completedStepIconColor={colorsTheme.naranja}
        labelFontSize={13}
        activeLabelFontSize={15}
        activeStepNumColor={colorsTheme.blanco}
        activeStep={active}
        >
          <ProgressStep
            label="Datos del Agente"
            scrollable={false}
            removeBtnRow={true}>
              {
                isLoading ?
                  (
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.5 }}>
                      <ActivityIndicator size="large" color={colorsTheme.naranja} />
                    </View>
                  ) : (
                    <FlatList
                      key={1}
                      data={step1}
                      renderItem={InputsGenerate}
                      keyExtractor={item => item.id}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{paddingBottom: '20%'}}
                      ListFooterComponent={
                        <ButtonProgressStep
                          text="Siguiente"
                          type={'right'}
                          onPress={() => saveTemporalData('orden', step1, active)}
                        />
                      }
                    />
                  )}
          </ProgressStep>
          <ProgressStep
            label="Equipo Y Componentes"
            scrollable={false}
            removeBtnRow={true}>
            <FlatList
              key={'FlatList-2'}
              data={step2}
              renderItem={InputsGenerateNewItem}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', marginTop: 40}}
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
              ListFooterComponent={
                <View>
                  <View
                    style={{
                      backgroundColor: colorsTheme.naranja,
                      width: width * 0.2,
                      position: 'absolute',
                      right: 0,
                      marginTop: 5,
                    }}>
                    <Text
                      style={{
                        padding: 10,
                        color: colorsTheme.blanco,
                        fontSize: 13,
                        fontWeight: '600',
                      }}>
                      Total {step2.length}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 60}}>
                    <ButtonProgressStep
                      text="Anterior"
                      type={'left'}
                      onPress={() => setActive(prev => prev - 1)}
                    />
                    <ButtonProgressStep
                      text="Siguiente"
                      type={'right'}
                      onPress={() => saveTemporalData('orden', step2, active)}
                    />
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View
                  style={{
                    backgroundColor: colorsTheme.gris80,
                    width: width,
                    padding: 10,
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>
                    No se han escaneado equipos.
                  </Text>
                </View>
              }
            />
          </ProgressStep>
          <ProgressStep
            label="Listado de papeleria"
            scrollable={false}
            removeBtnRow={true}>
            <FlatList
              data={step3}
              renderItem={InputsGenerateNewItemPaper}
              key={3}
              numColumns={3}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', marginTop: 60}}
              ListFooterComponent={
                <View style={{flexDirection: 'row', marginTop: 15}}>
                  <ButtonProgressStep
                    text="Anterior"
                    type={'left'}
                    onPress={() => setActive(prev => prev - 1)}
                  />
                  <ButtonProgressStep
                    text="Completar"
                    type={'complete'}
                    onPress={() => saveTemporalData('orden', step3, active)}
                  />
                </View>
              }
            />
          </ProgressStep>
      </ProgressSteps>
      </View>
      <AwesomeAlert
        show={isAlert}
        showProgress={true}
        title={titleAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
      />
      <AwesomeAlert
        show={showAlert}
        title={titleAlert}
        message={messageAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerForm: {
    marginTop: 10,
    padding: 5,
  },
  textList: {
    fontWeight: '600',
    fontSize: 15,
  },
});

export default OrdersDescriptionUpdateScreen;
