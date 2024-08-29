import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, TouchableOpacity, Dimensions,StyleSheet } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colorsTheme } from '../../../configurations/configStyle';
import { Context as AuthContext } from '../../../context/AuthContext';
import { getStep, updateStep } from '../../../functions/fncSqlite';
import { getAllCommunities, getModulesByRole } from '../../../services/settings.services';
import { getListEquipment, getListAddon } from '../../../services/inventory.services';
import { getTasks, getElemetScreen, getStepInstruction } from '../../../services/task.services';
import { getTicketById } from '../../../services/ticket.services';
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
    { title: "Tareas", icon: "profile", counter: 0 },
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const [buttonDownload, setButtonDownload] = useState(true);

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


        let getTaskData = await getTasks();
        await updateStep('taskList', 0, JSON.stringify(getTaskData), 0);
        let customersId = [];
        let counterCustomer = parseFloat(1 / getTaskData.length).toFixed(2);
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
            item.title === 'Tareas' ? { ...item, counter: Number(valueCustomer.toFixed(2)).toFixed(2) } : item
          ));
          valueCustomer = valueCustomer + counterCustomer;
        }
        setListItem(prevState => prevState.map(item =>
          item.title === 'Tareas' ? { ...item, counter: 1 } : item
        ));
        console.log("[ CUSTOMER IDS ] >> ", customersId);

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


  const RenderMenuItem = ({ item }) => (
    <View style={{ flex: 3, marginTop: 25, borderWidth: 2, borderColor: colorsTheme.verdeHybrico, padding: 10, margin: 5, borderRadius: 10 }}>
      <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
        <AntDesignIcon size={30} color="black" name={item.icon} />
      </View>
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text style={{ color: "black", fontSize: 14, marginBottom: 5 }}>{item.title}</Text>
        <Progress.Bar progress={item.counter} color={colorsTheme.verdeHybrico} width={100} height={8} />
        <View style={{ alignContent: "center" }}>
          <Text style={{ color: "black", fontSize: 14 }}>{item.counter * 100}%</Text>
        </View>
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
                backgroundColor: buttonDownload ? colorsTheme.verdeHybrico : colorsTheme.blanco,
                borderColor: buttonDownload ? colorsTheme.blanco : colorsTheme.verdeHybrico,
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                width: width * 0.6
              }} >
              <Text style={{
                color: buttonDownload ? colorsTheme.blanco : colorsTheme.verdeHybrico,
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

  return (
    <View>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Cargar Datos'}
      />
      {isVisible && <AlertShow isVisible={isVisible} setIsVisible={setIsVisible} data={dataVisible} />}
      <RenderOnlineData />
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
