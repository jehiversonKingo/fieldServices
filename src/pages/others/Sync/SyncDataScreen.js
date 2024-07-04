import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, TouchableOpacity, Dimensions,StyleSheet } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListItem } from '@rneui/themed';
import moment from 'moment';

import { colorsTheme } from '../../../configurations/configStyle';
import { Context as AuthContext } from '../../../context/AuthContext';
import { getStep, updateStep } from '../../../functions/fncSqlite';
import { getAllCommunities, getAllPlans, getAllRules, getModulesByRole } from '../../../services/settings.services';
import { getListEquipment, getListAddon } from '../../../services/inventory.services';
import {
  getWallerByUser,
  getDebetAgent,
  getTransactionAgent,
  getAllPromotions,
  getWallerByCustomer,
  getTransactionCarriedOut,
  getDebtCustomer,
  getBalanceCustomer,
  getSaleCustomer,
  getCreditsCustomer,
  getDataCustomerById
} from '../../../services/sales.services';
import { getTasks, getElemetScreen, getStepInstruction } from '../../../services/task.services';
import { getTicketById } from '../../../services/ticket.services';
import { uploatDataOffline, deleteStorageCollection } from '../../../services/offline.services';
import {findIndexArray, findInArray} from '../../../functions/fncGeneral';
import Header from '../../../components/Layouts/Header';
import AlertShow from '../../../components/General/AlertShow';

const { width, height, fontScale } = Dimensions.get('window');

const SyncDataScreen = ({ navigation }) => {
  const { state } = React.useContext(AuthContext);
  const { inline } = state;
  const [listItem, setListItem] = useState([
    { title: "Menu", icon: "layout", counter: 0 },
    { title: "Inventario", icon: "database", counter: 0 },
    { title: "Comunidades", icon: "pushpino", counter: 0 },
    { title: "Billetera", icon: "wallet", counter: 0 },
    { title: "Tareas", icon: "profile", counter: 0 },
    { title: "Reglas", icon: "filetext1", counter: 0 },
    { title: "Planes", icon: "filetext1", counter: 0 },
    { title: "Promociones", icon: "filetext1", counter: 0 },
    { title: "Tenderos", icon: "filetext1", counter: 0 },
    { title: "Billeteras Tenderos", icon: "wallet", counter: 0 },
    { title: "Transacciones Tenderos", icon: "carryout", counter: 0 },
    { title: "Deudas Tenderos", icon: "creditcard", counter: 0 },
    { title: "Balance Tenderos", icon: "calculator", counter: 0 },
    { title: "Ventas Tenderos", icon: "filetext1", counter: 0 },
    { title: "Compras Tenderos", icon: "filetext1", counter: 0 },
  ]);
  const [listItemServer, setListItemServer] = useState([{ title: "Sevidor", icon: "layout", counter: 0 }]);

  const [isVisible, setIsVisible] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const [buttonDownload, setButtonDownload] = useState(true);
  const [expanded, setExpanded] = useState([]);
  const [flagExistData, setFlagExistData] = useState(false);
  const [dataExistData, setDataExistData] = useState([]);

  useEffect(() => {
    handleValidExistData();
  }, []);

  const handleUploadData = async () => {
    try {
      setButtonDownload(false);
      console.log(1);

      // Obtener datos de clientes fuera de línea
      let getCustomersData = JSON.parse(await getStep('customersOfflineData', 0, 0));
      console.log(1.5, getCustomersData);
      let valuePercentage = 100 / getCustomersData.customers.length;
      let responsesLots = [];
      console.log(2, valuePercentage);

      // Cargar datos de clientes fuera de línea
      for (let customersLot of getCustomersData.customers) {
        console.log(3);

        // Actualizar contador en la lista de items del servidor
        setListItemServer(prevState => prevState.map(item =>
          item.title === 'Sevidor' ? { ...item, counter: item.counter + 1 } : item
        ));

        // Subir datos fuera de línea y almacenar la respuesta
        const sendToOffline = await uploatDataOffline(customersLot);
        console.log("-Esta respuesta tengo-", sendToOffline);
        responsesLots.push({ ...sendToOffline, uid: customersLot.uid });
      }

      console.log(4);

      // Filtrar errores de subida
      let errorsUpload = responsesLots.filter(lots => lots.status === false);
      console.log("errorsUpload", errorsUpload, errorsUpload.length);
      console.log(5, responsesLots);

      // Obtener datos de lotes cargados previamente
      let dataLot = JSON(await getStep('uploadLots', 0, 0));
      console.log("I GET THIS", typeof dataLot, JSON.parse(dataLot));
      let uploadLots = typeof dataLot === 'string'?[]:JSON.parse(dataLot);

      // Procesar respuestas y actualizar datos fuera de línea
      for (let lotSave of responsesLots) {
        console.log("[LOTES]", typeof uploadLots);

        // Verificar si el lote ya existe
        let isExistUid = await findInArray(uploadLots, 'uid', lotSave.uid);
        console.log("...2...", isExistUid);
        if (!isExistUid) {
          uploadLots.push(lotSave);
        }

        // Eliminar lote de datos locales
        let indexLot = await findIndexArray(getCustomersData.customers, "uid", lotSave.uid);
        console.log("INDEX", indexLot);
        console.log("Element to remove:", getCustomersData.customers[indexLot]);
        getCustomersData.customers.splice(indexLot, 1);
        console.log("NEW DATA OFFLINE", getCustomersData.customers);
      }

      // Actualizar almacenamiento local
      await updateStep('uploadLots', 0, JSON.stringify(uploadLots), 0);
      await updateStep('customersOfflineData', 0, JSON.stringify(getCustomersData), 0);

      // Manejar errores de subida
      if (errorsUpload.length > 0) {
        for (let errors of errorsUpload) {
          await deleteStorageCollection("Lots", errors.uid);
        }

        setDataVisible({
          type: "error",
          title: "Error al sincronizar datos",
          subTitle: "Vuelve a intentar subir los datos",
          secondButton: true,
          secondAction: () => {
            setIsVisible(false);
          },
          blocked: true
        });
      } else {
        setDataVisible({
          type: "success",
          title: "Datos cargados",
          subTitle: "Todo cargado con éxito",
          secondButton: true,
          secondAction: () => {
            setIsVisible(false);
            navigation.navigate("Principal", { reloadData: true });
          },
          blocked: true
        });
      }
      setIsVisible(true);
      setButtonDownload(true);
    } catch (error) {
      console.log("<><><><><><><>", error);
    }
  };

  const handleAsyncData = async () => {
    try {
      setButtonDownload(false);
      const data = JSON.parse(await AsyncStorage.getItem('@user'));
      let options = [];
      if (inline) {
        options = await getModulesByRole(data.user.idRole);
        await updateStep('menuOptions', data.user.idRole, JSON.stringify(options), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Menu' ? { ...item, counter: item.counter + 1 } : item
        ));
        getAddon = await getListAddon();
        await updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0);

        getKingo = await getListEquipment();
        await updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Inventario' ? { ...item, counter: item.counter + 1 } : item
        ));

        let getCommunities = await getAllCommunities();
        await updateStep('communities', 0, JSON.stringify(getCommunities), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Comunidades' ? { ...item, counter: item.counter + 1 } : item
        ));

        let getWallet = await getWallerByUser();
        let getDebt = await getDebetAgent();
        let getTransaction = await getTransactionAgent();
        console.log("////////--1--//////////", getWallet)
        await updateStep('walletUser', 0, JSON.stringify(getWallet), 0);
        await updateStep('debtUser', 0, JSON.stringify(getDebt), 0);
        await updateStep('transactionUser', 0, JSON.stringify(getTransaction), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Billetera' ? { ...item, counter: item.counter + 1 } : item
        ));

        let getTaskData = await getTasks();
        await updateStep('taskList', 0, JSON.stringify(getTaskData), 0);
        let customersId = [];
        let counterCustomer = (1 / getTaskData.length);
        let valueCustomer = 0;
        for (let task of getTaskData) {
          let dataTask = await getElemetScreen(task.idTask);
          const { steps } = dataTask;
          await updateStep('taskDescription', task.idTask, JSON.stringify(dataTask), 0);
          steps.forEach(async (step) => {
            let dataStepsToDo = await getStepInstruction(step.idStep)
            await updateStep('taskDescriptionToDo', step.idStep, JSON.stringify(dataStepsToDo), 0);
          });
          let dataTicket = await getTicketById(task.task.idTicket);

          !customersId.includes(dataTicket.idCustomer) && customersId.push(dataTicket.idCustomer);

          setListItem(prevState => prevState.map(item =>
            item.title === 'Tareas' ? { ...item, counter: Number(valueCustomer.toFixed(2)) } : item
          ));
          valueCustomer = valueCustomer + counterCustomer;
        }
        setListItem(prevState => prevState.map(item =>
          item.title === 'Tareas' ? { ...item, counter: item.counter + counterCustomer } : item
        ));
        console.log("[ CUSTOMER IDS ] >> ", customersId);
        //Customer Informacion
        let getRules = await getAllRules();
        await updateStep('customerRules', 0, JSON.stringify(getRules), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Reglas' ? { ...item, counter: item.counter + 1 } : item
        ));

        let getPlans = await getAllPlans();
        await updateStep('customerPlans', 0, JSON.stringify(getPlans), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Planes' ? { ...item, counter: item.counter + 1 } : item
        ));

        let getPromotions = await getAllPromotions();
        console.log("....................[ PROMOCIONES ]...................", getPromotions);
        await updateStep('customerPromotions', 0, JSON.stringify(getPromotions), 0);
        setListItem(prevState => prevState.map(item =>
          item.title === 'Promociones' ? { ...item, counter: item.counter + 1 } : item
        ));

        let customersData = [];
        let walletsData = [];
        let transactionData = [];
        let debetData = [];
        let balanceData = [];
        let salesData = [];
        let creditsData = [];
        let counterWalletCustomer = (1 / customersId.length);
        let valueWalletCustomer = 0;
        customersId.map(async (customer) => {
          console.log('ENTRE Y SOY EL TENDERO -> ', customer);
          let customerData = await getDataCustomerById(customer);
          let walletCustomer = await getWallerByCustomer(customer);
          let transactionCustomer = await getTransactionCarriedOut(customer);
          let debetCustomer = await getDebtCustomer(customer);
          let balanceCustomer = await getBalanceCustomer(customer);
          let salesCustomer = await getSaleCustomer(customer);
          let creditCustomer = await getCreditsCustomer(customer);

          customersData.push(customerData)
          walletsData.push(walletCustomer);
          transactionData.push(transactionCustomer);
          debetData.push(debetCustomer);
          balanceData.push(balanceCustomer);
          salesData.push(salesCustomer);
          creditsData.push(creditCustomer);

          setListItem(prevState => prevState.map(item =>
            item.title === 'Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Billeteras Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Transacciones Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Deudas Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Balance Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Ventas Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Compras Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          setListItem(prevState => prevState.map(item =>
            item.title === 'Tenderos' ? { ...item, counter: Number(valueWalletCustomer.toFixed(2)) } : item
          ));

          valueWalletCustomer = valueWalletCustomer + counterWalletCustomer;
          await updateStep('customers', customer, JSON.stringify(customerData), 0);
          await updateStep('customersWallets', customer, JSON.stringify(walletCustomer), 0);
          await updateStep('transactionWallets', customer, JSON.stringify(transactionCustomer), 0);
          await updateStep('debetWallets', customer, JSON.stringify(debetCustomer), 0);
          await updateStep('balanceWallets', customer, JSON.stringify(balanceCustomer), 0);
          await updateStep('saleWallets', customer, JSON.stringify(salesCustomer), 0);
          await updateStep('creditWallets', customer, JSON.stringify(creditCustomer), 0);
        });
        setListItem(prevState => prevState.map(item =>
          item.title === 'Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Billeteras Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Transacciones Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Deudas Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Balance Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Ventas Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        setListItem(prevState => prevState.map(item =>
          item.title === 'Compras Tenderos' ? { ...item, counter: item.counter + 1 } : item
        ));

        await updateStep('customersOfflineData', 0, JSON.stringify({
          "customers": []
        }), 0);
        await updateStep('confirmationLot', 0, JSON.stringify([]), 0);
        await updateStep('currentDate', 0, JSON.stringify({ currentDate: new Date() }), 0);
        await updateStep('uploadLots', 0, JSON.stringify([]), 0);

        setDataVisible({
          type: "success",
          title: "Datos locales",
          subTitle: "Datos cargados localmente con éxito",
          secondButton: true,
          secondAction: (() => {
            setIsVisible(false);
            navigation.navigate("Principal", { reloadData: true })
          }),
          blocked: true
        })
        setIsVisible(true);
      } else {
        options = JSON.parse(await getStep('menuOptions', data.user.idRole, 0));
        setDataVisible({
          type: "error",
          title: "Datos locales",
          subTitle: "Necesitas conexión a internet para reliazar esta acción",
          secondButton: true,
          secondAction: (() => {
            setIsVisible(false);
            navigation.navigate("Principal", { reloadData: true })
          }),
          blocked: true
        })
        setIsVisible(true);
      }
      setButtonDownload(true);
    } catch (error) {
      setDataVisible({
        type: "error",
        title: "Error",
        subTitle: "No se pudo cargar los datos locales",
        secondButton: true,
        secondAction: (() => {
          setIsVisible(false);
        }),
        blocked: true
      })
      setIsVisible(true);
      setButtonDownload(true);
      console.log("[ GET MENU OPTIONS ]", error);
    }
  };

  const handleValidExistData = async () => {
    let getWalletCustomers = JSON.parse(await getStep('customersOfflineData', 0, 0));
    console.log("<------------->", getWalletCustomers, getWalletCustomers.customers.length);
    if(getWalletCustomers.customers.length > 0){setFlagExistData(true); setDataExistData(getWalletCustomers.customers)};
  };

  const handleChangeOpenCollapse = (value, index) => {
    const tempExpanded = [...expanded];
    tempExpanded[index] = value;
    setExpanded(tempExpanded);
}

  const RenderMenuItem = ({ item }) => (
    <View style={{ flex: 3, marginTop: 25, borderWidth: 2, borderColor: colorsTheme.naranja, padding: 10, margin: 5, borderRadius: 10 }}>
      <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
        <AntDesignIcon size={30} color="black" name={item.icon} />
      </View>
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text style={{ color: "black", fontSize: 14, marginBottom: 5 }}>{item.title}</Text>
        <Progress.Bar progress={item.counter} color={colorsTheme.naranja} width={100} height={8} />
        <View style={{ alignContent: "center" }}>
          <Text style={{ color: "black", fontSize: 14 }}>{item.counter * 100}%</Text>
        </View>
      </View>
    </View>
  );

  const RenderExistData = ({ }) => (
    <View>
      <FlatList
        data={listItemServer}
        numColumns={1}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <RenderMenuItem item={item} />}
      />
      <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          onPress={buttonDownload && handleUploadData}
          style={{
            borderWidth: 1,
            backgroundColor: buttonDownload ? colorsTheme.naranja : colorsTheme.blanco,
            borderColor: buttonDownload ? colorsTheme.blanco : colorsTheme.naranja,
            borderRadius: 8,
            padding: 10,
            marginTop: 10,
            width: width * 0.6
          }}>
          <Text style={{
            color: buttonDownload ? colorsTheme.blanco : colorsTheme.naranja,
            textAlign: "center",
            fontSize: fontScale * 18
          }}>{buttonDownload ? "Subir Datos Al Servidor" : "...Subiendo Datos"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RenderOnlineData = ({ }) => (
    <>
      {inline ? (
        <View>
          <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
            <TouchableOpacity
              onPress={buttonDownload && handleAsyncData}
              style={{
                borderWidth: 1,
                backgroundColor: buttonDownload ? colorsTheme.naranja : colorsTheme.blanco,
                borderColor: buttonDownload ? colorsTheme.blanco : colorsTheme.naranja,
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                width: width * 0.6
              }} >
              <Text style={{
                color: buttonDownload ? colorsTheme.blanco : colorsTheme.naranja,
                textAlign: "center",
                fontSize: fontScale * 18
              }}>{buttonDownload ? "Sincronizar Datos" : "...Cargando Datos"}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={listItem}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <RenderMenuItem item={item} />}
            contentContainerStyle={{ paddingBottom: height * 0.5 }}
          />
        </View>
      ) : (
        <>
          <View style={{ alignContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colorsTheme.negro }}>No se pueden sincronizar datos offline.</Text>
          </View>
        </>
      )}
    </>
  );

  const RenderListDataOffline = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja, alignItems: "center", borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
        <Text style={[styles.itemText, { color: "white", fontSize: 18 }]}>Datos del lote {item.lote}</Text>
      </View>
      <View>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.itemText, { fontSize: 12 }]}>Estado del Lote: </Text>
            <Text style={[styles.itemText, { fontSize: 12 }]}>{item.rules.sent ? "Enviado" : "Sin Enviar"}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.itemText, { fontSize: 12 }]}>Recibido por Agente: </Text>
            <Text style={[styles.itemText, { fontSize: 12 }]}>{item.rules.receiptForAgent ? "Enviado" : "Sin Enviar"}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.itemText, { fontSize: 12 }]}>Agente: </Text>
            <Text style={[styles.itemText, { fontSize: 12 }]}>{item.rules.idUser || "Sin Enviar"}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.itemText, { fontSize: 12 }]}>Fecha de creación: </Text>
            <Text style={[styles.itemText, { fontSize: 12 }]}>{moment(item.rules.dateCreated).format("YYYY-MM-DD")}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.itemText, { fontSize: 12 }]}>Fecha de envio: </Text>
            <Text style={[styles.itemText, { fontSize: 12 }]}>{item.rules.dateSent ? moment(item.rules.dateSent).format("YYYY-MM-DD") : "Sin Enviar"}</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15, color: "white" }]}>Créditos</Text>
      </View>
      <FlatList
        data={item.credits}
        keyExtractor={(credit, index) => index.toString()}
        renderItem={({ item: credit }) => (
          <RenderItem item={credit}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Credito</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{credit.amount}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Credito con promocion: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{credit.amountWithPromotion}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Promocion: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{credit.promotion}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Estado de la venta: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{credit.stateCreditSale}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Estado: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{credit.state}</Text>
              </View>
            </View>
            <View style={{ flex: 1, padding: 5, justifyContent: "space-between", alignItems: "flex-end" }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{credit.typeSale}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{credit.reasonSale}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`credits`}
      />
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15, color: "white" }]}>Ventas</Text>
      </View>
      <FlatList
        data={item.sales}
        keyExtractor={(sale, index) => index.toString()}
        renderItem={({ item: sale }) => (
          <RenderItem item={sale}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Codigo:</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{sale.code}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Kingo/Cliente: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{sale.internalName}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Venta: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{sale.amount}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Tipo de venta: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{sale.typeSale}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Razon de venta: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{sale.reasonSale}</Text>
              </View>
            </View>
            <View style={{ flex: 1, padding: 5, justifyContent: "space-between", alignItems: "flex-end" }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{sale.typeSale}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{sale.reasonSale}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`sales`}
      />
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15, color: "white" }]}>Pagos</Text>
      </View>
      <FlatList
        data={item.payments}
        keyExtractor={(payments, index) => index.toString()}
        renderItem={({ item: payment }) => (
          <RenderItem item={payment}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Usuario:</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{payment.idUser}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Pago: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{payment.amount}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Código de pago: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{payment.proofOfPayment}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Fecha de pago: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{payment.createdAt}</Text>
              </View>
            </View>
            <View style={{ flex: 1, padding: 5, justifyContent: "space-between", alignItems: "flex-end" }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{payment.typeSale}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  paddingBottom: 4,
                  paddingTop: 1,
                }}
              >
                <Text style={{ color: colorsTheme.blanco }}>{payment.reasonSale}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`payments`}
      />
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15, color: "white" }]}>Tickets</Text>
      </View>

      {/* Creacion */}
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja20, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15 }]}>Tickets de Creacion</Text>
      </View>
      <FlatList
        data={item.tickets?.newClients}
        keyExtractor={(sale, index) => index.toString()}
        renderItem={({ item: ticket }) => (
          <RenderItem item={ticket}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Categoria</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.idTicketCategory}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Persona/Kingo: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket?.client?.name || ticket.ticket?.code}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Descripcion: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.description}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`ticketinstall`}
      />

      {/* Swap */}
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja20, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15 }]}>Tickets de Swap</Text>
      </View>

      <FlatList
        data={item.tickets?.swap}
        keyExtractor={(sale, index) => index.toString()}
        renderItem={({ item: ticket }) => (
          <RenderItem item={ticket}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Categoria</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.idTicketCategory}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Persona/Kingo: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket?.client?.name || ticket.ticket?.code}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Descripcion: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.description}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`ticketswap`}
      />

      {/* Pickup */}
      <View style={{ flex: 1, backgroundColor: colorsTheme.naranja20, alignItems: "center", padding: 3, marginBottom: 5 }}>
        <Text style={[styles.itemText, { fontSize: 15 }]}>Tickets de PickUp</Text>
      </View>

      <FlatList
        data={item.tickets?.pickup}
        keyExtractor={(sale, index) => index.toString()}
        renderItem={({ item: ticket }) => (
          <RenderItem item={ticket}>
            <View style={{ flex: 1, padding: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Categoria</Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.idTicketCategory}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Persona/Kingo: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket?.client?.name || ticket.ticket?.code}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colorsTheme.negro }}>Descripcion: </Text>
                <Text style={{ color: colorsTheme.negro, fontWeight: 'bold', marginLeft: 5 }}>{ticket.ticket.description}</Text>
              </View>
            </View>
          </RenderItem>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "gray" }}> No se encontraron datos</Text>
          </View>
        }
        listKey={`ticketpickup`}
      />
    </View>
  );

  const RenderItem = (props) => {
    return (
            <View
                style={{
                    backgroundColor: colorsTheme.blanco,
                    borderRadius: 10,
                    marginBottom: 18,
                    borderLeftWidth: 4,
                    borderColor: colorsTheme.naranja
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: 15,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderColor: colorsTheme.negro
                    }}
                >
                    <Text style={{ color: colorsTheme.negro, fontWeight: "bold" }}>Ingreso :</Text>
                    <Text style={{ color: colorsTheme.negro, fontWeight: "bold" }}> {moment(props.item.createdAt).format('DD/MM/YYYY')} </Text>
                </View>
                <View
                    style={{
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        flexDirection: 'row',
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row" }}>
                            {props.children}
                        </View>
                    </View>
                </View>
            </View>
    );
};

  const AccordionLots = ({ item, index }) => {
    return (
      <View style={{ flex: 1 }}>
        <ListItem.Accordion
          content={
            <View>
              <ListItem.Content>
                <ListItem.Title>{item.uid}</ListItem.Title>
              </ListItem.Content>
            </View>
          }
          isExpanded={expanded[index]}
          onPress={() => {
            handleChangeOpenCollapse(!expanded[index], index)
          }}
          style={{ backgroundColor: "lightgray" }}
        >
          <RenderListDataOffline item={item} style={{ marginBottom: 200}}/>
        </ListItem.Accordion>
      </View>
    );
  };

  return (
    <View>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Cargar Datos'}
      />
      {isVisible && <AlertShow isVisible={isVisible} setIsVisible={setIsVisible} data={dataVisible} />}
      {flagExistData ?
        <>
          <RenderExistData />
          <FlatList
            data={dataExistData}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <AccordionLots item={item} index={index} />
            )}
            ListEmptyComponent={
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: "gray" }}> No se encontraron datos pendiente por subir</Text>
              </View>
            }
          />
        </> : <RenderOnlineData />}
    </View>
  );
};

const styles = StyleSheet.create({
  syncButton: {
      borderWidth: 1,
      borderColor: colorsTheme.naranja,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 10,
      marginVertical: 10,
  },
  buttonText: {
      color: colorsTheme.naranja,
      fontSize:28, color:colorsTheme.gris, fontFamily:'Poppins-SemiBold',
  },
  itemContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      marginBottom: 300
  },
  itemText: {
    fontSize:28, color:colorsTheme.gris, fontFamily:'Poppins-SemiBold',
      fontWeight: 'bold',
      marginTop: 5,
      color: "black"
  },
  creditContainer: {
      marginLeft: 10,
      marginTop: 5,
      borderWidth: 1,
      borderRadius: 20
  },
  creditText: {
      marginLeft: 10,
      color: "black"
  },
  saleContainer: {
      marginLeft: 10,
      marginTop: 5,
  },
  saleText: {
      marginLeft: 10,
      color: "black"
  },
  deviceContainer: {
      borderColor: colorsTheme.blanco,
      borderWidth: 1,
      borderRadius: 5,
      marginVertical: 5,
      marginHorizontal: 10,
      paddingVertical: 5,
      paddingHorizontal: 15,
  },
  deviceTitle: {
      color: colorsTheme.negro
  },
  deviceSubtitle: {
      color: colorsTheme.negro
  },
});

export default SyncDataScreen;
