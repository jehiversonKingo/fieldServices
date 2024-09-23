import React, { useEffect, useState, useContext } from 'react';
import {View, FlatList, Dimensions, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import { ListItem } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
import * as Progress from 'react-native-progress';
import * as RNFS from 'react-native-fs';

//Components
import Header from '../../../components/Layouts/Header';
import { getTasks, getTaskById, setDataAllTaskInstall, getStepInstruction, getElemetScreen, setDataAllTaskMigration, setDataAllTaskPickup, setDataAllTaskSwap, setDataTaskChecklist, setDataTaskPhotos, setDataAllTaskVisit } from '../../../services/task.services';
import { getTicketById } from '../../../services/ticket.services';
import {getAllDataStep, deleteStep} from '../../../functions/fncSqlite';
import {handleGetLocationReturnValue, handleGetLocationValue} from '../../../functions/fncLocation';
import {colorsTheme} from '../../../configurations/configStyle';
import { getStep, updateStep } from '../../../functions/fncSqlite';
import {Context as AuthContext} from '../../../context/AuthContext';

const {width, height} = Dimensions.get('screen');

const TaskOffline = ({navigation}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState([]);
    const [isAlert, setIsAlert] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showProgressAlert, setShowProgressAlert] = useState(false);
    const [progressAlert, setProgressAlert] = useState(0);
    const [totalUpload, setTotalUpload] = useState(0);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [totalEvidences, setTotalEvidences] = useState(0);
    const [disabledUpload, setDisabeldUpload] = useState(false);
    const {state} = useContext(AuthContext);
    const {inline} = state;

    const getAllDataTask = async () => {
      let getTasks = [];
      let dataTask = await getAllDataStep('TaskComplete');
      getTasks = dataTask;
      setData(getTasks);
      setLoading(false);
    };

    const TaskStackStep1 = ({item, index}) => {
      return(
        <View key={`B${index}`} style={{flexDirection: "row", backgroundColor: colorsTheme.naranja20}}>
          <View key={`C${index}`}>
            <Text key={`D${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
              {
                typeof item.value === 'object' ? (
                  item.screenElement.name !== 'Sync' && (
                    item.screenElement.name +': '+ item?.value?.latitude + ', '+ item?.value?.longitude
                  )
                ) : (
                  item.screenElement.name +': '+ item.value
                )
              }
            </Text>
          </View>
        </View>
      )
    };

    const TaskStackStep2 = ({item, index}) => {
      return(
        <View key={`B1${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
          <View key={`C1${index}`}>
            <Text key={`D1${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
              {item.addon.name +': '+ item.value}
            </Text>
          </View>
        </View>
      )
    };

    const TaskStackStep3 = ({item, index}) => {
      return(
        <View key={`B2${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
          <View key={`C2${index}`}>
            <FitImage
                indicator={true}
                indicatorColor={colorsTheme.naranja}
                indicatorSize="large"
                source={{ uri: 'file://' + item.photo.path }}
                resizeMode="stretch"
                style={{ width: 150, height: 150 }}
            />
          </View>
        </View>
      )
    };

    const TaskStackStep4 = ({item, index}) => {
      return(
        <View key={`B3${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
          <View key={`C3${index}`}>
            <Text key={`D3${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
              {item.addon.name +': '+ item.value}
            </Text>
          </View>
        </View>
      )
    };

    const handleChangeOpenCollapse = (value, index) => {
      const tempExpanded = [...expanded];
      tempExpanded[index] = value;
      setExpanded(tempExpanded);
    }

    const TaskStack = ({item, index}) => {
      const task = JSON.parse(item);
      return (
        <View
          style={{
            padding: 12,
            margin:5,
            borderColor: colorsTheme.naranja60,
            borderWidth:3,
          }}
          keyExtractor={(item) => item.idTask.toString()}
          key={`AT-${index}`}>
          <ListItem.Accordion
            content={
              <>
                <Ionicons
                  name={'list'}
                  size={30}
                  style={styles.iconImg}
                />
                <ListItem.Content>
                  <ListItem.Title>{' TASK ID: ' + task.idTask}</ListItem.Title>
                </ListItem.Content>
              </>
            }
            isExpanded={expanded[index]}
            onPress={() => {
              handleChangeOpenCollapse(!expanded[index], index);
            }}
            containerStyle={{
              borderLeftColor: colorsTheme.naranja80,
              borderLeftWidth: 5,
              borderRadius: 5,
            }}
          >
          <FlatList
              key={'list-general' + index}
              listKey={'general'}
              data={task.step1}
              renderItem={TaskStackStep1}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', margin:30}}
              keyExtractor={item => item.idTaskScreenElement}
              numColumns={2}
              ListHeaderComponent={
              <View
                  style={{
                    backgroundColor: colorsTheme.naranja,
                    borderRadius: 5,
                    width: width * 0.76,
                    padding: 10,
                    justifyContent:'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>Datos Generales</Text>
              </View>
              }
              ListEmptyComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.gris80,
                  width: width * 0.76,
                  padding: 10,
                  alignContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>
                  No se han encontrado Datos generales.
                  </Text>
              </View>
              }
          />

          <FlatList
              key={'list-addons' + index}
              listKey={'addons'}
              data={task.step2}
              renderItem={TaskStackStep2}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', margin:30}}
              keyExtractor={item => item.idTaskAddon}
              ListHeaderComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.naranja,
                  width: width * 0.76,
                  padding: 10,
                  justifyContent:'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>Equipo Y Complementos</Text>
              </View>
              }
              ListEmptyComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.gris80,
                  width: width * 0.76,
                  padding: 10,
                  alignContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>
                  No se han encontrado Equipos o Complementos.
                  </Text>
              </View>
              }
          />

          <FlatList
              key={'list-toDo' + index}
              listKey={'toDo'}
              data={task.evidences}
              renderItem={TaskStackStep3}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', margin:30}}
              // keyExtractor={item => (item.idTaskStep + index).toString()}
              ListHeaderComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.naranja,
                  width: width * 0.76,
                  padding: 10,
                  justifyContent:'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>Evidencia instrucciones</Text>
              </View>
              }
              ListEmptyComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.gris80,
                  width: width * 0.76,
                  padding: 10,
                  alignContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>
                  No se han encontrado datos sobre evidencia.
                  </Text>
              </View>
              }
          />

          <FlatList
              key={'list-addon-back' + index}
              listKey={'addons-back'}
              data={task.step4}
              renderItem={TaskStackStep4}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: '50%', margin:30}}
              keyExtractor={item => item.idTaskScreenElement}
              ListHeaderComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.naranja,
                  width: width * 0.76,
                  padding: 10,
                  justifyContent:'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>Equipo y Complementos recogido</Text>
              </View>
              }
              ListEmptyComponent={
              <View
                  style={{
                  backgroundColor: colorsTheme.gris80,
                  width: width * 0.76,
                  padding: 10,
                  alignContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  }}>
                  <Text style={{color: colorsTheme.blanco}}>
                  No se han encontrado datos sobre Equipos o Complementos recogidos.
                  </Text>
              </View>
              }
          />

          </ListItem.Accordion>
        </View>
      );
    };

    const handleResolveTask = async (task) => {
      try {
        const {idTask, typeTask, step1, step2, evidences, step4, step5, availableDays} = task;
        console.log('[ AVAILABLE DAYS ] >>>>>>>>>>>>>> ', availableDays);
        setIsAlert(true);
        setTitleAlert(`Preparando tarea ${idTask}`);
        setMessageAlert('');
        setTotalEvidences(evidences.length);

        let dataKingos = JSON.parse(await getStep('warehouseEquipment', 0, 0));
        let dataAddons = JSON.parse(await getStep('warehouseAddon', 0, 0));

        let inventoryKingo =
          dataKingos.length > 0 ? dataKingos.map(item => item.barcode) : [];
        let inventoryAddon =
          dataAddons.length > 0 ? dataAddons.map(item => item.barcode) : [];

        let validArrayKingosStep2 = false;

        if (typeTask !== 7) {
          // is different to pickup
          validArrayKingosStep2 = step2.some(item => {
            if (/^E/i.test(item.value)) {
              return inventoryKingo.includes(item.value);
            } else if (/^A/i.test(item.value)) {
              console.log(inventoryAddon);
              return inventoryAddon.includes(item.value);
            } else return false;
          });
        } else {
          validArrayKingosStep2 = true;
          validArrayAddonsStep2 = true;
        }

        if (step2.length <= 0 && step4.length <= 0) {
          validArrayKingosStep2 = true;
        }

        if (validArrayKingosStep2) {
          let responseCheck = {status: true}
          if (step5.length > 0) {
            responseCheck = await setDataTaskChecklist({step5, idTask});
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('Válidando checklist');
              setMessageAlert('');
              setIsAlert(true);
            }, 300);
          }
          if (responseCheck?.status) {
            let taskStatus = null;
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('Cargando Datos, Espere por favor');
              setMessageAlert('');
              setIsAlert(true);
            }, 200);
            switch (typeTask) {
              case 1:
                taskStatus = await setDataAllTaskInstall({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask,
                });
                break;
              case 2:
                taskStatus = await setDataAllTaskInstall({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask,
                });
                break;
              case 6:
                taskStatus = await setDataAllTaskSwap({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask,
                });
                break;
              case 7:
                taskStatus = await setDataAllTaskPickup({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask,
                });
                break;
                case 10:
                console.log('EN EL 10 estoy');
                taskStatus = await setDataAllTaskMigration({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask,
                  blockDays: availableDays
                });
              case 11:
                console.log('EN EL 10 estoy');
                taskStatus = await setDataAllTaskMigration({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask,
                  blockDays: availableDays
                });
                case 12:
                const location = await handleGetLocationValue();
                console.log('[ GPS LOCATIONS ] >>> ', location);
                taskStatus = await setDataAllTaskVisit({
                  step1,
                  idTask,
                  gps: `${location.latitude || 0},${location.longitude || 0}`
                });
                break;
              default:
                setIsAlert(false);
                setTimeout(() => {
                  setTitleAlert('¡Atención!');
                  setMessageAlert(
                    'No se puede procesar, problemas con el tipo de tarea',
                  );
                  setShowAlert(true);
                }, 150);
            }

            if (taskStatus?.status) {
              setIsAlert(false);
              setTimeout(() => {
                setShowProgressAlert(true);
              }, 300);

              for (let i = 0; i < evidences.length; i++) {
                const item = evidences[i];
                console.log('[ PHOTO ]', item);
                const base64 = await RNFS.readFile(`file://${item.path}`, 'base64');
                let photosReq = await setDataTaskPhotos({
                  step3: [{...item, photo: `data:image/jpg;base64,${base64}`}],
                  idTask,
                });
                console.log('[ UPLOAD PHOTO ]', photosReq);
                setTotalUpload(prev => prev + 1);
                setProgressAlert(prev => prev + 100 / evidences.length / 100);
              }

              await deleteStep('TaskComplete', idTask);
              await deleteStep('taskInfo', idTask);
              

              let getTaskData = await getTasks();
              await updateStep('taskList', 0, JSON.stringify(getTaskData), 0);
              
              for (let task of getTaskData) {
                let dataTask = await getElemetScreen(task.idTask);
                const { steps } = dataTask;
                const infoTask = await getTaskById(task.idTask)
                await updateStep('taskDescription', task.idTask, JSON.stringify(dataTask), 0);
                await updateStep('taskInfo', task.idTask, JSON.stringify(infoTask), 0)
                steps.forEach(async (step) => {
                  let dataStepsToDo = await getStepInstruction(step.idStep)
                  await updateStep('taskDescriptionToDo', step.idStep, JSON.stringify(dataStepsToDo), 0);
                });
              }

              setShowProgressAlert(false);
              navigation.navigate('Task', {taskStatus});
            } else {
              setIsAlert(false);
              setShowProgressAlert(false);
              setTimeout(() => {
                setTitleAlert('Error');
                setMessageAlert(
                  taskStatus?.message ||
                    'No se puedieron cargar los datos de la tarea.',
                );
                setShowAlert(true);
              }, 150);
            }
          } else {
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('¡Atención!');
              setMessageAlert(
                'Debes cargar datos antes de salir a realizar una tarea.',
              );
              setShowAlert(true);
            }, 150);
          }
        } else {
          setIsAlert(false);
          setTimeout(() => {
            setTitleAlert('Error');
            setMessageAlert(
              'Alguno de los barcodes que ingresaste no existen en tu bodega.',
            );
            setShowAlert(true);
          }, 150);
        }

      } catch (error) {
        console.log(error);
      }
    }

    const completeTask = async () => {
      setDisabeldUpload(true)
      setIsAlert(true);
      setTitleAlert('Cargando datos, espere por favor');
      if(inline){
          let errorList = [];
          data.forEach(async(iteration) => {
            let task = JSON.parse(iteration);
            for(let item of task.step1){
              if(typeof item.value === 'object' && item.screenElement?.elementType.name === 'location') {
                  let location = await handleGetLocationReturnValue(setIsAlert, setTitleAlert, setMessageAlert);
                  // item.value = location;
              }
            }

            await handleResolveTask(task);
          });
          setIsAlert(false);
          setDisabeldUpload(false)
          getAllDataTask();
          // navigation.navigate('Task', { taskStatus });
      } else {
        setDisabeldUpload(false)
          setTitleAlert('Error sigues offline');
          setMessageAlert('No se pueden cargar las tareas por que sigues offline.')
          setTimeout(() => {
              setIsAlert(false);
          }, 2500);
      }
    };

    useEffect(()=>{
      getAllDataTask();
    },[]);

    const ListOfflineTask = () => (
        <FlatList
            key={'list-offline'}
            data={data}
            renderItem={TaskStack}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: '50%', margin:30, marginTop:65}}
            ListHeaderComponent={
            <View
                style={{
                backgroundColor: colorsTheme.naranja,
                width: width,
                padding: 10,
                alignItems: 'center',
                marginTop: 10,
                }}>
                <Text style={{color: colorsTheme.blanco}}>Listado Tareas Pendientes de enviar</Text>
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
                No se han encontrado tareas en cola.
                </Text>
            </View>
            }
         />
    );

  return (
    <View>
        <Header
        isLeft={true}
        navigation={navigation}
        route={'Principal'}
        title={'Listado De Tareas'}
      />
      {loading ?
        (
          <View style={{justifyContent: 'center', alignItems: 'center', height:height * 0.5}}>
            <ActivityIndicator size="large" color={colorsTheme.naranja}/>
          </View>
        ) : (
            <>
                <TouchableOpacity
                    style={{
                        marginTop:10,
                        flexDirection: 'row',
                        backgroundColor: colorsTheme.naranja,
                        borderRadius: 10,
                        width: 50,
                        height: 50,
                        position:'absolute',
                        right:10,
                        alignItems:'center',
                        justifyContent:'center',
                        borderWidth:1,
                        borderColor:colorsTheme.blanco
                    }}
                    disabled={disabledUpload}
                    onPress={completeTask}>
                    <Ionicons name={'arrow-up'} color={colorsTheme.blanco} size={25} />
                </TouchableOpacity>
            <ListOfflineTask />
            <AwesomeAlert
              show={isAlert}
              showProgress={true}
              title={titleAlert}
              message={messageAlert}
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
            <AwesomeAlert
              show={showProgressAlert}
              title={'Cargando Imagenes...'}
              closeOnTouchOutside={false}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              customView={
                <View>
                  <Text style={{color: 'black', textAlign: 'center'}}>
                    {totalUpload} de {totalEvidences}
                  </Text>
                  <Progress.Bar
                    progress={progressAlert}
                    width={200}
                    color={colorsTheme.naranja}
                    animated={true}
                    animationType="spring"
                  />
                </View>
              }
            />
            </>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default TaskOffline;
