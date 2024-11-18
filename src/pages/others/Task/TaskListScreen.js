import React, { useCallback, useContext, useRef, useMemo, useState, useEffect } from 'react';
import { Dimensions, TextInput } from 'react-native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import orderBy from 'lodash/orderBy';
import BackgroundGeolocation from "react-native-background-geolocation";
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

//Components
import Header from '../../../components/Layouts/Header';
import RenderItemList from '../../../components/General/RenderItemList';
import TaskInfoScreen from './TaskInfoScreen';

//services
import { getTasks} from '../../../services/task.services';
import { getStep, updateStep } from '../../../functions/fncSqlite';
import { handleFilterData } from '../../../functions/fncGeneral';
import { colorsTheme } from '../../../configurations/configStyle';
import { Context as AuthContext } from '../../../context/AuthContext';
import ModalComponent from '../../../components/General/ModalComponent';

import { useTracking } from '../../../context/TrackingContext';
import { deleteLocationsFromDatabase } from '../../../functions/fncTracker';


const { width, height } = Dimensions.get('screen');
const TaskListScreen = ({ navigation, route }) => {
  const { locations, timer, changeButton, stopTracking, cancelTracking, inserte, setInitServices, setTask, setTaskStatus } = useTracking();
  const { taskStatus } = route.params;
  const [open, isOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [data, setData] = useState([]);
  const [dataTmp, setDataTmp] = useState([]);
  const [filterTxt, setFilterTxt] = useState("");
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(true);

  const [isAlert, setIsAlert] = useState(false);
  const [messageAlert, setMessageAlert] = useState('');
  const [titleAlert, setTitleAlert] = useState('');

  const [isAlert2, setIsAlert2] = useState(false);
  const [messageAlert2, setMessageAlert2] = useState('');
  const [titleAlert2, setTitleAlert2] = useState('');

  const [isModal, setIsModal] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const [taskFlagStatus, setTaskFlagStatus] = useState(1);
  
  const { state } = useContext(AuthContext);
  const { inline } = state;

  const goTo = (route, data) => {
    navigation.navigate(route, data);
  };

  const handleDataList = async (filter) => {
    try {
      setLoading(true);
      let getTaskData = [];
      if (inline) {
        getTaskData = await getTasks();
      } else {
        const dataTaskList = await getStep('taskList', 0, 0);
        getTaskData = JSON.parse(dataTaskList);
      }
      //await deleteLocationsFromDatabase();
      handleFilterData(getTaskData, filter, setData, setLoading, 'task', 'idTaskState');
      handleFilterData(getTaskData, filter, setDataTmp, setLoading, 'task', 'idTaskState');
    } catch (error) {
      console.error("[ handleDataList TASK ]", error);
    }
  };

  const handleFilter = (value = "") => {
    setFilterTxt(value)
    let dataFilter = []
    const regexPattern = new RegExp(value, "g");
    dataFilter = dataTmp.filter((item => item.task.ticket.description.match(regexPattern)))
    if (dataFilter.length > 0) {
      setData(dataFilter)
    } else {
      setData(dataTmp)
    }
  }

  const onPressExecution = (idTask, statusTracking) => {
    setTask(idTask);
    setTaskStatus(statusTracking)
    console.log("*****************");
    console.log({
      itemImage: "execution",
      headerTitle: "Proceso en ejecución",
      subTitle: "Se ha comenzado la captura de coordenadas, puede detenerlo cuando usted requiera.",
    });

    setInitServices(true);
  };

  useEffect(() => {
  }, [loading]);

  useEffect(() => {
    handleDataList(1);
    return () => handleDataList(1);
  }, [inline]);

  useEffect(() => {
    if (taskStatus.status) {
      setIsAlert(true);
      setTitleAlert(taskStatus.title);
      setMessageAlert(taskStatus.message);
    }
    handleDataList(1);
  }, [taskStatus]);

  return (
    <View style={{ flex:1, backgroundColor:colorsTheme.blanco}}>
      <Header
        isLeft={true}
        navigation={navigation}
        route={'Principal'}
        isRoute={true}
        title={'Listado De Tareas'}
        isOpen={open}
        isOpenFunction={isOpen}
      />
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 0 ? colorsTheme.amarillo : colorsTheme.naranja
          }}
          onPress={() => {
            setActive(0)
            setTaskFlagStatus(1);
            handleDataList(1)
          }}>
          <Text style={{ color: colorsTheme.blanco }}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 1 ? colorsTheme.amarillo : colorsTheme.naranja
          }}
          onPress={() => {
            setActive(1)
            setTaskFlagStatus(3);
            handleDataList(3)
          }}>
          <Text style={{ color: colorsTheme.blanco }}>Noc</Text>
        </TouchableOpacity>
      </View>
      {
        loading ?
          (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.5 }}>
              <ActivityIndicator size="large" color={colorsTheme.naranja} />
            </View>
          ) : (
            <>
              <View style={{ marginTop: 20, flexDirection: "row" }}>
                <TextInput
                  value={filterTxt}
                  onChangeText={(text) => handleFilter(text)}
                  style={{ ...styles.inputForm, borderWidth: 1, marginTop: 15 }}
                  placeholder='Buscador'
                  placeholderTextColor={colorsTheme.gris40}
                />
                <TouchableOpacity style={{ justifyContent: "center", marginHorizontal: 10, backgroundColor: colorsTheme.naranja, paddingHorizontal: 15, marginVertical: 8, borderRadius: 5 }}>
                  <FontAwesome5Icon
                    name={"search"}
                    color={colorsTheme.blanco}
                    size={20}
                  /> 
                </TouchableOpacity>
              </View>
              <View style={{ flex:1 }}>
                {
                  inline || taskFlagStatus == 1?(
                    <FlatList
                  data={orderBy(data, ['task.expirationDate', 'task.idTaskPriority'], ['desc'])}
                  renderItem={({ item }) => <RenderItemList 
                    item={item} 
                    goTo={goTo} 
                    onPressExecution={onPressExecution} 
                    cancelTracking={cancelTracking} 
                    stopTracking={stopTracking}
                    setIsAlert={setIsAlert2}
                    setTitleAlert={setTitleAlert2}
                    setMessageAlert={setMessageAlert2}
                    />}
                  keyExtractor={item => item.idTask}
                  contentContainerStyle={{ ...styles.container }}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  ListHeaderComponent={
                    <View style={{ backgroundColor: colorsTheme.naranja, alignItems: 'center', padding: 15, marginBottom: 10, marginHorizontal:5 }}>
                      <Text style={{ color: colorsTheme.blanco, fontSize: 15, fontWeight:'bold' }}> Tareas</Text>
                    </View>
                  }
                  ListEmptyComponent={
                    <View style={{
                      backgroundColor: colorsTheme.naranja60,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      padding: 10,
                      margin: 10
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colorsTheme.blanco }}>No se encontraron datos.</Text>
                    </View>
                  }
                />
                  ):(
                    <View style={{ backgroundColor: colorsTheme.naranja, margin: 10, padding: 10}}>
                      <Text style={{color: colorsTheme.blanco, fontSize:15}}>Cuando estes offline no se pueden procesar tareas en estado NOC</Text>
                    </View>
                  )
                }
                

              </View>
            </>
          )
      }
      <AwesomeAlert
        show={isAlert}
        title={titleAlert}
        message={messageAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          setIsAlert(false);
        }}
      />
      <AwesomeAlert
        show={isAlert2}
        showProgress={true}
        title={titleAlert2}
        message={messageAlert2}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
      />
      <ModalComponent
        isOpen={isModal}
        toggleModal={setIsModal}
        isLoading={infoLoading}
        key={"infoTask"}
        children={<TaskInfoScreen data={taskData} isLoading={infoLoading} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    marginTop: 10,
  },
  containerList: {
    background: {
      flexDirection: 'row',
      width: width * 0.95,
      margin: 4,
      backgroundColor: colorsTheme.blanco,
      borderRadius: 5,
      padding: 5,
      shadowColor: colorsTheme.gris80,
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
    flex: 1,
    fontSize: 17,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderRadius: 10,
    marginHorizontal: 10
  },
  buttonTab: {
    backgroundColor: colorsTheme.naranja,
    flex: 1,
    height: height * 0.06,
    paddingTop: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
});

export default TaskListScreen;