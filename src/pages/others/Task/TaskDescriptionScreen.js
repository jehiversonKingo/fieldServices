import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import { Dimensions } from 'react-native';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { ListItem } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
import orderBy from 'lodash/orderBy';

import Header from '../../../components/Layouts/Header';
import ButtonProgressStep from '../../../components/General/ButtonProgressStep';
import StepToDoComponent from '../../../components/General/StepToDoComponent';
import InputGenerateStep from '../../../components/General/InputGenerateStep';

import { handleChangeArray } from '../../../functions/functionChangeValue';
import {updateStep, deleteStep, getStep} from '../../../functions/fncSqlite';
import { hasCameraPermission } from '../../../functions/fncCamera';
import { handleValidDataStep, handleValidDataPhotos, handleValidExist } from '../../../functions/fncGeneral';

import { getElemetScreen, setDataAllTask } from '../../../services/task.services';
import { colorsTheme } from '../../../configurations/configStyle';

const { width, height } = Dimensions.get('screen');

import {Context as AuthContext} from '../../../context/AuthContext';
import { getAllCommunities } from '../../../services/settings.services';

const TaskDescriptionScreen = ({ navigation, route }) => {
  //Step
  const [active, setActive] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
                    <ListItem.Title> Fotos</ListItem.Title>
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
    <View key={index}>
      <View style={{ alignContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: width * 0.3, margin: 10 }}
        >
          <FitImage
            indicator={true}
            indicatorColor={colorsTheme.naranja}
            indicatorSize="large"
            source={{ uri: 'file://' + item.photo.path }}
            resizeMode="stretch"
            originalWidth={100}
            originalHeight={150}
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

  const onClickValidate = async (idTaskStep) => {
    const hasPermission = await hasCameraPermission();
    if (hasPermission) {
      navigation.navigate('CameraMultiShot', { setData: setEvidences, data: evidences, idTaskStep });
    }
  };

  const handleDataList = async () => {
    const { id } = route.params;
    console.log("[ PARAMS ]", route.params)
    let getDataScreen = [];
    let getCommunities = [];
    if(inline){
      getDataScreen = await getElemetScreen(id);
      getCommunities = await getAllCommunities();
      await updateStep('communities', 1, JSON.stringify(getCommunities), 0);
    }else{
      const comm = await getStep('communities', 1, 0);
      getDataScreen = JSON.parse(await getStep('taskDescription',id, 0));
      if (comm.length > 0) getCommunities = JSON.parse(comm);
    }
    const { screen, addon, steps, addonReceived } = getDataScreen;
    
    const newDataScreen = handleValidExist(screen, step1, 'idTaskScreenElement', 1);
    setStep1(orderBy(newDataScreen, ['order'], ['asc']));
    setCommunities(getCommunities);

    const newDataAddon = handleValidExist(addon, step2, 'idTaskAddon', 2);
    newDataAddon.length == 0 && setStepFlag2(true);
    setStep2(orderBy(newDataAddon, ['order'], ['asc']));

    const newDataSteps = handleValidExist(steps, step3, 'idTaskStep', 3);
    setStep3(orderBy(newDataSteps, ['order'], ['asc']));

    const newDataAddonReceived = handleValidExist(addonReceived, step4, 'idReceivedAddon', 4);
    newDataAddonReceived.length == 0 && setStepFlag4(true);
    console.log(newDataAddonReceived.length, newDataAddonReceived)
    setStep4(orderBy(newDataAddonReceived, ['order'], ['asc']));

    let locationExpanded = [];
    newDataAddonReceived.forEach(() => {
      locationExpanded.push(false);
    });
    setExpanded(locationExpanded);
    setLoading(false);
  };

  const saveTemporalData = async (dbTable ,step, active) => {
    try {
      console.log(active, step)
      const { id } = route.params;
      let isValid = false;

      isValid = await handleValidDataStep(step);
      
      if(active == 1 && stepFlag2 == true){ 
        isValid = true;
      }else if(active == 3 && stepFlag4 == true){
        isValid = true; 
      }

      console.log('.....', active, stepFlag4)

      if(active == 2){
        let samephotos = await handleValidDataPhotos(step3, evidences);
        samephotos.length == 0&&isValid==true;
      }

      if (isValid === false){
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

      if (active === 3){
        completeTask();
        return;
      }

      setActive(prev => prev + 1);

    } catch (error) {
      console.log('[ ERROR SAVE TEMPORAL DATA ] => ', error);
    }
  };

  const changeSteteTask = async () => {
    const { id } = route.params;
    let dataTaskList = JSON.parse(await getStep('taskList',0,0));
    if (dataTaskList) {
      let newData = dataTaskList.find(item => item.idTask == id);
      let index = dataTaskList.indexOf(item => item.idTask == id);
      let formatNewData = {
        ...newData,
        task: {
          ...newData.task,
          idTaskState: 2
        }
      }
      console.log("[ index ]", index);
      dataTaskList[index] = formatNewData;
      console.log({idTask: dataTaskList[index].idTask, state: dataTaskList[index].task.idTaskState});
      let comprobar = dataTaskList.find(item => item.idTask == id);
      console.log("COMPORBACIóN", {idTask: comprobar.idTask, state: comprobar.task.idTaskState})
      // await updateStep('taskList',0, JSON.stringify(formatNewData), 0);
    }
  }

  const completeTask = async () => {
    try {
      const { id } = route.params;
      setIsAlert(true);
      setTitleAlert('Cargando Datos, Espere por favor');
      
      let dataKingos = await getStep('warehouseEquipment',0,0);
      let dataAddons = await getStep('warehouseAddon',0,0);
      let validArrayKingosStep2 = false;
      let validArrayAddonsStep2 = false;
      let inventoryKingo = [];
      let inventoryAddon = [];
	  
      console.log(typeof dataKingos, typeof dataAddons);
      if(typeof dataKingos === 'string' || typeof dataAddons === 'string'){
        if (JSON.parse(dataKingos).length > 0) {
          JSON.parse(dataKingos).map(item => inventoryKingo.push(item.barcode));
        }

        if (JSON.parse(dataAddons).length > 0) {
          JSON.parse(dataAddons).map(item => inventoryAddon.push(item.barcode));
        }

        step2.forEach(item => {
          if (item.value.match(/E/g)){

            if (inventoryKingo.includes(item.value)) {
              validArrayKingosStep2 = true;
            } else validArrayKingosStep2 = false;

          } else {

            if (inventoryAddon.includes(item.value)) {
              validArrayAddonsStep2 = true;
            } else validArrayAddonsStep2 = false;

          };
        });
        
        if(inline){
            console.log("[ VALIDATE ] >>", validArrayKingosStep2, validArrayAddonsStep2);
            if (validArrayKingosStep2 || validArrayAddonsStep2) {
              let taskStatus = await setDataAllTask({ step1, step2, evidences, step4, idTask: id });
              await deleteStep('task', id);
              console.log(taskStatus)
              navigation.navigate('Task', { taskStatus });
            } else {
              setIsAlert(false);
              setTimeout(() => {
                setTitleAlert('Error');
                setMessageAlert('Alguno de los barcodes que ingresaste no existen en tu bodega.');
                setShowAlert(true);
              }, 150)
            }
          
        } else {
          console.log("ENTRO AL ELSE")
          await updateStep('TaskComplete', id, JSON.stringify({ step1, step2, evidences, step4, idTask: id }), 0)
          if (validArrayKingosStep2 || validArrayAddonsStep2) {
            // await changeSteteTask();
            setTimeout(() => {
              setIsAlert(false)
              navigation.navigate('Task', {
                status: true,
                message: "Tarea Insertada en Cola",
                title: "Cuando Recupere Conexión a internet se enviara.",
              });
            }, 2500)
          } else {
            setIsAlert(false);
            setTimeout(() => {
              setTitleAlert('Error');
              setMessageAlert('Alguno de los barcodes que ingresaste no existen en tu bodega.');
              setShowAlert(true);
            }, 150);
          }
        }
      } else {
        setIsAlert(false);
        setTimeout(() => {
          setTitleAlert('¡Atención!');
          setMessageAlert('Debes cargar datos antes de salir a realizar una tarea.');
          setShowAlert(true);
        }, 150)
      }
    } catch (error) {
      console.log("[ ERROR ] >>", error)
    }
  };

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
                      No se han encontrado pasos.
                    </Text>
                </View>
                }
              ListHeaderComponent={
                <View>
                  <View>
                    <Text style={{ backgroundColor: colorsTheme.naranja, padding: 15, margin: 3, borderRadius: 10, flex: 8, color: colorsTheme.blanco, fontWeight: '700' }}>Actividades</Text>
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
                  <ButtonProgressStep text="Completar" type={'complete'} onPress={() => saveTemporalData('task', step4, active)} />
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
});

export default TaskDescriptionScreen;
