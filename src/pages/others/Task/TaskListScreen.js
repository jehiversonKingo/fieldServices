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

//Components
import Header from '../../../components/Layouts/Header';
import RenderItemList from '../../../components/General/RenderItemList';

//services
import { getTasks, getElemetScreen, getStepInstruction, getTaskById } from '../../../services/task.services';
import { updateStep, getStep } from '../../../functions/fncSqlite';
import { handleFilterData } from '../../../functions/fncGeneral';

const { width, height } = Dimensions.get('screen');

import { colorsTheme } from '../../../configurations/configStyle';

import { Context as AuthContext } from '../../../context/AuthContext';
import ModalComponent from '../../../components/General/ModalComponent';
import TaskInfoScreen from './TaskInfoScreen';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const TaskListScreen = ({ navigation, route }) => {
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

  const [isModal, setIsModal] = useState(false);
  const [taskData, setTaskData] = useState([]);

  const { state } = useContext(AuthContext);
  const { inline } = state;

  const goTo = (route, data) => {
    navigation.navigate(route, data);
  };

  const onLongPress = async (id) => {
    try {
      let data = [];
      setInfoLoading(true);
      setIsModal(true)
      if (inline) {
        response = await getTaskById(id);
        data = response ? response : [];
      } else {
        let dataTask = await getStep('taskInfo', id, 0);
        data = dataTask ? JSON.parse(dataTask) : [];
      }

      if (data.length === 0) {
        setTaskData([])
      } else {
        if (data.taskAddons.length > 0) {
          const install = data.taskAddons.filter(item => item.transferType === 'enviado');
          const pickup = data.taskAddons.filter(item => item.transferType === 'recibido');

          data["taskAddons"] = install;
          data["receivedAddons"] = pickup;
          console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~>', data)
          setTaskData(data)
        }
      }
      setInfoLoading(false);
    } catch (error) {
      console.log("[ onLongPress TASK ] >", error);
      setTaskData([])
      setInfoLoading(false);
    }
  }

  const handleDataList = async (filter) => {
    try {
      setLoading(true);
      let getTaskData = [];
      if (inline) {
        console.log('[ TASK INLINE ]');
        getTaskData = await getTasks();
       /*  for (const task of getTaskData) {
          const [dataTask, infoTask] = await Promise.all([
            getElemetScreen(task.idTask),
            getTaskById(task.idTask)
          ]);
          const { steps } = dataTask;
          await Promise.all([
            updateStep('taskDescription', task.idTask, JSON.stringify(dataTask), 0),
            updateStep('taskInfo', task.idTask, JSON.stringify(infoTask), 0)
          ]);

          for (const step of steps) {
            const dataStepsToDo = await getStepInstruction(step.idStep);
            await updateStep('taskDescriptionToDo', step.idStep, JSON.stringify(dataStepsToDo), 0);
          }
        } */
        //await updateStep('taskList', 0, JSON.stringify(getTaskData), 0);
      } else {
        console.log('[ TASK OFF LINE ]');
        const dataTaskList = await getStep('taskList', 0, 0);
        getTaskData = JSON.parse(dataTaskList);
      }

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

  useEffect(() => {
  }, [loading]);

  useEffect(() => {
    handleDataList(1);
    return () => handleDataList(1);
  }, [inline]);

  useEffect(() => {
    console.log('I GET THIS', taskStatus)
    if (taskStatus.status) {
      setIsAlert(true);
      setTitleAlert(taskStatus.title);
      setMessageAlert(taskStatus.message);
    }
    handleDataList(1);
  }, [taskStatus]);

  return (
    <>
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
                  style={{ ...styles.inputForm }}
                  placeholder='Buscador'
                  placeholderTextColor={colorsTheme.gris80}
                />
                <TouchableOpacity style={{ justifyContent: "center", marginHorizontal: 10 }}>
                  <FontAwesome5Icon
                    name={"search"}
                    color={colorsTheme.naranja}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={orderBy(data, ['task.expirationDate', 'task.idTaskPriority'], ['desc'])}
                renderItem={({ item }) => <RenderItemList item={item} goTo={goTo} onLongPress={onLongPress} />}
                keyExtractor={item => item.idTask}
                contentContainerStyle={{ ...styles.container }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={{
                    backgroundColor: colorsTheme.naranja60,
                    width: width * 0.90,
                    height: height * 0.05,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 100,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colorsTheme.blanco }}>No se encontraron datos.</Text>
                  </View>
                }
              />
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
      <ModalComponent
        isOpen={isModal}
        toggleModal={setIsModal}
        isLoading={infoLoading}
        key={"infoTask"}
        children={<TaskInfoScreen data={taskData} isLoading={infoLoading} />}
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