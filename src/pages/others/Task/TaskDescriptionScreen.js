import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import { Dimensions } from 'react-native';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { ListItem } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
import * as Progress from 'react-native-progress';
import orderBy from 'lodash/orderBy';

import Header from '../../../components/Layouts/Header';
import ButtonProgressStep from '../../../components/General/ButtonProgressStep';
import StepToDoComponent from '../../../components/General/StepToDoComponent';
import InputGenerateStep from '../../../components/General/InputGenerateStep';

import { handleChangeArray } from '../../../functions/functionChangeValue';
import {updateStep, deleteStep, getStep} from '../../../functions/fncSqlite';
import { hasCameraPermission } from '../../../functions/fncCamera';
import { handleValidDataStep, handleValidDataPhotos, handleValidExist } from '../../../functions/fncGeneral';

import { getCheckListByIdTask, getElemetScreen, setDataAllTask, setDataAllTaskInstall, setDataAllTaskPickup, setDataAllTaskSwap, setDataTaskChecklist, setDataTaskEvidens, setDataTaskPhotos } from '../../../services/task.services';
import { colorsTheme } from '../../../configurations/configStyle';

const { width, height } = Dimensions.get('screen');

import {Context as AuthContext} from '../../../context/AuthContext';
import { getAllCommunities } from '../../../services/settings.services';

const TaskDescriptionScreen = ({ navigation, route }) => {
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

  const [step1, setStep1] = useState([]);
  const [step2, setStep2] = useState([]);
  const [stepFlag2, setStepFlag2] = useState(false);
  const [step3, setStep3] = useState([]);
  const [step4, setStep4] = useState([]);
  const [stepFlag4, setStepFlag4] = useState(false);
  const [step5, setStep5] = useState([]);
  const [stepFlag5, setStepFlag5] = useState(false);

  const {state} = useContext(AuthContext);
  const {inline} = state;

  const InputsGenerateStep1 = ({ item, index }) => (
      <InputGenerateStep
        elementId={'idTaskScreenElement'}
        item={item}
        index={index}
        navigation={navigation}
        objWithData={step1}
        setFunction={setStep1}
        setIsAlert={setIsAlert}
        setMessageAlert={setMessageAlert}
        setTitleAlert={setTitleAlert}
        selectData={communities}
        selectLabel={"name"}
        selectValue={"idCommunity"}
      />
  );

  const InputsGenerateStep2 = ({ item, index }) =>(
    <InputGenerateStep
      item={item}
      elementId={'idTaskAddon'}
      index={index}
      navigation={navigation}
      objWithData={step2}
      setFunction={setStep2}
    />
  );

  const InputsGenerateStep3 = ({ item, index }) => {
    let customEvidence = evidences.filter(image => image.idTaskStep === item.idTaskStep);
    return (
      <>
        <StepToDoComponent
          item={item}
          index={index}
          onClickStep={() => navigation.navigate('Onboarding', { idStep: item.idStep })}
          onClickValidate={() => onClickValidate(item.idTaskStep)}
        />
        <View>
          {customEvidence.length > 0 && (
            <ListItem.Accordion
              content={
                <>
                  <Ionicons
                    name={'camera'}
                    size={30}
                    style={styles.iconImg}
                  />
                  <ListItem.Content>
                    <ListItem.Title> Fotos ({customEvidence.length})</ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded[index]}
              onPress={() => {
                handleChangeArray(index, !expanded[index], expanded, setExpanded);
              }}
            >
              <FlatList
                key={`FlatListImg-${index}`}
                data={customEvidence}
                renderItem={step3PhotoItem}
                numColumns={3}
                keyExtractor={item => item.idTaskStep}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: '10%', marginTop: 50 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
              />
            </ListItem.Accordion>
          )}
        </View>
      </>
    );
  };

  const step3PhotoItem = ({ item, index }) => (
    <View key={`P-${index}`}>
      <View style={{ alignContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: width * 0.3, margin: 1 }}
        >
          <FitImage
            indicator={true}
            indicatorColor={colorsTheme.naranja}
            indicatorSize="large"
            source={{ uri: 'file://' + item.path }}
            resizeMode="contain"
            // originalWidth={100}
            // originalHeight={150}
            // style={{ width: 100 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputsGenerateStep4 = ({ item, index }) => (
      <InputGenerateStep
        item={item}
        elementId={'idReceivedAddon'}
        index={index}
        navigation={navigation}
        objWithData={step4}
        setFunction={setStep4}
      />
  );

  const InputsGenerateStep5 = ({ item, index }) => {
    const step = item;
    return (
      <View key={`step-${index}`}>
        <Text style={styles.checkTitle}>{step?.step?.name}</Text>
        <FlatList
          data={step?.taskStepChecks ? step?.taskStepChecks.filter(a => ["Agente"].includes(a.access)) : []}
          key={`check-${index}`}
          renderItem={({item, index}) => (
            <View style={styles.checkContainer}>
              <View key={`B-${index}`} style={{flexDirection: 'row'}}>
                <View key={`C-${index}`}>
                  <Text style={{fontSize: 15, fontWeight: '500', width: 280, color: colorsTheme.negro}}>
                    {item?.check?.description || ""}
                  </Text>
                </View>
                <View style={styles.check}>
                  <BouncyCheckbox
                    size={25}
                    fillColor={colorsTheme.naranja}
                    unFillColor="#FFFFFF"
                    iconStyle={{ borderColor: colorsTheme.naranja }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ fontFamily: "JosefinSans-Regular" }}
                    hitSlop={{top: 30, bottom: 30, left: 50, right: 50}}
                    onPress={(isChecked) => handleClickCheck(isChecked, step.idTaskStep, item)}
                    isChecked={item.checked}
                  />
                </View>
              </View>
            </View>
          )}
        />
      </View>
    )};

  const onClickValidate = async (idTaskStep) => {
    const hasPermission = await hasCameraPermission();
    if (hasPermission) {
      navigation.navigate('CameraMultiShot', { setData: setEvidences, data: evidences, idTaskStep });
    }
  };

  const handleDataList = async () => {
    console.log("[ PARAMS ]", route.params)
    const { id } = route.params;
    let getDataScreen = [];
    let getCommunities = [];
    if (inline) {
      const [screenData, communitiesData] = await Promise.all([getElemetScreen(id), getAllCommunities()]);
      getDataScreen = screenData;
      getCommunities = communitiesData;
      await updateStep('communities', 1, JSON.stringify(communitiesData), 0);
    } else {
      const comm = await getStep('communities', 1, 0);
      getDataScreen = JSON.parse(await getStep('taskDescription',id, 0));
      if (comm.length > 0) getCommunities = JSON.parse(comm);
    }

    if (!getDataScreen || !getCommunities) {
      setShowAlert(true);
      setTitleAlert('¡Atención!');
      setMessageAlert('Es posible que hagan falta algunos datos.');
    }

    const { screen, addon, steps, addonReceived, stepsChecks } = getDataScreen;

    if (!screen || !addon || !steps || !addonReceived || !stepsChecks) {
      setShowAlert(true);
      setTitleAlert('¡Atención!');
      setMessageAlert('Error en la estructura de los datos obtenidos.');
    }

    const newDataScreen = handleValidExist(screen, step1, 'idTaskScreenElement', 1);
    const newDataAddon = handleValidExist(addon, step2, 'idTaskAddon', 2);
    const newDataSteps = handleValidExist(steps, step3, 'idTaskStep', 3);
    const newDataAddonReceived = handleValidExist(addonReceived, step4, 'idReceivedAddon', 4);
    const newDataChecks = handleValidExist(stepsChecks, step5, 'idTaskStep', 5)

    if (newDataAddon.length == 0) setStepFlag2(true);
    if (newDataAddonReceived.length == 0) setStepFlag4(true);
    if (newDataChecks.length == 0) setStepFlag5(true);

    setStep1(orderBy(newDataScreen, ['order'], ['asc']));
    setStep2(orderBy(newDataAddon, ['order'], ['asc']));
    setStep3(orderBy(newDataSteps, ['order'], ['asc']));
    setStep4(orderBy(newDataAddonReceived, ['order'], ['asc']));
    setStep5(orderBy(newDataChecks, ['order'], ['asc']));

    setCommunities(getCommunities);

    const locationExpanded = new Array(newDataAddonReceived.length).fill(false);
    setExpanded(locationExpanded);

    setLoading(false);
  };

  const saveTemporalData = async (dbTable ,step, active) => {
    try {
      const {id} = route.params;
      let isValid = false;

      isValid = await handleValidDataStep(step);

      if ((active === 1 && stepFlag2) || (active === 3 && stepFlag4)) {
        isValid = true;
      }

      if(active == 2) {
        let samephotos = await handleValidDataPhotos(step3, evidences);
        samephotos.length == 0 && isValid == true;
      }

      if (active === 4) {
        step5.forEach(item => {
          item.taskStepChecks
            .filter(item => item.access === "Agente")
            .forEach(check => {
              if(!check.checked) {
                isValid = false;
              }
            })
        });
      }

      if (isValid === false) {
        setShowAlert(true);
        setTitleAlert('¡Atención!');
        setMessageAlert('Debes ingresar todos los datos');
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
        return;
      } else {
        await updateStep(dbTable, id, step, active)
      }

      if (active === 4){
        console.log("[ UPLOAD TASK ]");
        completeTask();
        return;
      }

      setActive(prev => prev + 1);

    } catch (error) {
      console.log('[ ERROR SAVE TEMPORAL DATA ] => ', error);
    }
  };

  const completeTask = async () => {
    try {
        const { id, type } = route.params;
        setIsAlert(true);
        setTitleAlert('Iniciando proceso');
        setMessageAlert('');
        let dataKingos = JSON.parse(await getStep('warehouseEquipment',0,0));
        let dataAddons = JSON.parse(await getStep('warehouseAddon',0,0));

        let inventoryKingo = dataKingos.length > 0 ? dataKingos.map(item => item.barcode) : [];
        let inventoryAddon = dataAddons.length > 0 ? dataAddons.map(item => item.barcode) : [];

        let validArrayKingosStep2 = false;
        let validArrayAddonsStep2 = false;

        if (type !== 7) { // is different to pickup
            validArrayKingosStep2 = step2.some(item => {
              if (/^E/i.test(item.value)) {
                return inventoryKingo.includes(item.value)
              } else if (/^A/i.test(item.value)) {
                console.log(inventoryAddon);
                return inventoryAddon.includes(item.value)
              } else return false
            });
        } else {
            validArrayKingosStep2 = true;
            validArrayAddonsStep2 = true;
        }

        if (inline) {
          if (validArrayKingosStep2) {
            let responseCheck = await setDataTaskChecklist({step5, idTask: id});
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('Válidando checklist');
              setMessageAlert('');
              setIsAlert(true);
            }, 300)
            if (responseCheck?.status) {
              let taskStatus = null;
              setIsAlert(false);
              setTimeout(() => {
                setTitleAlert('Cargando Datos, Espere por favor');
                setMessageAlert('');
                setIsAlert(true);
              }, 200)
              switch (type) {
                case 1:
                case 2:
                    taskStatus = await setDataAllTaskInstall({ step1, step2, step3: null, step4, step5, idTask: id });
                    break;
                case 6:
                    taskStatus = await setDataAllTaskSwap({ step1, step2, step3: evidences, step4, step5, idTask: id });
                    break;
                case 7:
                    taskStatus = await setDataAllTaskPickup({ step1, step2, step3: evidences, step4, step5, idTask: id });
                    break;
                default:
                    setIsAlert(false);
                    setTimeout(() => {
                      setTitleAlert('¡Atención!');
                      setMessageAlert('No se puede procesar, problemas con el tipo de tarea');
                      setShowAlert(true);
                    }, 150)
              }

              if (taskStatus?.status) {
                  setIsAlert(false);
                  setTimeout(() => {
                    setShowProgressAlert(true);
                  }, 300)

                  for (let i = 0; i < evidences.length; i++) {
                      const item = evidences[i];
                      let photosReq = await setDataTaskPhotos({ step3: [item], idTask: id });
                      console.log("[ UPLOAD PHOTO ]", photosReq)
                      setTotalUpload(prev => prev + 1);
                      setProgressAlert(prev => prev + (100 / evidences.length) / 100);
                  }

                  await deleteStep('task', id);
                  setShowProgressAlert(false);
                  navigation.navigate('Task', { taskStatus });
              } else {
                setIsAlert(false);
                setTimeout(() => {
                  setTitleAlert('Error');
                  setMessageAlert(taskStatus?.message || 'No se puedieron cargar los datos de la tarea.');
                  setShowAlert(true);
                }, 150)
              }
            } else {
              setIsAlert(false);
              setTimeout(() => {
                setTitleAlert('¡Atención!');
                setMessageAlert('Debes cargar datos antes de salir a realizar una tarea.');
                setShowAlert(true);
              }, 150)
            }
          } else {
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('Error');
              setMessageAlert('Alguno de los barcodes que ingresaste no existen en tu bodega.');
              setShowAlert(true);
            }, 150);
          }
        } else {
          await updateStep('TaskComplete', id, JSON.stringify({ step1, step2, evidences, step4, idTask: id }), 0);
          if (validArrayKingosStep2 || validArrayAddonsStep2) {
              setTimeout(() => {
                  setIsAlert(false);
                  navigation.navigate('Task', {
                      status: true,
                      message: "Tarea Insertada en Cola",
                      title: "Cuando Recupere Conexión a internet se enviará.",
                  });
              }, 2500);
          } else {
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('¡Atención!');
              setMessageAlert('Debes cargar datos antes de salir a realizar una tarea.');
              setShowAlert(true);
            }, 150)
          }
        }
    } catch (error) {
        setIsAlert(false);
        setTimeout(() => {
            setTitleAlert('Error');
            setMessageAlert(error.message || 'Ha ocurrido un error.');
            setShowAlert(true);
        }, 150);
    }
};

  const handleClickCheck = (isChecked, taskStep, check) => {
    setStep5(prev => {
      return prev.map(item => {
        if (item.idTaskStep !== taskStep) return item;
        const updatedChecks = item.taskStepChecks.map(stepCheck => {
          if (stepCheck.idTaskStepCheck === check.idTaskStepCheck) {
            return { ...stepCheck, checked: isChecked };
          }
          return stepCheck;
        });
        return { ...item, taskStepChecks: updatedChecks };
      });
    });
  }

  useEffect(() => {
    handleDataList();
  }, [active]);

  return (
    <SafeAreaView style={styles.container}>
      <Header isLeft={true} navigation={navigation} />
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
          marginBottom={35}
          activeStep={active}
        >
          <ProgressStep
            label="Datos"
            scrollable={false}
            removeBtnRow={true}
          >
            {
              loading ?
                (
                  <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.5 }}>
                    <ActivityIndicator size="large" color={colorsTheme.naranja} />
                  </View>
                ) : (
                  <FlatList
                    key={'FlatList-1'}
                    data={step1}
                    renderItem={(item, index) => InputsGenerateStep1(item, index, navigation)}
                    keyExtractor={item => item.idScreenElement}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: '50%' }}
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
                    ListFooterComponent={<ButtonProgressStep text="Siguiente" type={'right'} onPress={() => saveTemporalData('task', step1, active)} />}
                    // ListFooterComponent={<ButtonProgressStep text="Siguiente" type={'right'} onPress={() => changeSteteTask()} />}
                  />
                )
            }
          </ProgressStep>
          <ProgressStep
            label="AddOns       kingo"
            scrollable={false}
            removeBtnRow={true}>
            <FlatList
              data={step2}
              renderItem={InputsGenerateStep2}
              keyExtractor={item => item.idTaskAddon}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: '20%' }}
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
                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                  <ButtonProgressStep text="Anterior" type={'left'} onPress={() => setActive(prev => prev - 1)} />
                  <ButtonProgressStep text="Siguiente" type={'right'} onPress={() => saveTemporalData('task', step2, active)} />
                </View>
              }
            />
          </ProgressStep>
          <ProgressStep
            label="Actividades a realizar"
            scrollable={false}
            removeBtnRow={true}
          >
            <FlatList
              style={{ marginTop: 15 }}
              data={step3}
              renderItem={InputsGenerateStep3}
              keyExtractor={item => item.idTaskStep}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: '20%' }}
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
                      {"No se han encontrado pasos."}
                    </Text>
                </View>
                }
              ListHeaderComponent={
                <View>
                  <View>
                    <Text style={{backgroundColor: colorsTheme.naranja, padding: 15, margin: 3, borderRadius: 10, flex: 8, color: colorsTheme.blanco, fontWeight: '700'}}>Actividades</Text>
                  </View>
                </View>
              }
              ListFooterComponent={
                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                  <ButtonProgressStep text="Anterior" type={'left'} onPress={() => setActive(prev => prev - 1)} />
                  <ButtonProgressStep text="Siguiente" type={'right'} onPress={() => saveTemporalData('task', evidences, active)} />
                </View>
              }
            />
          </ProgressStep>
          <ProgressStep
            label="Equipo Recorgido"
            scrollable={false}
            removeBtnRow={true}>
            <FlatList
              data={step4}
              renderItem={InputsGenerateStep4}
              keyExtractor={item => item.idReceivedAddon}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: '20%' }}
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
                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                  <ButtonProgressStep text="Anterior" type={'left'} onPress={() => setActive(prev => prev - 1)} />
                  <ButtonProgressStep text="Siguiente" type={'complete'} onPress={() => setActive(prev => prev + 1)} />
                </View>
              }
            />
          </ProgressStep>
          <ProgressStep
            label={'Checklist'}
            removeBtnRow={true}
          >
            <FlatList
              data={step5}
              key={"Check-FlatList-1"}
              renderItem={InputsGenerateStep5}
              // keyExtractor={item => item.idReceivedAddon}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: '20%' }}
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
                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                  <ButtonProgressStep text="Anterior" type={'left'} onPress={() => setActive(prev => prev - 1)} />
                  <ButtonProgressStep text="Completar" type={'complete'} onPress={() => saveTemporalData('task', step5, active)} />
                  {/* <ButtonProgressStep text="Completar" type={'complete'} onPress={() => handleConsole()} /> */}
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
        title={"Cargando Imagenes..."}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        customView={
          <View>
            <Text style={{color: "black", textAlign: "center"}}>{totalUpload} de {evidences.length}</Text>
            <Progress.Bar
              progress={progressAlert}
              width={200}
              color={colorsTheme.naranja}
              animated={true}
              animationType='spring'
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    margin:5,
    padding: 10,
    borderRadius:10,
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
    justifyContent: "center",
    paddingHorizontal: 5,
    marginHorizontal: 2,
    borderLeftWidth: 2,
    borderColor: colorsTheme.gris20
  }
});

export default TaskDescriptionScreen;
