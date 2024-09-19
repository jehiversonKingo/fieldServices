import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {ProgressSteps, ProgressStep} from 'react-native-progress-steps';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {ListItem} from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import * as Progress from 'react-native-progress';
import orderBy from 'lodash/orderBy';

import Header from '../../../components/Layouts/Header';
import ButtonProgressStep from '../../../components/General/ButtonProgressStep';
import StepToDoComponent from '../../../components/General/StepToDoComponent';
import InputGenerateStep from '../../../components/General/InputGenerateStep';

import {
  handleChange,
  handleChangeArray,
} from '../../../functions/functionChangeValue';
import {updateStep, deleteStep, getStep} from '../../../functions/fncSqlite';
import {hasCameraPermission} from '../../../functions/fncCamera';
import {
  handleValidDataStep,
  handleValidDataPhotos,
  handleValidExist,
} from '../../../functions/fncGeneral';

import {
  setDataAllTaskMigration,
  getCheckListByIdTask,
  getElemetScreen,
  getTaskStep,
  setDataAllTask,
  setDataAllTaskInstall,
  setDataAllTaskPickup,
  setDataAllTaskSwap,
  setDataTaskChecklist,
  setDataTaskEvidens,
  setDataTaskPhotos,
  setDataAllTaskMaintenance,
  setDataAllTaskProspect,
  setDataAllTaskVisit,
} from '../../../services/task.services';
import {colorsTheme} from '../../../configurations/configStyle';

const {width, height} = Dimensions.get('screen');

import {Context as AuthContext} from '../../../context/AuthContext';
import {getAllCommunities} from '../../../services/settings.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HandshakeServerScreen from '../Sync/HandshakeServerScreen';
import {ScrollView} from 'react-native-gesture-handler';

const TRANSACTION_LIST = [
  {
    id: 1,
    types: [10, 11],
    title: 'Datos Tendero',
    icon: 'filetext1',
    counter: 0,
  },
  {
    id: 2,
    types: [10, 11],
    title: 'Billeteras Tenderos',
    icon: 'wallet',
    counter: 0,
  },
  {
    id: 3,
    types: [10],
    title: 'Balance Tendero',
    icon: 'calculator',
    counter: 0,
  },
  {
    id: 4,
    types: [10],
    title: 'Transacciones Tenderos',
    icon: 'carryout',
    counter: 0,
  },
  {
    id: 5,
    types: [10],
    title: 'Deudas Tenderos',
    icon: 'creditcard',
    counter: 0,
  },
  {id: 6, types: [10], title: 'Ventas Tenderos', icon: 'filetext1', counter: 0},
  {
    id: 7,
    types: [10],
    title: 'Compras Tenderos',
    icon: 'filetext1',
    counter: 0,
  },
  {id: 8, types: [10, 11], title: 'Reglas', icon: 'filetext1', counter: 0},
  {id: 9, types: [10, 11], title: 'Planes', icon: 'filetext1', counter: 0},
  {
    id: 10,
    types: [10, 11],
    title: 'Promociones',
    icon: 'filetext1',
    counter: 0,
  },
];

const eventEmitter = new NativeEventEmitter(NativeModules.ServerSocketModule);
const {BluetoothServerModule} = NativeModules;
const TaskDescriptionScreen = ({navigation, route}) => {
  const typeTask = route.params.type;
  //Step
  const [active, setActive] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showProgressAlert, setShowProgressAlert] = useState(false);
  const [progressAlert, setProgressAlert] = useState(0);
  const [totalUpload, setTotalUpload] = useState(0);
  const [messageAlert, setMessageAlert] = useState('');
  const [titleAlert, setTitleAlert] = useState('');
  const [loading, setLoading] = useState(true);
  const [evidences, setEvidences] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [communities, setCommunities] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [customerConnect, setCustomerConnect] = useState(false);
  const [statusServer, setStatusServer] = useState('El servidor esta apagado');
  const [statusServerColor, setStatusServerColor] = useState(colorsTheme.rojo);
  const [transferStep, setTransferStep] = useState(0);
  const [successTransfer, setSuccessTransfer] = useState([]);
  const [dataBalance, setDataBalance] = useState(0);
  const [dataAvailableDays, setDataAvailableDays] = useState(14);
  const snapPoints = useMemo(() => ['100%', '100%', '90%'], []);
  const sheetRef = useRef(null);

  const [step1, setStep1] = useState([]);
  const [step2, setStep2] = useState([]);
  const [stepFlag2, setStepFlag2] = useState(false);
  const [step3, setStep3] = useState([]);
  const [step4, setStep4] = useState([]);
  const [stepFlag4, setStepFlag4] = useState(false);
  const [step5, setStep5] = useState([]);
  const [stepFlag5, setStepFlag5] = useState(false);
  const [idTaskSteps, setIdTaskSteps] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {state} = useContext(AuthContext);
  const {inline} = state;

  const InputsGenerateStep1 = ({item, index}) => (
    <InputGenerateStep
      elementId={'idTaskScreenElement'}
      item={item}
      index={index}
      navigation={navigation}
      objWithData={step1}
      evidences={evidences}
      setEvidences={setEvidences}
      setFunction={setStep1}
      setIsAlert={setIsAlert}
      setMessageAlert={setMessageAlert}
      setTitleAlert={setTitleAlert}
      selectData={communities}
      selectLabel={'name'}
      selectValue={'idCommunity'}
      bottonSheet={sheetRef}
      idTaskSteps={idTaskSteps}
      dataBalance={dataBalance}
      type={typeTask}
    />
  );

  const InputsGenerateStep2 = ({item, index}) => (
    <InputGenerateStep
      item={item}
      elementId={'idTaskAddon'}
      index={index}
      navigation={navigation}
      objWithData={step2}
      setFunction={setStep2}
    />
  );

  const InputsGenerateStep3 = ({item, index}) => {
    let customEvidence = evidences.filter(
      image => image.idTaskStep === item.idTaskStep,
    );
    return (
      <>
        <StepToDoComponent
          item={item}
          index={index}
          onClickStep={() =>
            navigation.navigate('Onboarding', {idStep: item.idStep})
          }
          onClickValidate={() => onClickValidate(item.idTaskStep)}
        />
        <View>
          {customEvidence.length > 0 && (
            <ListItem.Accordion
              content={
                <>
                  <Ionicons name={'camera'} size={30} style={styles.iconImg} />
                  <ListItem.Content>
                    <ListItem.Title>
                      {' '}
                      Fotos ({customEvidence.length})
                    </ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded[index]}
              onPress={() => {
                handleChangeArray(
                  index,
                  !expanded[index],
                  expanded,
                  setExpanded,
                );
              }}>
              <FlatList
                key={`FlatListImg-${index}`}
                data={customEvidence}
                renderItem={step3PhotoItem}
                numColumns={3}
                keyExtractor={item => item.idTaskStep}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: '10%', marginTop: 50}}
                columnWrapperStyle={{justifyContent: 'space-between'}}
              />
            </ListItem.Accordion>
          )}
        </View>
      </>
    );
  };

  const step3PhotoItem = ({item, index}) => (
    <View key={`P-${index}`}>
      <View style={{alignContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity style={{width: width * 0.3, margin: 1}}>
          <FitImage
            indicator={true}
            indicatorColor={colorsTheme.naranja}
            indicatorSize="large"
            source={{uri: 'file://' + item.path}}
            resizeMode="contain"
            // originalWidth={100}
            // originalHeight={150}
            // style={{ width: 100 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputsGenerateStep4 = ({item, index}) => (
    <InputGenerateStep
      item={item}
      elementId={'idReceivedAddon'}
      index={index}
      navigation={navigation}
      objWithData={step4}
      setFunction={setStep4}
    />
  );

  const InputsGenerateStep5 = ({item, index}) => {
    const step = item;
    return (
      <View key={`step-${index}`}>
        <Text style={styles.checkTitle}>{step?.step?.name}</Text>
        <FlatList
          data={
            step?.taskStepChecks
              ? step?.taskStepChecks.filter(a => ['Agente'].includes(a.access))
              : []
          }
          key={`check-${index}`}
          renderItem={({item, index}) => (
            <View style={styles.checkContainer}>
              <View key={`B-${index}`} style={{flexDirection: 'row'}}>
                <View key={`C-${index}`}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                      width: 280,
                      color: colorsTheme.negro,
                    }}>
                    {item?.check?.description || ''}
                  </Text>
                </View>
                <View style={styles.check}>
                  <BouncyCheckbox
                    size={25}
                    fillColor={colorsTheme.naranja}
                    unFillColor="#FFFFFF"
                    iconStyle={{borderColor: colorsTheme.naranja}}
                    innerIconStyle={{borderWidth: 2}}
                    textStyle={{fontFamily: 'JosefinSans-Regular'}}
                    hitSlop={{top: 30, bottom: 30, left: 50, right: 50}}
                    onPress={isChecked =>
                      handleClickCheck(isChecked, step.idTaskStep, item)
                    }
                    isChecked={item.checked}
                  />
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  const RenderTransactionList = ({item, index}) => (
    <>
      {item.types.includes(typeTask) && (
        <View
          style={{
            flex: 3,
            borderWidth: 2,
            borderColor: colorsTheme.naranja,
            padding: 10,
            margin: 5,
            borderRadius: 10,
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesignIcon size={30} color="black" name={item.icon} />
          </View>
          <View style={{alignItems: 'center', marginTop: 10}}>
            <Text style={{color: 'black', fontSize: 14, marginBottom: 5}}>
              {item.title}
            </Text>
            {!successTransfer.includes(item.id) && transferStep > 0 && (
              <View style={{alignContent: 'center'}}>
                <ActivityIndicator
                  size="large"
                  color={colorsTheme.verdeClaro}
                />
              </View>
            )}
            {successTransfer.includes(item.id) && (
              <View style={{alignContent: 'center'}}>
                <FontAwesome5
                  size={20}
                  color={colorsTheme.verdeClaro}
                  name={'check'}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </>
  );

  const onClickValidate = async idTaskStep => {
    console.log('[FUNCION onClickValidate]');
    const hasPermission = await hasCameraPermission();
    if (hasPermission) {
      navigation.navigate('CameraMultiShot', {
        setData: setEvidences,
        data: evidences,
        idTaskStep,
      });
    }
  };

  const handleDataList = async () => {
    setIsAlert(false);
    console.log('[ PARAMS ]', route.params);

    const {id} = route.params;
    let getDataScreen = [];
    let getCommunities = [];

    if (inline) {
      const [screenData, communitiesData] = await Promise.all([
        getElemetScreen(id),
        getAllCommunities(),
      ]);
      getDataScreen = screenData;
      getCommunities = communitiesData;
      await updateStep('communities', 1, JSON.stringify(communitiesData), 0);
    } else {
      const comm = await getStep('communities', 1, 0);
      getDataScreen = JSON.parse(await getStep('taskDescription', id, 0));
      console.log('TASK DESCRIPTION_()_)_))_)_)_)_))', getDataScreen);
      if (comm.length > 0) getCommunities = JSON.parse(comm);
    }

    if (!getDataScreen || !getCommunities) {
      setShowAlert(true);
      setTitleAlert('¡Atención!');
      setMessageAlert('Es posible que hagan falta algunos datos.');
    }

    const {screen, addon, steps, addonReceived, stepsChecks} = getDataScreen;

    console.log(
      '****************',
      screen,
      addon,
      steps,
      addonReceived,
      stepsChecks,
    );
    if (!screen || !addon || !steps || !addonReceived || !stepsChecks) {
      setShowAlert(true);
      setTitleAlert('¡Atención!');
      setMessageAlert(
        'Error, detectamos que los datos de la tarea no fueron cargados correctamente.',
      );
    }

    const newDataScreen = handleValidExist(
      screen,
      step1,
      'idTaskScreenElement',
      1,
    );
    const newDataAddon = handleValidExist(addon, step2, 'idTaskAddon', 2);
    console.log('PPPPPPPPPPPPPP', newDataAddon);
    const newDataSteps = handleValidExist(steps, step3, 'idTaskStep', 3);
    const newDataAddonReceived = handleValidExist(
      addonReceived,
      step4,
      'idReceivedAddon',
      4,
    );
    const newDataChecks = handleValidExist(stepsChecks, step5, 'idTaskStep', 5);

    /*if (newDataAddon.length == 0) setStepFlag2(true);
    if (newDataAddonReceived.length == 0) setStepFlag4(true);
    if (newDataChecks.length == 0) setStepFlag5(true); */

    setStep1(orderBy(newDataScreen, ['order'], ['asc']));
    setStep2(orderBy(newDataAddon, ['order'], ['asc']));
    setStep3(orderBy(newDataSteps, ['order'], ['asc']));
    setStep4(orderBy(newDataAddonReceived, ['order'], ['asc']));
    setStep5(orderBy(newDataChecks, ['order'], ['asc']));
    console.log('STEP 3>>', newDataSteps);
    const filteredTaskStep = newDataSteps.filter(
      taskStep => taskStep.idStep === 22,
    );
    const idTaskStep =
      filteredTaskStep.length > 0 ? filteredTaskStep[0].idTaskStep : null;
    console.log('idTaskStep filtrado >', idTaskStep);
    setIdTaskSteps(idTaskStep);
    setCommunities(getCommunities);

    const locationExpanded = new Array(newDataAddonReceived.length).fill(false);
    setExpanded(locationExpanded);

    setLoading(false);
  };

  const saveTemporalData = async (dbTable, step, active) => {
    try {
      console.log('Entramos', active);
      setIsProcessing(false);
      if (isProcessing) return;
      setIsProcessing(true);

      console.log('[ -------ACTIVE ] >', active);
      const {id} = route.params;
      let isValid = false;

      isValid = await handleValidDataStep(step);

      console.log('[ -------isValid ] >', isValid, active, stepFlag2);

      if (active === 0) {
        isValid = await handleValidDataStep(step);
        if (isValid) {
          setActive(prev => prev + 1);
        }
        setIsProcessing(false);
      }

      if (active === 1 || active === 3) {
        const flagValid = step.some(objeto => objeto.value !== null);
        if (flagValid || step.length == 0) {
          isValid = true;
          setActive(prev => prev + 1);
        }
      }

      if (active === 2) {
        let samePhotos = await handleValidDataPhotos(step3, evidences);
        if (samePhotos?.length === 0 && isValid === true) {
          setActive(prev => prev + 1);
        }
      }

      if (active === 4) {
        if (step5?.length === 0) {
          isValid = true;
        } else {
          step5.forEach(item => {
            const agentChecks = item.taskStepChecks.filter(
              check => check.access === 'Agente',
            );
            if (agentChecks?.length > 0) {
              agentChecks.forEach(check => {
                if (!check.checked) isValid = false;
              });
            } else {
              isValid = true;
            }
          });
        }
      }

      if (!isValid) {
        setShowAlert(true);
        setTitleAlert('¡Atención!');
        setMessageAlert('Debes ingresar todos los datos');
        setIsProcessing(false);
        return;
      }

      await updateStep(dbTable, id, step, active);

      if (active === 4) {
        console.log('[ UPLOAD TASK ]');
        setIsProcessing(false);
        completeTask();
      }

      setIsProcessing(false);
    } catch (error) {
      console.log('[ ERROR SAVE TEMPORAL DATA ] => ', error);
      setIsProcessing(false);
    }
  };

  /**
   * COMPLETAR LA TAREA >>>>
   */
  const completeTask = async () => {
    try {
      const {id, type} = route.params;
      console.log('[TYPE TASK] >>', type);
      setIsAlert(true);
      setTitleAlert('Iniciando proceso');
      setMessageAlert('');
      let dataKingos = JSON.parse(await getStep('warehouseEquipment', 0, 0));
      let dataAddons = JSON.parse(await getStep('warehouseAddon', 0, 0));
      console.log('^^^^^^^^', dataKingos, dataAddons);
      let inventoryKingo =
        dataKingos.length > 0 ? dataKingos.map(item => item.barcode) : [];
      let inventoryAddon =
        dataAddons.length > 0 ? dataAddons.map(item => item.barcode) : [];

      let validArrayKingosStep2 = false;
      let validArrayAddonsStep2 = false;

      if (type !== 7) {
        if (step2.length > 0) {
          // is different to pickup
          validArrayKingosStep2 = step2.some(item => {
            const itemValue = item.value.trim(); // Elimina espacios innecesarios
            console.log('Buscando:', itemValue);

            if (/^E/i.test(itemValue)) {
              console.log('Buscando en inventoryKingo:', inventoryKingo);
              const foundInKingo = inventoryKingo.some(
                kingoItem => kingoItem.trim() === itemValue,
              ); // Trim en ambos lados
              console.log('¿Encontrado en inventoryKingo?:', foundInKingo);
              return foundInKingo;
            } else if (/^A/i.test(itemValue)) {
              console.log('Buscando en inventoryAddon:', inventoryAddon);
              const foundInAddon = inventoryAddon.some(
                addonItem => addonItem.trim() === itemValue,
              ); // Trim en ambos lados
              console.log('¿Encontrado en inventoryAddon?:', foundInAddon);
              return foundInAddon;
            } else {
              return false;
            }
          });
          console.log('AAAAA', validArrayKingosStep2);
        } else {
          validArrayKingosStep2 = true;
          validArrayAddonsStep2 = true;
        }
      } else {
        validArrayKingosStep2 = true;
        validArrayAddonsStep2 = true;
      }

      if (inline) {
        if (step2.length <= 0 || step4.length <= 0) {
          validArrayKingosStep2 = true;
        }

        if (validArrayKingosStep2) {
          console.log('SI ENTRO');
          let responseCheck = await setDataTaskChecklist({step5, idTask: id});
          setIsAlert(false);
          setTitleAlert('Válidando checklist');
          setMessageAlert('');
          setIsAlert(true);
          if (responseCheck?.status) {
            console.log('[RESPUESTA DEL CHECKLIST] >>>', responseCheck);
            let taskStatus = null;
            setTitleAlert('Cargando Datos, Espere por favor');
            setMessageAlert('');
            setIsAlert(true);
            console.log('TIIIIIIIIIIIIIIIPO', type);
            switch (type) {
              case 1:
                taskStatus = await setDataAllTaskInstall({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 2:
                taskStatus = await setDataAllTaskInstall({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 3:
                taskStatus = await setDataAllTaskMaintenance({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask: id,
                });
              case 4:
                taskStatus = await setDataAllTaskMaintenance({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 5:
                taskStatus = await setDataAllTaskProspect({
                  step1,
                  step2,
                  step3: null,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 6:
                taskStatus = await setDataAllTaskSwap({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 7:
                taskStatus = await setDataAllTaskPickup({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              case 10:
                taskStatus = await setDataAllTaskMigration({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask: id,
                  availableDays: dataAvailableDays,
                });
                break;
              case 11:
                taskStatus = await setDataAllTaskMigration({
                  step1,
                  step2,
                  step3: evidences,
                  step4,
                  step5,
                  idTask: id,
                  availableDays: dataAvailableDays,
                });
                break;
              case 12:
                taskStatus = await setDataAllTaskVisit({
                  step1,
                  step4,
                  step5,
                  idTask: id,
                });
                break;
              default:
                console.log(
                  'No se puede procesar, problemas con el tipo de tarea',
                );
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
                let photosReq = await setDataTaskPhotos({
                  step3: [item],
                  idTask: id,
                });
                console.log('[ UPLOAD PHOTO ]', photosReq);
                setTotalUpload(prev => prev + 1);
                setProgressAlert(prev => prev + 100 / evidences.length / 100);
              }

              await deleteStep('task', id);
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
      } else {
        console.log(
          '...............................[TaskComplete]............................',
          {
            step1,
            step2,
            evidences,
            step4,
            step5,
            idTask: id,
            typeTask: type,
          },
        );

        console.log(
          validArrayKingosStep2,
          validArrayAddonsStep2,
          step2.length,
          step4.length,
        );
        if (step2.length <= 0 || step4.length <= 0) {
          validArrayAddonsStep2 = true;
        }

        if (validArrayKingosStep2) {
          /* HERE */

          await updateStep(
            'TaskComplete',
            id,
            JSON.stringify({
              step1,
              step2,
              evidences,
              step4,
              step5,
              idTask: id,
              typeTask: type,
              availableDays: dataAvailableDays,
            }),
            0,
          );

          let dataTaskList = await getStep('taskList', 0, 0);
          getTaskData = JSON.parse(dataTaskList);
          console.log('TAAAAAAAASKKKKK', getTaskData.length, id);
          const filteredTasks = getTaskData.filter(item => item.idTask != id);
          await updateStep('taskList', 0, JSON.stringify(filteredTasks), 0);

          setShowProgressAlert(false);
          setIsAlert(false);
          navigation.navigate('Task', {
            status: true,
            title: 'Tarea completada',
            message:
              'Los datos de la tarea fueron almacendos, cuando recuperes la conexión a internet debes sincronizar para procesar la tarea.',
          });
        } else {
          setIsAlert(false);
          setTimeout(() => {
            setTitleAlert('¡Atención!');
            setMessageAlert(
              'No se encontraron datos para realizar la tarea. Debes sincronizar los datos.',
            );
            setShowAlert(true);
          }, 150);
        }
      }
    } catch (error) {
      console.log(error);
      setIsAlert(false);
      setTitleAlert('Error');
      setMessageAlert(error.message || 'Ha ocurrido un error.');
      setShowAlert(true);
    }
  };

  const handleClickCheck = (isChecked, taskStep, check) => {
    setStep5(prev => {
      return prev.map(item => {
        if (item.idTaskStep !== taskStep) return item;
        const updatedChecks = item.taskStepChecks.map(stepCheck => {
          if (stepCheck.idTaskStepCheck === check.idTaskStepCheck) {
            return {...stepCheck, checked: isChecked};
          }
          return stepCheck;
        });
        return {...item, taskStepChecks: updatedChecks};
      });
    });
  };

  const requestAllPermissions = async () => {
    try {
      let allPerssions = true;
      console.log('{ VERISON APP } ===> ', Platform.Version);
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      for (const permission in granted) {
        if (granted[permission] === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`${permission} permission granted`);
          allPerssions = true;
        } else if (
          Platform.Version > 30 &&
          (granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            granted[permission] === PermissionsAndroid.RESULTS.DENIED)
        ) {
          console.log(
            `${permission} permission denied Or denied with NEVER ASK AGAIN`,
          );
          allPerssions = false;
          setTitleAlert('Atención');
          setMessageAlert('Debes aceptar todos los permisos');
          setIsAlert(true);
          setTimeout(() => {
            setIsAlert(false);
            navigation.goBack();
          }, 1500);
          break;
        } else if (
          Platform.Version <= 30 &&
          granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          console.log(`${permission} permission unsupported`);
        }
      }
      return allPerssions;
    } catch (err) {
      console.error('{ PERMISSION ERROR } => ', err);
      setTitleAlert('Acepta los permisos');
      setMessageAlert('Debes aceptar todos los permisos');
      setIsAlert(true);
      setTimeout(() => {
        setIsAlert(false);
        navigation.goBack();
      }, 1500);
      return false;
    }
  };

  const handleClickStartServer = () => {
    requestAllPermissions()
      .then(res => {
        if (res) {
          BluetoothServerModule.startServer()
            .then(result => {
              console.log('Servidor iniciado', result);
              setStatusServer('Servidor iniciado');
              setStatusServerColor(colorsTheme.verdeClaro);
              setIsRunning(true);
            })
            .catch(error => {
              setStatusServer('Servidor apagado');
              setStatusServerColor(colorsTheme.rojo);
              setIsRunning(false);
              console.error('Error al iniciar el servidor', error);
            });
        } else {
          setTitleAlert('Atención');
          setMessageAlert('Debes aceptar todos los permisos');
          setIsRunning(false);
          setShowAlert(true);
        }
      })
      .catch(error => console.log(error));
  };

  const handleClickTransferData = async (action, data) => {
    try {
      const {idCustomer} = route.params;
      console.log('[ ACTION ] ==========> ', action);
      switch (action) {
        case 'CONFIG_CUSTOMER':
          setTransferStep(0);
          const customerData = await getStep('customers', idCustomer, 0);
          console.log({data: customerData, action: 'CONFIG_CUSTOMER'});
          BluetoothServerModule.sendJsonToClient({
            data: customerData,
            action: 'CONFIG_CUSTOMER',
          });
          setSuccessTransfer(prev => [...prev, 0]);
          break;
        case 'CONFIG_WALLET':
          setTransferStep(1);
          const walletData = await getStep('customersWallets', idCustomer, 0);
          console.log({data: walletData, action: 'CONFIG_WALLET'});
          BluetoothServerModule.sendJsonToClient({
            data: walletData,
            action: 'CONFIG_WALLET',
          });
          setSuccessTransfer(prev => [...prev, 1]);
          break;
        case 'CONFIG_TRANSACTION':
          setTransferStep(2);
          const transactionData = await getStep(
            'transactionWallets',
            idCustomer,
            0,
          );
          BluetoothServerModule.sendJsonToClient({
            data: transactionData,
            action: 'CONFIG_TRANSACTION',
          });
          setSuccessTransfer(prev => [...prev, 2]);
          break;
        case 'CONFIG_BALANCE':
          setTransferStep(3);
          const balanceData = await getStep('balanceWallets', idCustomer, 0);
          console.log({data: balanceData, action: 'CONFIG_BALANCE'});
          BluetoothServerModule.sendJsonToClient({
            data: balanceData,
            action: 'CONFIG_BALANCE',
          });
          setSuccessTransfer(prev => [...prev, 3]);
          break;
        case 'CONFIG_DEBET':
          setTransferStep(4);
          const debetData = await getStep('debetWallets', idCustomer, 0);
          // console.log({data: debetData, action: 'CONFIG_DEBET'});
          BluetoothServerModule.sendJsonToClient({
            data: debetData,
            action: 'CONFIG_DEBET',
          });
          setSuccessTransfer(prev => [...prev, 4]);
          break;
        case 'CONFIG_SALES':
          setTransferStep(5);
          const salesData = await getStep('saleWallets', idCustomer, 0);
          // console.log({data: salesData, action: 'CONFIG_SALES'});
          BluetoothServerModule.sendJsonToClient({
            data: salesData,
            action: 'CONFIG_SALES',
          });
          setSuccessTransfer(prev => [...prev, 5]);
          break;
        case 'CONFIG_CREDIT':
          setTransferStep(6);
          const creditData = await getStep('creditWallets', idCustomer, 0);
          BluetoothServerModule.sendJsonToClient({
            data: creditData,
            action: 'CONFIG_CREDIT',
          });
          setSuccessTransfer(prev => [...prev, 6]);
          break;
        case 'CONFIG_RULES':
          setTransferStep(7);
          const rulesData = await getStep('customerRules', 0, 0);
          BluetoothServerModule.sendJsonToClient({
            data: rulesData,
            action: 'CONFIG_RULES',
          });
          setSuccessTransfer(prev => [...prev, 7]);
          break;
        case 'CONFIG_PLANS':
          setTransferStep(8);
          const plansData = await getStep('customerPlans', 0, 0);
          BluetoothServerModule.sendJsonToClient({
            data: plansData,
            action: 'CONFIG_PLANS',
          });
          setSuccessTransfer(prev => [...prev, 8]);
          break;
        case 'CONFIG_PROMOTIONS':
          setTransferStep(9);
          const promotionData = await getStep('customerPromotions', 0, 0);
          BluetoothServerModule.sendJsonToClient({
            data: promotionData,
            action: 'CONFIG_PROMOTIONS',
          });
          setSuccessTransfer(prev => [...prev, 9, 10]);
          break;
        case 'CLOSE':
          if (data !== null) {
            console.log('[ CLOSE DATA ] ========> ', data);
            setDataBalance(data?.balance);
            setDataAvailableDays(data?.availableDays);
          }
          sheetRef.current?.close();
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceivedData = async event => {
    try {
      const {action, data} = JSON.parse(event.data);
      let sendResponse = 'NULL RESPONSE';
      if (action === 'AGENT_DATA') {
        console.log('How many times i sent this');
        console.log({
          title: action,
          description: 'TENDERO CONECTADO',
        });
        let userData = await AsyncStorage.getItem('@user');
        let dataLot = await getStep('uploadLots', 0, 0);
        sendResponse = {data: userData, lots: dataLot ? dataLot : [], action};
        BluetoothServerModule.sendJsonToClient(sendResponse);
        setCustomerConnect(true);
      } else {
        handleClickTransferData(action, data);
      }
    } catch (error) {
      console.log('[*-0-*]', error);
      return;
    }
  };

  useEffect(() => {
    handleDataList();
  }, [active]);

  useEffect(() => {
    try {
      if (typeTask == 10 || typeTask == 11) {
        const dataReceivedListener = eventEmitter.addListener(
          'DATA_SERVER_RECEIVED',
          event => {
            console.log('[ BLUETOOTH DATA 1] =>', event);
            handleReceivedData(event);
          },
        );
        return () => {
          // Cuando se desmonta el componente, detener el servidor y eliminar el suscriptor del evento
          BluetoothServerModule.stopServer()
            .then(res => {
              console.log('Servidor detenido', res);
              setStatusServer('Servidor detenido');
              setStatusServerColor(colorsTheme.naranja60);
              setIsRunning(false);
            })
            .catch(error =>
              console.error('Error al detener el servidor', error),
            );
          dataReceivedListener.remove();
          // dataBlueReceivedListener.remove();
        };
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const DefaultSteps = () => (
    <ProgressSteps
      completedProgressBarColor={colorsTheme.naranja}
      activeStepIconBorderColor={colorsTheme.naranja}
      activeStepIconColor={colorsTheme.naranja}
      activeLabelColor={colorsTheme.naranja}
      completedStepIconColor={colorsTheme.naranja}
      labelFontSize={13}
      activeLabelFontSize={15}
      activeStepNumColor={colorsTheme.blanco}
      marginBottom={35}
      activeStep={active}>
      {/* Pantalla Uno */}
      <ProgressStep label="Datos" scrollable={false} removeBtnRow={true}>
        {loading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: height * 0.5,
            }}>
            <ActivityIndicator size="large" color={colorsTheme.naranja} />
          </View>
        ) : (
          <FlatList
            key={'FlatList-1'}
            data={step1}
            renderItem={(item, index) =>
              InputsGenerateStep1(item, index, navigation)
            }
            keyExtractor={item => item.idScreenElement}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: '50%'}}
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
                  No se han encontrado Pantalla de inicio.
                </Text>
              </View>
            }
            ListFooterComponent={
              <ButtonProgressStep
                text="Siguiente"
                type={'right'}
                onPress={() => saveTemporalData('task', step1, active)}
              />
            }
          />
        )}
      </ProgressStep>
      {/* Pantalla Dos */}
      <ProgressStep
        label="Equipo y Complementos"
        scrollable={false}
        removeBtnRow={true}>
        <FlatList
          data={step2}
          renderItem={InputsGenerateStep2}
          keyExtractor={item => item.idTaskAddon}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                No se han encontrado Equipo.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <ButtonProgressStep
                text="Anterior"
                type={'left'}
                onPress={() => setActive(prev => prev - 1)}
              />
              <ButtonProgressStep
                text="Siguiente"
                type={'right'}
                onPress={() => saveTemporalData('task', step2, active)}
              />
            </View>
          }
        />
      </ProgressStep>
      {/* Pantalla Tres */}
      <ProgressStep label="Actividades" scrollable={false} removeBtnRow={true}>
        <FlatList
          style={{marginTop: 15}}
          data={step3}
          renderItem={InputsGenerateStep3}
          keyExtractor={item => item.idTaskStep}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                {'No se han encontrado pasos.'}
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View>
              <View>
                <Text
                  style={{
                    backgroundColor: colorsTheme.naranja,
                    padding: 15,
                    margin: 3,
                    borderRadius: 10,
                    flex: 8,
                    color: colorsTheme.blanco,
                    fontWeight: '700',
                  }}>
                  Actividades
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <ButtonProgressStep
                text="Anterior"
                type={'left'}
                onPress={() => setActive(prev => prev - 1)}
              />
              <ButtonProgressStep
                text="Siguiente"
                type={'right'}
                onPress={() => saveTemporalData('task', evidences, active)}
              />
            </View>
          }
        />
      </ProgressStep>
      {/* Pantalla Cuatro */}
      <ProgressStep
        label="Retirar De Tendero"
        scrollable={false}
        removeBtnRow={true}>
        <FlatList
          data={step4}
          renderItem={InputsGenerateStep4}
          keyExtractor={item => item.idReceivedAddon}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                No se han encontrado Equipo.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <ButtonProgressStep
                text="Anterior"
                type={'left'}
                onPress={() => setActive(prev => prev - 1)}
              />
              <ButtonProgressStep
                text="Siguiente"
                type={'complete'}
                onPress={() => saveTemporalData('task', step4, active)}
              />
            </View>
          }
        />
      </ProgressStep>
      {/* Pantalla Cinco */}
      <ProgressStep label={'Listado De Control'} removeBtnRow={true}>
        <FlatList
          data={step5}
          key={'Check-FlatList-1'}
          renderItem={InputsGenerateStep5}
          // keyExtractor={item => item.idReceivedAddon}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                No se han encontrado Equipo.
              </Text>
            </View>
          }
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
                onPress={() => saveTemporalData('task', step5, active)}
              />
              {/* <ButtonProgressStep text="Completar" type={'complete'} onPress={() => handleConsole()} /> */}
            </View>
          }
        />
      </ProgressStep>
    </ProgressSteps>
  );

  const VisitSteps = () => (
    <ProgressSteps
      completedProgressBarColor={colorsTheme.naranja}
      activeStepIconBorderColor={colorsTheme.naranja}
      activeStepIconColor={colorsTheme.naranja}
      activeLabelColor={colorsTheme.naranja}
      completedStepIconColor={colorsTheme.naranja}
      labelFontSize={11}
      activeLabelFontSize={13}
      activeStepNumColor={colorsTheme.blanco}
      marginBottom={35}
      activeStep={active}>
      {/* Pantalla Uno */}
      <ProgressStep label="Datos" scrollable={false} removeBtnRow={true}>
        {loading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: height * 0.5,
            }}>
            <ActivityIndicator size="large" color={colorsTheme.naranja} />
          </View>
        ) : (
          <FlatList
            key={'FlatList-1'}
            data={step1}
            renderItem={(item, index) =>
              InputsGenerateStep1(item, index, navigation)
            }
            keyExtractor={item => item.idScreenElement}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: '50%'}}
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
                  No se han encontrado Pantalla de inicio.
                </Text>
              </View>
            }
            ListFooterComponent={
              <ButtonProgressStep
                text="Siguiente"
                type={'right'}
                onPress={() => saveTemporalData('task', step1, active)}
              />
            }
          />
        )}
      </ProgressStep>
      {/* Pantalla Dos */}
      <ProgressStep label="Cobro" scrollable={false} removeBtnRow={true}>
        <View style={{marginHorizontal: 20, alignItems: 'center'}}>
          <ScrollView style={{height: '100%', width: '100%'}}>
            <HandshakeServerScreen
              header={false}
              description={'Realiza el cobro al tendero'}
              typeScreen={'task'}
              nextStep={() => setActive(prev => prev + 1)}
              previousStep={() => setActive(prev => prev - 1)}
            />
          </ScrollView>
        </View>
      </ProgressStep>
      {/* Pantalla Tre */}
      <ProgressStep
        label="Sincronización"
        scrollable={false}
        removeBtnRow={true}>
        <View style={{marginHorizontal: 20, alignItems: 'center'}}>
          <ScrollView style={{height: '100%', width: '100%'}}>
            <HandshakeServerScreen
              header={false}
              description={'Recopila la información de los lotes del tendero'}
              typeScreen={'task'}
              nextStep={() => setActive(prev => prev + 1)}
              previousStep={() => setActive(prev => prev - 1)}
            />
          </ScrollView>
        </View>
      </ProgressStep>
      {/* Pantalla Cuatro */}
      <ProgressStep label="Actividades" scrollable={false} removeBtnRow={true}>
        <FlatList
          style={{marginTop: 15}}
          data={step3}
          renderItem={InputsGenerateStep3}
          keyExtractor={item => item.idTaskStep}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                {'No se han encontrado pasos.'}
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View>
              <View>
                <Text
                  style={{
                    backgroundColor: colorsTheme.naranja,
                    padding: 15,
                    margin: 3,
                    borderRadius: 10,
                    flex: 8,
                    color: colorsTheme.blanco,
                    fontWeight: '700',
                  }}>
                  Actividades
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <ButtonProgressStep
                text="Anterior"
                type={'left'}
                onPress={() => setActive(prev => prev - 1)}
              />
              <ButtonProgressStep
                text="Siguiente"
                type={'right'}
                onPress={() => saveTemporalData('task', evidences, active)}
              />
            </View>
          }
        />
      </ProgressStep>
      {/* Pantalla Cinco */}
      <ProgressStep label={'Checklist'} removeBtnRow={true}>
        <FlatList
          data={step5}
          key={'Check-FlatList-1'}
          renderItem={InputsGenerateStep5}
          // keyExtractor={item => item.idReceivedAddon}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: '20%'}}
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
                No se han encontrado Equipo.
              </Text>
            </View>
          }
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
                onPress={() => saveTemporalData('task', step5, active)}
              />
              {/* <ButtonProgressStep text="Completar" type={'complete'} onPress={() => handleConsole()} /> */}
            </View>
          }
        />
      </ProgressStep>
    </ProgressSteps>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header isLeft={true} navigation={navigation} />
      <View style={{flex: 1, marginHorizontal: 20}}>
        {typeTask === 12 ? VisitSteps() : DefaultSteps()}
      </View>
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
              {totalUpload} de {evidences.length}
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
      <BottomSheet ref={sheetRef} snapPoints={snapPoints} index={-1}>
        <BottomSheetView>
          <View style={{margin: 20}}>
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  color: colorsTheme.naranja,
                  fontWeight: '700',
                  fontSize: 20,
                }}>
                {'CONFIGURACION DE TENDERO'}
              </Text>
              <Text
                style={{
                  color: colorsTheme.negro,
                  fontWeight: '200',
                  fontSize: 15,
                }}>
                <FontAwesome5
                  name={'dot-circle'}
                  color={statusServerColor}
                  size={18}
                />{' '}
                {statusServer}
              </Text>
            </View>
          </View>
          {!isRunning ? (
            <View style={{marginHorizontal: 20, alignItems: 'center'}}>
              <TouchableOpacity onPress={handleClickStartServer}>
                <Text
                  style={{
                    borderWidth: 1,
                    backgroundColor: colorsTheme.naranja,
                    borderColor: colorsTheme.blanco,
                    color: colorsTheme.blanco,
                    borderRadius: 8,
                    padding: 10,
                    textAlign: 'center',
                    width: width * 0.6,
                  }}>
                  {'Iniciar Serividor'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : !customerConnect ? (
            <Text
              style={{
                ...styles.tranferTitle,
                textAlign: 'center',
                marginHorizontal: 20,
              }}>
              {'Esperando que el tendero se conecte'}
            </Text>
          ) : (
            <View style={{marginHorizontal: 20}}>
              <View>
                <View style={{alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setSuccessTransfer([]);
                      handleClickTransferData('CONFIG_CUSTOMER');
                    }}>
                    <Text
                      style={{
                        borderWidth: 1,
                        backgroundColor: colorsTheme.naranja,
                        borderColor: colorsTheme.blanco,
                        color: colorsTheme.blanco,
                        borderRadius: 8,
                        padding: 10,
                        marginTop: 10,
                        textAlign: 'center',
                        width: width * 0.6,
                      }}>
                      {'Iniciar transferencia'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <FlatList
                data={TRANSACTION_LIST}
                renderItem={RenderTransactionList}
                numColumns={3}
                contentContainerStyle={{paddingBottom: height * 0.5}}
              />
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsTheme.blanco,
  },
  colorText: {
    color: colorsTheme.gris80,
  },
  inputForm: {
    fontSize: 17,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderRadius: 10,
  },
  buttonTextStyle: {
    backgroundColor: colorsTheme.naranja,
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    right: 0,
  },
  checkContainer: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderLeftColor: colorsTheme.naranja60,
    borderLeftWidth: 5,
    backgroundColor: colorsTheme.blanco,
    shadowColor: colorsTheme.gris80,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 6,
  },
  checkTitle: {
    fontSize: 17,
    color: colorsTheme.negro,
    borderBottomColor: colorsTheme.gris20,
    borderBottomWidth: 2,
    marginVertical: 10,
  },
  check: {
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginHorizontal: 2,
    borderLeftWidth: 2,
    borderColor: colorsTheme.gris20,
  },
  tranferTitle: {
    color: colorsTheme.negro,
    fontWeight: '400',
    fontSize: 15,
  },
  tranferTitleActive: {
    color: colorsTheme.naranja,
    fontWeight: '700',
    fontSize: 18,
  },
});

export default TaskDescriptionScreen;
