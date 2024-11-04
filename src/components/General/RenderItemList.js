import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeModules
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { ListItem } from '@rneui/themed';
import moment from 'moment';

import { Context as AuthContext } from '../../context/AuthContext';
import { colorsTheme } from '../../configurations/configStyle';
import { getTaskById } from '../../services/task.services';
import { updateStep, getStep, deleteStep } from '../../functions/fncSqlite';
import { createFieldTrackerTable, getLocationsFromDatabaseByIdTask, insertLocationToDatabase, deleteLocationsFromDatabaseByIdTask } from '../../functions/fncTracker';
import { handleGetDataUserLocal } from '../../functions/fncGeneral';
import { sendDataTracker } from '../../services/tracking.services';

const { width, height } = Dimensions.get('screen');

const RenderItemList = ({ goTo, item, onPressExecution, cancelTracking, stopTracking, setIsAlert, setTitleAlert, setMessageAlert }) => {

  const {GPSModule} = NativeModules;
  const { state } = useContext(AuthContext);
  const { inline } = state;
  const reloadDataRef = useRef(null);

  const [taskData, setTaskData] = useState([]);
  const [infoLoading, setInfoLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [dataTracking, setDataTracking] = useState([]);

  useEffect(() => {
    onGetData();
  }, []);

  const onGetData = async () => {
    try {
      setInfoLoading(true);
      createFieldTrackerTable();

      const id = item.idTask;
      let data = inline ? await getTaskById(id) : JSON.parse(await getStep('taskInfo', id, 0)) || [];

      const status = await getStep('taskStatus', id, 0);
      console.log(`[Status Tarea => ] ${id}`, status)
      console.log("*************", status?.status)
      setTaskStatus(status?.status || "default");

      const trackingList = await getLocationsFromDatabaseByIdTask(id);
      setDataTracking(trackingList);
      setTaskData(data);
    } catch (error) {
      console.error("Error fetching task data:", error);
      setTaskData([]);
    } finally {
      setInfoLoading(false);
    }
  };

  const getPriorityStyle = (priorityName) => {
    switch (priorityName) {
      case 'Alta':
        return { color: colorsTheme.naranja, icon: 'warning-outline', size: 40 };
      case 'Media':
        return { color: 'yellow', icon: 'remove-circle-outline', size: 40 };
      case 'Baja':
        return { color: colorsTheme.verdeFuerte, icon: 'checkmark-circle-outline', size: 40 };
      default:
        return { color: colorsTheme.gris80, icon: 'info-outline', size: 40 };
    }
  };

  const { color, icon, size } = getPriorityStyle(item.task.taskPriority.name);

  const startTracking = async () => {
    try {
      await updateStep('taskStatus', item.idTask, { status: "Tracking", createdAt: new Date() }, 0);
      setTaskStatus("Tracking");
      onPressExecution(item.idTask, "Tracking");
      reloadDataRef.current = setInterval(()=>{
        onGetData();
      }, 15000)
    } catch (error) {
      console.error("Error starting action:", error);
    }
  };

  const handleInsideOfSite = async() => {
    setIsAlert(true);
    setTitleAlert("Cargando.....");
    setMessageAlert("");
    clearInterval(reloadDataRef.current);
    await stopTracking();
    updateStep('taskStatus', item.idTask, { status: "InSite", createdAt: new Date() }, 0);
    const { user } = await handleGetDataUserLocal();
    const location = await handleGetFixLocation();
    await insertLocationToDatabase(location, {idUser: user.idUser, idTask:item.idTask}, "InSite");
    setIsAlert(false);
    goTo(
      item.task.idTaskState !== 3 ? 'TaskDescription' : 'TaskNocValidation',
      { id: item.idTask, idCustomer: item.task.ticket.idCustomer, type: item.task.ticket.idTicketCategory }
    )
  }

  const handleCancelTracking = () => {
    deleteStep('taskStatus', item.idTask, 0);
    cancelTracking(item.idTask, taskStatus);
    onGetData();
  };

  const handleSiteExit = async () => {
    setIsAlert(true);
    setTitleAlert("Cargando.....");
    setMessageAlert("");
    updateStep('taskStatus', item.idTask, { status: "ExitSite", createdAt: new Date() }, 0);
    const { user } = await handleGetDataUserLocal();
    const location = await handleGetFixLocation();
    await insertLocationToDatabase(location, {idUser: user.idUser, idTask:item.idTask}, "ExitSite");
    inline && handleSendData();
  };

  const handleGetFixLocation = () => {
    return new Promise((resolve, reject) => {
      GPSModule.getCurrentLocation((lat, lon) => {
        if (typeof lat === 'string' || typeof lon === 'string') {
          reject({GPS:`0,0`});
          return;
        }
        const position = {GPS:`${lat},${lon}`};
        resolve(position);
      });
    });
  };

  const handleSendData = async() => {
    console.log("<==(START)==>");
    const trackingList = await getLocationsFromDatabaseByIdTask(item.idTask);
    console.log("<==(DATOS)==>", trackingList);
    const data = await sendDataTracker({locations:trackingList});
    console.log("<==(SSS)==>", data);
    if(data.status === true){
      console.log("_1_", data)
      deleteLocationsFromDatabaseByIdTask(item.idTask);
    }else{
      console.log("_2_", data)
    }
    onGetData();
    setIsAlert(false);
  }

  return (
    <ListItem.Accordion
      containerStyle={styles.accordionContainer}
      content={
        <View style={styles.accordionContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.task.taskState.idTaskState !== 3 ? colorsTheme.naranja : colorsTheme.verdeFuerte }]}>
            <FontAwesome5 name="id-card-alt" color={colorsTheme.blanco} size={25} style={styles.icon} />
          </View>
          <View style={styles.taskInfoContainer}>
            <Text style={styles.taskId}>TK-{item.idTask}</Text>
            <Text style={styles.taskDescription}>{item.task.ticket.description}</Text>
          </View>
          <View style={{ justifyContent:'center' }}>
            <IoniconsIcon
              name={icon}
              color={color}
              size={size}
              style={{marginLeft: 6, marginTop: 4}}
            />
          </View>
        </View>
      }
      isExpanded={expanded}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.accordionDetails}>
        {infoLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colorsTheme.naranja} />
          </View>
        ) : (
          <View style={styles.taskDetailsContainer}>

            <View style={{ flexDirection: 'row' }}>
              {(() => {
                switch (taskStatus) {
                  case 'Tracking':
                    return (
                      <View style={styles.centeredRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleCancelTracking}>
                          <AntDesignIcon name="close" color={colorsTheme.rojo} size={30} />
                          <Text style={styles.iconText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton} onPress={handleInsideOfSite}>
                          <IoniconsIcon name="location" color={colorsTheme.azul} size={30} />
                          <Text style={styles.iconText}>Llegada a sitio</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  case 'InSite':
                    return (
                      <View style={styles.centeredRow}>
                        <TouchableOpacity
                          style={{ justifyContent: 'center', alignItems: 'center' }}
                          onPress={() => {
                            goTo(
                              item.task.idTaskState !== 3 ? 'TaskDescription' : 'TaskNocValidation',
                              { id: item.idTask, idCustomer: item.task.ticket.idCustomer, type: item.task.ticket.idTicketCategory }
                            )
                          }}
                        >
                          <IoniconsIcon name="clipboard-outline" color={colorsTheme.celeste} size={30} />
                          <Text style={{ color: colorsTheme.negro }}>Realizar Tarea</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  case 'EndTask':
                    return (
                      <View style={styles.centeredRow}>
                        <TouchableOpacity
                          style={{ justifyContent: 'center', alignItems: 'center' }}
                          onPress={handleSiteExit}
                        >
                          <IoniconsIcon name="log-in-outline" color={colorsTheme.rojo} size={30}/>
                          <Text style={{ color: colorsTheme.negro }}>Salida del sitio</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  default:
                    return (
                      item.task.taskState.idTaskState !== 3 ? (
                      <View style={styles.centeredRow}>
                        <TouchableOpacity
                          style={{ justifyContent: 'center', alignItems: 'center' }}
                          onPress={startTracking}
                        >
                          <MaterialCommunityIcons name="map-marker-path" color={colorsTheme.verdeFuerte} size={30} />
                          <Text style={{ color: colorsTheme.negro, fontWeight: 'bold' }}>Iniciar Camino</Text>
                        </TouchableOpacity>
                      </View>
                      ):(
                        <View style={{ justifyContent:'center', alignItems:'center', alignContent:'center', }}>
                          <Text style={{ color: colorsTheme.negro }}>Por favor, espera la validación del equipo de NOC.</Text>
                        </View>
                      )
                    );
                }
              })()}
            </View>

            {
              item.task.taskState.idTaskState !== 3 && (
                <View >
                  <View style={{ backgroundColor: colorsTheme.naranja }}>
                    <Text style={styles.sectionTitle}>{"Datos de la tarea"}</Text>
                  </View>
                  <View style={{ margin: 10 }}>
                    <Text style={styles.taskDetail}>
                      <Text style={styles.taskDetailLabel}>{"Fecha de expiración: "}</Text>
                      {moment(taskData.expirationDate ?? "").format("MM-DD-YYYY")}
                    </Text>
                    <Text style={styles.taskDetail}>
                      <Text style={styles.taskDetailLabel}>{"Tendero: "}</Text>{taskData?.ticket?.customer.name ?? ""}
                    </Text>
                    <Text style={styles.taskDetail}>
                      <Text style={styles.taskDetailLabel}>{"Teléfono: "}</Text>{taskData?.ticket?.customer.phone ?? ""}
                    </Text>
                    <Text style={styles.taskDetail}>
                      <Text style={styles.taskDetailLabel}>{"Tipo: "}</Text>{taskData?.ticket?.ticketCategory.name ?? ""}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colorsTheme.naranja, }}>
                    <Text style={styles.sectionTitle}>{"Componentes requeridos"}</Text>
                  </View>
                  <View style={{ margin: 10 }}>
                    <FlatList
                      data={taskData.taskAddons}
                      keyExtractor={(addon) => addon.idTaskAddon}
                      renderItem={({ item, index }) => (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.taskDetailLabel}>{(index + 1) + ". "}</Text>
                          <Text style={styles.addonText}>{item.addon.name}</Text>
                        </View>
                      )}
                      ListEmptyComponent={
                        <View style={{ alignItems:'center'}}>
                          <Text style={{ color: colorsTheme.negro }}> No se cuenta con datos</Text>
                        </View>
                      }
                    />
                  </View>
                  <View style={{ backgroundColor: colorsTheme.naranja }}>
                    <Text style={styles.sectionTitle}>{"Equipo a recoger"}</Text>
                  </View>
                  <View style={{ margin: 10 }}>
                    <FlatList
                      data={taskData.receivedAddons}
                      keyExtractor={(addon) => addon.idTaskAddon}
                      renderItem={({ item, index }) => (
                        <Text style={styles.addonText}>{(index + 1) + "."}{item.addon.name}</Text>
                      )}
                      ListEmptyComponent={
                        <View style={{ alignItems:'center'}}>
                          <Text style={{ color: colorsTheme.negro }}> No se cuenta con datos</Text>
                        </View>
                      }
                    />
                  </View>
                  <View style={{ backgroundColor: colorsTheme.naranja }}>
                      <Text style={styles.sectionTitle}>{"Datos GPS"}</Text>
                    </View>
                  <View style={{ margin: 10 }}>
                    <FlatList
                      data={dataTracking}
                      keyExtractor={(addon) => addon.idTaskAddon}
                      renderItem={({ item, index }) => (
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: colorsTheme.negro }}>GPS:</Text>
                            <Text style={{ color: colorsTheme.negro }}>{item.GPS}</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: colorsTheme.negro }}>User:</Text>
                            <Text style={{ color: colorsTheme.negro }}>{item.idUser}</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: colorsTheme.negro }}>Status:</Text>
                            <Text style={{ color: colorsTheme.negro }}>{item.status}</Text>
                          </View>
                        </View>
                      )}
                      ListEmptyComponent={
                        <View style={{ alignItems:'center'}}>
                          <Text style={{ color: colorsTheme.negro }}> No se cuenta con datos</Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              )
            }

          </View>
        )}
      </View>
    </ListItem.Accordion>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    borderWidth: 1,
    marginHorizontal: 5,
  },
  accordionContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 60,
  },
  taskInfoContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  taskId: {
    fontWeight: '900',
    fontSize: 18,
    color: colorsTheme.negro,
  },
  taskDescription: {
    fontSize: 12,
    color: colorsTheme.negro,
  },
  accordionDetails: {
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.5,
  },
  taskDetailsContainer: {
    margin: 15,
  },
  taskDetail: {
    color: colorsTheme.gris,
  },
  taskDetailLabel: {
    color: colorsTheme.negro,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colorsTheme.blanco,
    fontWeight: '700',
    marginVertical: 10,
    textAlign: 'center'
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  addonText: {
    color: colorsTheme.gris,
  },
  noDataText: {
    color: colorsTheme.gris,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconText: {
    color: colorsTheme.negro,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default RenderItemList;
