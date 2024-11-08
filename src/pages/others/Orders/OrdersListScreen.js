import React, {useState, useEffect} from 'react';
import {Dimensions, ActivityIndicator} from 'react-native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import moment from 'moment/moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import orderBy from 'lodash/orderBy';
import AwesomeAlert from 'react-native-awesome-alerts';
import { SpeedDial } from '@rneui/themed';

//Components
import Header from '../../../components/Layouts/Header';

//Functions
import {getOrders, deleteOrder} from '../../../services/orders.services';
import { handleFilterData, handleGetDataUserLocal } from '../../../functions/fncGeneral';

const {width, height} = Dimensions.get('screen');

import {colorsTheme} from '../../../configurations/configStyle';


const OrdersListScreen = ({navigation, route}) => {
  const { orderStatus } = route.params;
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  //Alert
  const [showAlert, isShowAlert] = useState();
  const [titleAlert, setTitleAlert] = useState();
  const [messageAlert, setMessageAlert] = useState();
  const [data, setData] = useState([]);

  const goTo = (route, data) => {
    navigation.navigate(route, data);
  };

  const validInactive = async (idOrder) => {
    try {
       await deleteOrder(idOrder);
       isShowAlert(true);
       setTitleAlert('Inactivado');
       setMessageAlert('Proceso Completado');
       handleDataList();
    } catch (error) {
      handleDataList();
      isShowAlert(true);
       setTitleAlert('Problema');
       setMessageAlert('Ocurrio un problema en el proceso');
      console.log("[ERROR INACTIVATE] >>", error);
    }
  };

  const RenderItemList = ({item}) => {
    let goToDirection = '';
    if (item.idWarehouseSender !== userId) {
      goToDirection = 'ToDoOrdersDescription';
    } else {
      goToDirection = 'UpdateOrdersDescription';
    }

    return (
    <TouchableOpacity
      style={{...styles.orderContainer.background, flexDirection: 'row'}}
      onPress={() => goTo(goToDirection, {id: item.idOrder})}>
      <View
        style={{
          flex: 0.2,
          backgroundColor: item.idOrderType !== 2 ? colorsTheme.naranja : colorsTheme.verdeFuerte,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
        }}>
        <FontAwesome5
          name={'archive'}
          color={colorsTheme.blanco}
          size={35}
          style={styles.bottomMenu.icon}
        />
      </View>
      <View style={{flex: 0.7, padding: 5}}>
        <Text style={{...styles.orderContainer.text, fontWeight: 'bold'}}>
          {'OIK-' + item.idOrder}
        </Text>
        <Text style={styles.orderContainer.text}>{item.warehouseSender}</Text>
        <Text style={styles.orderContainer.text}>
          {item.WarehouseSender.name}
        </Text>
        <Text
          style={{
            ...styles.orderContainer.text,
            position: 'absolute',
            bottom: 5,
            right: -30,
          }}>
          {moment(item?.createdAt).format('DD/MM/YYYY')}
        </Text>
      </View>
      <TouchableOpacity
          style={{
            position: 'absolute',
            right: 4,
            top: 3,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
          }}
          onPress={() => {
            validInactive(item.idOrder);
          }}
         >
        <FontAwesome5
          name={'trash'}
          color={colorsTheme.rojo}
          size={23}
        />
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

  const handleDataList = async (attribute) => {
    try {
      const {idWarehouse} = await handleGetDataUserLocal();
      setUserId(idWarehouse);
      setLoading(true);
      const {orders} = await getOrders();
      if (orders) {
        handleFilterData(orders, idWarehouse, setData, setLoading,'', attribute);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleDataList('idWarehouseSender');
  }, []);

  useEffect(() => {
    if (orderStatus.status){
      isShowAlert(true);
      setTitleAlert(orderStatus.title);
      setMessageAlert(orderStatus.message);
      handleDataList('idWarehouseSender');
      setTimeout(() => {
        isShowAlert(false);
      }, 4000);
    }
  }, [orderStatus]);

  return (
    <>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Listado De Ordenes'}
      />
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 0 ? colorsTheme.amarillo:colorsTheme.naranja
          }}
          onPress={() => {
            setActive(0)
            handleDataList('idWarehouseSender')
          }}>
          <Text style={{color: colorsTheme.blanco}}>Enviados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 1 ? colorsTheme.amarillo:colorsTheme.naranja
          }}
          onPress={() => {
            setActive(1)
            handleDataList('idWarehouseReceived')
          }}>
          <Text style={{color: colorsTheme.blanco}}>Recibidos</Text>
        </TouchableOpacity>
      </View>
      {loading ?
        (
          <View style={{justifyContent: 'center', alignItems: 'center', height:height * 0.5}}>
            <ActivityIndicator size="large" color={colorsTheme.naranja}/>
          </View>
        ) : (
          <FlatList
            data={orderBy(data, ['idOrderType'], ['asc'])}
            renderItem={RenderItemList}
            keyExtractor={item => item.idOrder}
            contentContainerStyle={{...styles.container}}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{
                backgroundColor:colorsTheme.naranja60,
                width: width * 0.90,
                height: height * 0.05,
                justifyContent:'center',
                alignItems: 'center',
                borderRadius:100,
                }}>
                <Text style={{ fontSize: 16, fontWeight:'bold', color:colorsTheme.blanco}}>No se encontraron datos.</Text>
              </View>
              }
          />
        )}

      {/* <View
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          backgroundColor: colorsTheme.blanco,
          borderRadius: 50,
          borderColor: colorsTheme.gris80,
        }}>
        <TouchableOpacity
          onPress={() => goTo('AddOrdersDescription', {})}
          style={{}}>
          <FontAwesome5
            name={'plus-circle'}
            color={colorsTheme.naranja}
            size={48}
            fa5Style={{borderColor: colorsTheme.blanco}}
          />
        </TouchableOpacity>
      </View> */}

    <SpeedDial
        isOpen={open}
        color={colorsTheme.naranja}
        icon={{ name: 'shuffle', color: '#fff' }}
        openIcon={{ name: 'remove-circle-outline', color: '#fff' }}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(!open)}
      >
        <SpeedDial.Action
          icon={{ name: 'queue', color: '#fff' }}
          color={colorsTheme.naranja}
          title="Nueva Orden"
          onPress={() => goTo('AddOrdersDescription', {})}
        />
      </SpeedDial>

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={titleAlert}
        message={messageAlert}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          isShowAlert(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  bottomMenu: {
    borderRadius: 5,
    marginRight: 10,
    padding: 30,
    paddingTop: -10,
    text: {
      fontSize: 15,
      color: colorsTheme.blanco,
    },
  },
  inputForm: {
    fontSize: 17,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderRadius: 10,
  },
  orderContainer: {
    background: {
      flexDirection: 'row',
      width: width * 0.95,
      margin: 4,
      backgroundColor: colorsTheme.blanco,
      borderRadius: 5,
      padding: 5,
      shadowColor: colorsTheme.gris60,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.34,
      shadowRadius: 6.27,
      elevation: 6,
    },
    text: {
      color: colorsTheme.gris80,
      fontSize: 15,
    },
  },
  buttonTab: {
    backgroundColor: colorsTheme.naranja,
    flex: 1,
    height: height * 0.06,
    paddingTop: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonTabActive: {
    borderWidth: 1,
    borderColor: colorsTheme.blanco,
  },
});

export default OrdersListScreen;
